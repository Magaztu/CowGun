let detector;

export async function initDetector() {
    detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet);
    console.log("Detector de poses listo")
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

export async function detectPose() {
    const poses = await detector.estimatePoses(video);
    if(poses.length > 0) {
        const keypoints = poses[0].keypoints;

        const shoulder = keypoints.find( kp => kp.name === 'right_shoulder');
        const elbow = keypoints.find( kp => kp.name === 'right_elbow');
        const wrist = keypoints.find( kp => kp.name === 'right_wrist');

        if(!shoulder || !wrist || !elbow || shoulder.score < 0.5 || wrist.score < 0.5 || elbow.score < 0.5){
            console.warn("No se encontraron todos los keypoints. Omitiendo cálculo.")
        }

        else{
            const angle = calculateAngle(shoulder, elbow, wrist);
            console.log('Ángulo del brazo: ', angle);

            // Implementar CalcAng
        }
    }

    requestAnimationFrame(detectPose);
}