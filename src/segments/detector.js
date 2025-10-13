let detector;
let messageElement;
let videoElement;

let gameActive = false;
let currentCue = "";
let winnerDeclared = false;

let onPlayerCountUpdate = null;

export function setOnPlayerCountUpdate(callback) {
    onPlayerCountUpdate = callback;
}

function resizeCanvasToVideo(canvas, video) {
    const { videoWidth, videoHeight } = video;

    canvas.width = videoWidth;
    canvas.height = videoHeight;

    canvas.style.width = video.style.width;
    canvas.style.height = video.style.height;
}


let shootingWindowTimeOut = null;

const playerLives = [2,2];
let playerShotTimes = [null, null];

let resetTimeoutId = null;
let cueIntervalId = null;
export function setCueIntervalId(id){
    cueIntervalId = id;
}


export function setGameLogic({messageEl, videoEl}){
    messageElement = messageEl;
    videoElement = videoEl;
}

export function setGameCue(word){
    currentCue = word;

    if (shootingWindowTimeOut) {
        clearTimeout(shootingWindowTimeOut);
        shootingWindowTimeOut = null;
    }

    gameActive = true;
    playerShotTimes = [null, null];

    if(word === "Fuego"){
        // Realmente no se debe hacer nada. Se espera a que alguien gane
    }
    else{
        shootingWindowTimeOut = setTimeout(() => {
            gameActive = false;
            currentCue = "";
            messageElement.textContent = "";
            shootingWindowTimeOut = null;
        }, 2000);
    }
}


export async function initDetector() {
    detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet,{
        modelType: poseDetection.movenet.modelType.MULTIPOSE_LIGHTNING,
        enableSmoothing: true,
        maxPoses: 2
    });
    console.log("Detector de poses listo (Multipose)")
}

function calculateAngle(sh, el, wr){
    const ab = {x: el.x - sh.x, y: el.y - sh.y};
    const cb = {x: el.x - wr.x, y: el.y - wr.y};

    const dot = (ab.x * cb.x) + (ab.y * cb.y);
    const magAB = Math.sqrt(ab.x * ab.x + ab.y * ab.y);
    const magCB = Math.sqrt(cb.x * cb.x + cb.y * cb.y);

    const angledRad = Math.acos( dot / (magAB * magCB));
    const angleDeg = angledRad * (180 / Math.PI);
    return angleDeg;
}

function getArmDirectionAngle(shoulder, wrist){
    const dx = wrist.x - shoulder.x;
    const dy = wrist.y - shoulder.y;

    const angleRad = Math.atan2(dy,dx);
    const angleDeg = angleRad * (180 / Math.PI);
    return angleDeg; 
}

function detectGunPose() {
    return true; // Implementaré algo con Googlehand pipes luego
}

function declareWinner(winnerIndex){
    winnerDeclared = true;
    gameActive = false;
    messageElement.textContent = `¡Jugador ${winnerIndex + 1} gana!`;
    console.log(`¡Jugador ${winnerIndex + 1} gana!`);

    if (cueIntervalId) {
        clearInterval(cueIntervalId);
        cueIntervalId = null;
    } //Parar el loop por si acaso otros clears no se han realizado.

    if (shootingWindowTimeOut) {
        clearTimeout(shootingWindowTimeOut);
        shootingWindowTimeOut = null;
    }
    
    //Falta lógica de captura 
}

export async function detectPose() {
    const poses = await detector.estimatePoses(videoElement);
    console.log(`Personas detectadas: ${poses.length}`);

    if (onPlayerCountUpdate) {
        onPlayerCountUpdate(poses.length);
    }

    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    resizeCanvasToVideo(canvas, videoElement);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (poses.length !== 2) { // Normalmente !==2
        messageElement.textContent = "¡Se necesitan dos jugadores!";
        requestAnimationFrame(detectPose);
        return;
    }

    poses.sort((a, b) => {
        const ax = a.keypoints.reduce((sum,kp) => sum + kp.x, 0) / a.keypoints.length; // promedio de posición
        const bx = b.keypoints.reduce((sum,kp) => sum + kp.x, 0) / b.keypoints.length;
        return bx-ax;
    })

    // ! P1 = IZQUIERDA
    // ? P2 = DERECHA

    const PlayerStates = [null, null];

    poses.forEach((pose, index) => {
        pose.keypoints.forEach(kp => {
            if (kp.score > 0.3) {
                ctx.beginPath();
                ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
                ctx.fillStyle = "lime";
                ctx.shadowColor = 'grey';
                ctx.shadowBlur = 10;
                ctx.fill();
            }
        });

        const isLeft = (index === 0);

        const shoulder = pose.keypoints.find(kp => kp.name === ( isLeft ? 'left_shoulder' :'right_shoulder') && kp.score > 0.3);
        const elbow = pose.keypoints.find(kp => kp.name === ( isLeft ? 'left_elbow' : 'right_elbow') && kp.score > 0.3);
        const wrist = pose.keypoints.find(kp => kp.name === (isLeft ? 'left_wrist' : 'right_wrist') && kp.score > 0.3);

        if(shoulder && wrist && elbow){
            ctx.beginPath();
            ctx.moveTo(shoulder.x, shoulder.y);
            ctx.lineTo(elbow.x, elbow.y);
            ctx.lineTo(wrist.x, wrist.y);
            ctx.strokeStyle = isLeft ? "orange" : "cyan";
            ctx.lineWidth = 3;
            ctx.stroke();
        }

        if(!shoulder || !wrist || !elbow || shoulder.score < 0.3 || wrist.score < 0.3 || elbow.score < 0.3){
            console.warn("No se encontraron todos los keypoints. Omitiendo cálculo.")
            PlayerStates[index] = null;
        }
    
        else{
            const angle = calculateAngle(shoulder, elbow, wrist);
            const directionAngle = getArmDirectionAngle(shoulder, wrist);
            console.log(`[Jugador ${index + 1}]\nÁngulo del codo: ${angle}\nDirección del brazo: ${directionAngle}`);
    
            const validElbow = (angle >= 60 && angle <= 90);
            const validDirection = (directionAngle >= 0 && directionAngle <= 180);
            const gunPose = detectGunPose();
            // Pretty much placeholder angles frfrf

            PlayerStates[index] ={
                validElbow,
                validDirection,
                gunPose,
                index
            }
        }
    });


    if (gameActive && !winnerDeclared){
        if(PlayerStates[0] && PlayerStates[1]) {
            if(currentCue === "Fuego"){

                const shooters = [];
                PlayerStates.forEach((ps, i) => {
                    if (ps.validElbow && ps.validDirection && ps.gunPose){
                        if(!playerShotTimes[i]) playerShotTimes[i] = performance.now();
                        shooters.push(i);
                    }
                });

                if(shooters.length === 0) {
                    messageElement.textContent = "Esperando disparo..."
                }
                else if(shooters.length === 1){
                    declareWinner(shooters[0]);
                }
                else if(shooters.length === 2){
                    const winnerIndex = playerShotTimes[0] < playerShotTimes[1] ? 0 : 1;
                    declareWinner(winnerIndex);
                }
                
                let errors = [];
                PlayerStates.forEach((ps, i) => {
                if (!ps.validElbow || !ps.validDirection){
                    if (!ps.validElbow){
                    errors.push(`¡Jugador ${i + 1} tiene mala puntería!`);
                    }
                    else if (!ps.validDirection) {
                    errors.push(`Jugador ${i + 1} apunta mal!`);
                    }
                }
                });
                if (errors.length > 0) {
                messageElement.innerHTML = errors.join("<br>");
                }
            }
            else {
                PlayerStates.forEach((ps, i) => {
                    if (ps.validElbow && ps.validDirection && ps.gunPose) {
                        playerLives[i]--;
                        messageElement.textContent = `Jugador ${i + 1} se adelantó... (${playerLives[i]} vidas restantes)`;
                        
                        if(playerLives[i] === 0){
                            winnerDeclared = true;
                            messageElement.textContent = `¡Jugador ${i + 1} descalificado por IMPACIENTE!`;
                            if (cueIntervalId){
                                clearInterval(cueIntervalId);
                                cueIntervalId = null;
                            }
                        }
                    }
                    
                });
            }
        }
    }

    if (winnerDeclared && !resetTimeoutId) {
        resetTimeoutId = setTimeout(() => {
            winnerDeclared = false;
            playerLives[0] = 2;
            playerLives[1] = 2;
            playerShotTimes[0] = null;
            playerShotTimes[1] = null;
            messageElement.textContent = "¿Otra ronda?";
            resetTimeoutId = null;
        }, 4000);
    }

    requestAnimationFrame(detectPose);
}