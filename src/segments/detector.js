let detector;
let messageElement;
let videoElement;

let gameActive = false;
let currentCue = "";
let winnerDeclared = false;
let falseAttempts = 0;

export function setGameLogic({messageEl, videoEl}){
    messageElement = messageEl;
    videoElement = videoEl;
}

export function setGameCue(word){
    currentCue = word;
    gameActive = true;
    
    setTimeout(() => {
        gameActive = false;
        currentCue = ""
    }, 1500);
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

    poses.forEach(pose => {
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
    });

    if(poses.length !== 2){ //Normalmente !== 2
        messageElement.textContent = "¡Se necesitan dos jugadores!"
    }
    else {
        poses.forEach(pose => {
            const keypoints = pose.keypoints;
            const shoulder = keypoints.find( kp => kp.name === 'right_shoulder');
            const elbow = keypoints.find( kp => kp.name === 'right_elbow');
            const wrist = keypoints.find( kp => kp.name === 'right_wrist');
            
            if(!shoulder || !wrist || !elbow || shoulder.score < 0.3 || wrist.score < 0.3 || elbow.score < 0.3){
                console.warn("No se encontraron todos los keypoints. Omitiendo cálculo.")
            }
    
            else{
                const angle = calculateAngle(shoulder, elbow, wrist);
                const directionAngle = getArmDirectionAngle(shoulder, wrist);
                console.log('Ángulo del codo: ', angle);
                console.log('Angúlo de la dirección del brazo: ', directionAngle);
    
                const validElbow = angle >= 55 && angle <= 135;
                const validDirection = directionAngle >= -45 && directionAngle <= 45;
                // Pretty much placeholder angles frfrf
    
                if (gameActive && !winnerDeclared){
                    if(validDirection && validElbow) {
                        const gunPose = detectGunPose(); // More pleace holderisisrs
                        if (gunPose){
                            if(currentCue === "Fuego"){
                                declareWinner();
                            }
                            else {
                                falseAttempts++;
                                message.textContent = "Te adelantaste...";
                                if(falseAttemps >= 2){
                                    message.textContent = "¡IMPACIENTE!";
                                    winnerDeclared = true;
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
        });

    }
    if (winnerDeclared) {
        setTimeout(() => {
            winnerDeclared = false;
            falseAttempts = 0;
            messageElement.textContent = "¿Otra ronda?";
        }, 3000);
    }


    requestAnimationFrame(detectPose);
}