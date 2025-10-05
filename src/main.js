// wuuuu DOM manipulación wuuu

const video = document.getElementById("video");

async function startCamera() {
    try{
        const stream = await navigator.mediaDevices.getUserMedia({video: true});
        video.srcObject = stream;

        await video.play();
        console.log("Cámara encendida");

    }
    catch(err){
        console.error("No se encontró la cámara");
    }
}

const cueWords = ["Fuego", "Luego", "Suelo"];
const audioMap = {
    Fuego: new Audio('../audio/Fuego.m4a'),
    Luego: new Audio('../audio/Luego.m4a'),
    Suelo: new Audio('../audio/Suelo.m4a')
};

function playRandomCue() {
    const randomWord = cueWords[Math.floor(Math.random() * cueWords.length)];
    audioMap[randomWord].play();
    return randomWord;
}

const startButton = document.getElementById("startButton");
const message = document.getElementById("message");

startButton.addEventListener('click', () => {
    message.textContent = "Preparado...";
    setTimeout(() => {
        const word = playRandomCue();
        message.textContent = (`${word.toUpperCase()}`);
        // Necesito más código luego

    }, 2000);
});

let detector;

async function initDetector() {
    detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet);
    console.log("Detector de poses listo")
}

async function detectPose() {
    const poses = await detector.estimatePose(video);
    if(poses.length > 0) {
        const keypoints = poses[0].keypoints;

        const shoulder = keypoints.find( kp => kp.name === 'right_shoulder');
        const elbow = keypoints.find( kp => kp.name === 'right_elbow');
        const wrist = keypoints.find( kp => kp.name === 'right_wrist');

        if (shoulder && elbow && wrist) {
            const angle = calculateAngle(shoulder, elbow, wrist);
            console.log('Ángulo del brazo: ', angle);

            // Implementar CalcAng
        }
    }

    requestAnimationFrame(detectPose);
}