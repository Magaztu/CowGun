export function setupIntroScreen(onPlayCallback){
    const tvOnSfx = document.getElementById('tvOnSfx');
    const bgMusic = document.getElementById('bgMusic');
    const introScreen = document.getElementById('introScreen');
    const playButton = document.getElementById('playButtom');
    const gameScreen = document.getElementById('gameScreen');
    const logoContainer = document.getElementById('logoContainer');


    tvOnSfx.play().catch( () => {

    });

    tvOnSfx.addEventListener('ended', () => {
        bgMusic.volume = 0.4;
        bgMusic.play();
    });

    playButton.addEventListener('click', () =>{

        logoContainer.classList.add('logo-shrink');

        let vol = 0.4;
        const fadeOut = setInterval(() =>{
            if (vol > 0.1) {
                vol -= 0.02;
                bgMusic.volume = vol;
            }
            else {
                clearInterval(fadeOut);
            }
        }, 100);

        playButton.style.opacity = '0';
        playButton.style.pointerEvents = 'none';

        setTimeout(() => {
            introScreen.style.display = 'none';
            gameScreen.style.display = 'block';
            
            if(onPlayCallback) onPlayCallback();
        }, 1100);

    });
}