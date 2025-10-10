// wuuuu DOM manipulación wuuu
import { initDetector } from "./segments/detector";
import { detectPose } from "./segments/detector";
import { playRandomCue } from "./segments/a-player";


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

async function startGame() {
    await startCamera();
    await initDetector();
    detectPose();
}