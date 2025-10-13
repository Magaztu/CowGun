// wuuuu DOM manipulación wuuu
import { setupIntroScreen } from "./segments/opening.js";
import { initDetector, detectPose, setGameCue, setGameLogic, setCueIntervalId, setOnPlayerCountUpdate } from "./segments/detector.js";
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
let playerCountdownStarted = false;
let countdownTimeouts = [];

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

function showCountdownAndStart() {
    const countdownSteps = ["5","4","3", "2", "1", "¡VAMOS!"];
    let step = 0;

    const showNext = () => {
        if (step < countdownSteps.length) {
            message.textContent = countdownSteps[step];
            const timeoutId = setTimeout(showNext, 1000);
            countdownTimeouts.push(timeoutId);
            step++;
        } else {
            startCueLoop();
        }
    };

    showNext();
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

    setOnPlayerCountUpdate((playerCount) => {
        document.getElementById('playerCount').textContent = playerCount;

        if (playerCount === 2 && !playerCountdownStarted) {
            playerCountdownStarted = true;
            message.textContent = "Jugadores listos...";
            setTimeout(showCountdownAndStart, 1000);
        }
        else if (playerCount < 2) {
            // Si alguien abandona...
            playerCountdownStarted = false;
            message.textContent = "Esperando jugadores...";
            countdownTimeouts.forEach(clearTimeout);
            countdownTimeouts = [];
        }
    });
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
        document.getElementById('gameVisuals').style.display = 'block';
        // Nito logica de players
    });
});
