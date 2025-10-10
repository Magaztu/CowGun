//Move audio logic here

const cueWords = ["Fuego", "Luego", "Suelo"];
const audioMap = {
    Fuego: new Audio('../audio/Fuego.m4a'),
    Luego: new Audio('../audio/Luego.m4a'),
    Suelo: new Audio('../audio/Suelo.m4a')
};

export function playRandomCue() {
    const randomWord = cueWords[Math.floor(Math.random() * cueWords.length)];
    audioMap[randomWord].play();
    return randomWord;
}