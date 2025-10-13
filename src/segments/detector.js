let detector;
let messageElement;
let videoElement;

let gameActive = false;
let currentCue = "";
let winnerDeclared = false;
// let falseAttempts = 0;

const playerLives = [2,2];
let playerShotTimes = [null, null];

export function setGameLogic({messageEl, videoEl}){
    messageElement = messageEl;
    videoElement = videoEl;
}

export function setGameCue(word){
    currentCue = word;
    if(word === "Fuego"){
        gameActive = true;
    }
    else{
        gameActive = true;
        setTimeout(() => {
            gameActive = false;
            currentCue = ""
        }, 1500);
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

function declareWinner(){
    winnerDeclared = true;
    messageElement.textContent = "Ganador";
    //Falta lógica de captura 
}

export async function detectPose() {
    const poses = await detector.estimatePoses(videoElement);
    console.log(`Personas detectadas: ${poses.length}`);

    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

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
        }
    
        else{
            const angle = calculateAngle(shoulder, elbow, wrist);
            const directionAngle = getArmDirectionAngle(shoulder, wrist);
            console.log(`[Jugador ${index + 1}]\nÁngulo del codo: ${angle}\nDirección del brazo: ${directionAngle}`);
    
            const validElbow = (angle >= 55 && angle <= 135);
            const validDirection = (directionAngle >= -45 && directionAngle <= 45);
            // Pretty much placeholder angles frfrf
    
            if (gameActive && !winnerDeclared){
                if(validDirection && validElbow) {
                    const gunPose = detectGunPose(); // More pleace holderisisrs
                    if (gunPose){
                        if(currentCue === "Fuego"){
                            if(!playerShotTimes[index]){
                                playerShotTimes[index] = performance.now();
                            }

                            if(playerShotTimes[0] && playerShotTimes[1]){
                                const winnerIndex = playerShotTimes[0] < playerShotTimes[1] ? 0 : 1;
                                declareWinner(playerShotTimes[winnerIndex]);
                            }
                        }
                        else {
                            // falseAttempts++;
                            playerLives[index]--;
                            message.textContent = `Jugador ${index + 1} se adelantó... (${playerLives[index]} vidas restantes)`;
                            
                            if(playerLives[index] <= 0){
                                winnerDeclared = true;
                                message.textContent = `¡Jugador ${index + 1} descalificado por IMPACIENTE!`;
                                if (cueIntervalId){
                                    clearInterval(cueIntervalId);
                                    cueIntervalId = null;
                                }
                            }
                        }
                    } 
                    else {
                        message.textContent = "¿A eso llamas pistola?";
                    }
                }
                else {
                    if (currentCue === "Fuego"){
                        if (!validElbow){message.textContent = "¡Mala puntería!";}
                        else if (!validDirection) {message.textContent = "¡A dónde apuntas!";}
                    }
                }
            }
        }
        if (winnerDeclared) {
            setTimeout(() => {
                winnerDeclared = false;
                falseAttempts = 0;
                messageElement.textContent = "¿Otra ronda?";
            }, 3000);
        }
    });

    requestAnimationFrame(detectPose);
}