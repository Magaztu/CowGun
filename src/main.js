// wuuuu DOM manipulación wuuu
import { setupIntroScreen } from "./segments/opening.js";
import { initDetector, detectPose, setGameCue, setGameLogic, setCueIntervalId } from "./segments/detector.js";
import { playRandomCue } from "./segments/a-player.js";


const video = document.getElementById("video");
// const startButton = document.getElementById("startButton");
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

let cueIntervalId = null;
function startCueLoop(){
    cueIntervalId = setInterval( () => {
        const word = playRandomCue();
        
        if(word == "Fuego"){
            clearInterval(cueIntervalId);
            cueIntervalId = null;
        }
        
        setGameCue(word);

    }, 3000);

    setCueIntervalId(cueIntervalId);
}


// startButton.addEventListener('click', () => {
//     if (cueIntervalId) {
//         clearInterval(cueIntervalId);
//         cueIntervalId = null;
//     }
//     message.textContent = "Preparado...";
//     setTimeout(() => {
//         startCueLoop();

//         document.body.classList.add("flash");
//         setTimeout(() => document.body.classList.remove("flash"), 150);

//     }, 1000);
// });

async function startGame() {
    await startCamera();
    setGameLogic({messageEl: message, videoEl: video});
    await initDetector();
    detectPose();
}

document.addEventListener("DOMContentLoaded", () => {
    
    document.getElementById('introScreen').style.display = 'flex';
    document.getElementById('introScreen').classList.remove('tv-on');
    document.getElementById('introScreen').classList.add('tv-off');

    document.getElementById('logoContainer').classList.remove('visible', 'logo-shrink');
    document.getElementById('playButtom').classList.remove('visible', 'fade-out');

    document.getElementById('gameScreen').style.display = 'none';
    document.getElementById('waitingScreen').style.display = 'none';

    setupIntroScreen(() => {
        //Presionar jugar
        startGame();
        // Nito logica de players
    });
});
