const video = document.getElementById("camera");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const statusText = document.getElementById("status");
const saveBtn = document.getElementById("save-btn");

async function setupCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
}

async function loadModel() {
    return await cocoSsd.load();
}

async function detect(model) {
    const predictions = await model.detect(video);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    predictions.forEach(pred => {
        if (pred.class === "bottle" || pred.class === "stone") {  // 琥珀っぽいもの
            ctx.strokeStyle = "red";
            ctx.lineWidth = 4;
            ctx.strokeRect(pred.bbox[0], pred.bbox[1], pred.bbox[2], pred.bbox[3]);

            statusText.innerText = "琥珀を検出しました！";
            statusText.style.color = "green";
        }
    });

    requestAnimationFrame(() => detect(model));
}

saveBtn.addEventListener("click", () => {
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL("image/png");

    // 画像をローカルに保存
    const link = document.createElement("a");
    link.href = imageData;
    link.download = `amber_${Date.now()}.png`;
    link.click();
});

(async function () {
    await setupCamera();
    const model = await loadModel();
    detect(model);
})();
