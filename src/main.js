// wuuuu DOM manipulación wuuu
import { initDetector, detectPose, setGameCue, setGameLogic } from "./segments/detector.js";
import { playRandomCue } from "./segments/a-player.js";


const video = document.getElementById("video");
const startButton = document.getElementById("startButton");
const message = document.getElementById("message");

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


startButton.addEventListener('click', () => {
    message.textContent = "Preparado...";
    setTimeout(() => {
        const word = playRandomCue();
        // message.textContent = (`${word.toUpperCase()}`);
        setGameCue(word);

        document.body.classList.add("flash");
        setTimeout(() => document.body.classList.remove("flash"), 150);

    }, 1000);
});

async function startGame() {
    await startCamera();
    setGameLogic({messageEl: message, videoEl: video});
    await initDetector();
    detectPose();
}

document.addEventListener("DOMContentLoaded", () => {
    startGame();
});
