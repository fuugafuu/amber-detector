const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const captureBtn = document.getElementById("capture");
const resultText = document.getElementById("result");

// 🎥 カメラ起動
navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
    .then(stream => {
        video.srcObject = stream;
    })
    .catch(err => console.error("カメラ取得失敗:", err));

// 🎯 AI判定（色だけ）
function detectAmber() {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    let amberPixels = countAmberPixels(imgData);
    let totalPixels = imgData.data.length / 4;

    if (isAmberDetected(amberPixels, totalPixels)) {
        resultText.innerText = "✅ 琥珀っぽいもの発見！";
    } else {
        resultText.innerText = "❌ 琥珀は見つからない...";
    }
}

// 📸 撮影ボタンでAI判定
captureBtn.addEventListener("click", detectAmber);
