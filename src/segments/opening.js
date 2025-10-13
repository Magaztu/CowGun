import { set } from "express/lib/application";

export function setupIntroScreen(onPlayCallback){
    const tvOnSfx = document.getElementById('tvOnSfx');
    const bgMusic = document.getElementById('bgMusic');
    const introScreen = document.getElementById('introScreen');
    const playButton = document.getElementById('playButton');
    const gameScreen = document.getElementById('gameScreen');

    tvOnSfx.play().catch( () => {

    });

    tvOnSfx.addEventListener('ended', () => {
        bgMusic.volume = 0.4;
        bgMusic.play();
    });

    playButton.addEventListener('click', () =>{
        const logo = document.getElementById('logo');

        logo.style.transition = 'all 1s ease';
        logo.style.fontSize = '2rem';
        logo.style.position = 'fixed';
        logo.style.top = '10px';
        logo.style.left = '50%';
        logo.style.transform = 'translateX(-50)';

        let vol = 0.4;
        const fadeOut = setInterval(() =>{
            if (vol > 0.1) {
                vol -= 0.02;
                bgMusic.vol = vol;
            }
            else {
                clearInterval(fadeOut);
            }
        }, 100);
    })
}