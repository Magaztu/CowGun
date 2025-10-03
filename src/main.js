// wuuuu DOM manipulación wuuu

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