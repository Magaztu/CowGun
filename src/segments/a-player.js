//Move audio logic here

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