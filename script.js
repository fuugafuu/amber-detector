const video = document.getElementById("camera");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const statusText = document.getElementById("status");
const saveBtn = document.getElementById("save-btn");

async function setupCamera() {
    const constraints = {
        video: {
            facingMode: { exact: "environment" }  // 🔹 背面カメラを優先
        }
    };

    try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream;
    } catch (error) {
        console.error("カメラのアクセスに失敗しました。", error);
        alert("カメラが使用できません。設定を確認してください。");
    }
}

async function loadModel() {
    return await cocoSsd.load();
}

async function detect(model) {
    const predictions = await model.detect(video);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    let amberDetected = false;

    predictions.forEach(pred => {
        // 🟢 琥珀っぽいものを「bottle」または「stone」として検出
        if (pred.class === "bottle" || pred.class === "stone") {
            ctx.strokeStyle = "red";
            ctx.lineWidth = 4;
            ctx.strokeRect(pred.bbox[0], pred.bbox[1], pred.bbox[2], pred.bbox[3]);

            amberDetected = true;
        }
    });

    // 🔹 認識できたかを画面に表示
    if (amberDetected) {
        statusText.innerText = "✅ 琥珀を検出しました！";
        statusText.style.color = "green";
    } else {
        statusText.innerText = "❌ 琥珀は見つかりませんでした。";
        statusText.style.color = "red";
    }

    requestAnimationFrame(() => detect(model));
}

// 📸 画像保存機能（ボタンを押したとき）
saveBtn.addEventListener("click", () => {
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL("image/png");

    const link = document.createElement("a");
    link.href = imageData;
    link.download = `amber_${Date.now()}.png`;
    link.click();
});

// 🎯 カメラ＆AI起動
(async function () {
    await setupCamera();
    const model = await loadModel();
    detect(model);
})();
