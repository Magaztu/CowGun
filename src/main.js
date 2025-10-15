// wuuuu DOM manipulación wuuu
import { setupIntroScreen } from "./segments/opening.js";
import { initDetector, detectPose, setGameCue, setGameLogic, setCueIntervalId, setOnPlayerCountUpdate, setGameRunning, setGameRestart } from "./segments/detector.js";
import { playRandomCue } from "./segments/a-player.js";

let bloqueador = false;

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

const bgMusic = document.getElementById('bgMusic');
const windAmbience = document.getElementById('windAmbience');
windAmbience.volume = 0.3;

function fadeOutMusic(audio, callback) {
    let vol = audio.volume;
    const fade = setInterval(() => {
        if (vol > 0.05) {
            vol -= 0.02;
            audio.volume = vol;
        } else {
            clearInterval(fade);
            audio.pause();
            if (callback) callback();
        }
    }, 100);
}

function fadeInAudio(audio, targetVol = 0.3) {
    audio.volume = 0;
    audio.play();
    let vol = 0;
    const fade = setInterval(() => {
        if (vol < targetVol) {
            vol += 0.01;
            audio.volume = vol;
        } else {
            clearInterval(fade);
        }
    }, 100);
}

const narratorAudios = [
    document.getElementById('narrator3'),
    document.getElementById('narrator2'),
    document.getElementById('narrator1'),
    document.getElementById('narratorGo')
];

function playNarratorCountdown(callback) {
    let index = 0;

    const playNext = () => {
        if (index >= narratorAudios.length) {
            if (callback) callback();
            return;
        }

        const currentAudio = narratorAudios[index];
        currentAudio.play().then(() => {
            index++;

            const delay = Math.random() * 1000 + 1000;
            setTimeout(playNext, delay);
        }).catch(err => {
            console.error("Error playing narrator audio:", err);
            index++;
            playNext();
        });
    };

    playNext();
}



let cueIntervalId = null;
let playerCountdownStarted = false;
let countdownTimeouts = [];

function startCueLoop(){
    
    document.getElementById('info').style.display = 'none';
    setGameCue("");
    cueIntervalId = setInterval( () => {
        const word = playRandomCue();
        
        if(word === "Fuego"){
            clearInterval(cueIntervalId);
            cueIntervalId = null;
            // bloqueador = true;
        }
        
        message.textContent = word;
        setGameCue(word);

    }, 3000);

    setCueIntervalId(cueIntervalId);
}

function showCountdownAndStart() {
    const countdownSteps = ["5", "4", "3", "2", "1"];
    let step = 0;
    
    const showNext = () => {
        if (step < countdownSteps.length) {
            message.textContent = countdownSteps[step];
            const timeoutId = setTimeout(showNext, 1000);
                countdownTimeouts.push(timeoutId);
                step++;
                
            } 
            else {
                bloqueador = false
                message.textContent = "¡Preparen sus armas!";
                document.getElementById('player1Indicator').style.display = "block";
                document.getElementById('player2Indicator').style.display = "block";

                fadeOutMusic(bgMusic, () => {
                    fadeInAudio(windAmbience);
                    
                    setTimeout(() => {
                        playNarratorCountdown(() => {
                            
                            document.getElementById('player1Indicator').style.display = "none";
                            document.getElementById('player2Indicator').style.display = "none";
                            
                            startCueLoop();
                        });
                    }, 1000); 
                });
            }
        };
        
    if(bloqueador == true){

        showNext();
    }
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
    if (cueIntervalId) clearInterval(cueIntervalId);
    setGameRunning(true);
    bloqueador = true;
    detectPose();

    setOnPlayerCountUpdate((playerCount) => {
        document.getElementById('playerCount').textContent = playerCount;

        if(bloqueador == true){

            clearInterval(cueIntervalId);

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
        // setGameCheck(true)
        startGame();
        document.getElementById('gameVisuals').style.display = 'block';
        // Nito logica de players
    });
});

setGameRestart(startGame);