
export function setupIntroScreen(onPlayCallback){
    const introScreen = document.getElementById('introScreen');
    const logoContainer = document.getElementById('logoContainer');
    const playButton = document.getElementById('playButtom');
    const waitingScreen = document.getElementById('waitingScreen');
    const tvOnSfx = document.getElementById('tvOnSfx');
    const bgMusic = document.getElementById('bgMusic');
    const gameScreen = document.getElementById('gameScreen');

    introScreen.classList.remove('tv-on');
    introScreen.classList.add('tv-off');

    let audioPlayed = false;
    tvOnSfx.volume = 0.2;

    tvOnSfx.play().then( () => {
        audioPlayed = true;
    }).catch(() => {

    });

    const showIntroUI = () => {
        introScreen.classList.remove('tv-off');
        introScreen.classList.add('tv-on');

        // bgMusic.volume = 0.4;
        // bgMusic.play();

        setTimeout(() => {
            logoContainer.classList.add('visible');
            playButton.classList.add('visible');

            // Start background music quietly
            bgMusic.volume = 0.3;
            bgMusic.loop = true;
            bgMusic.play().catch(() => {}); 
        }, 500);
    }

    tvOnSfx.addEventListener('ended', () => {
        showIntroUI();
    });

    setTimeout(() => {
        if (!audioPlayed) {
            showIntroUI();
        }
    }, 2000);

    playButton.addEventListener('click', () =>{

        logoContainer.classList.add('logo-shrink');

        playButton.classList.add('fade-out');

        let vol = 0.4;
        const fadeOut = setInterval(() =>{
            if (vol > 0.05) {
                vol -= 0.02;
                bgMusic.volume = vol;
            }
            else {
                clearInterval(fadeOut);
            }
        }, 100);

        waitingScreen.style.display = 'block';

        setTimeout(() => {
            introScreen.style.display = 'none';
            gameScreen.style.display = 'block';
            
            if(onPlayCallback) onPlayCallback();
        }, 1100);

    });
}