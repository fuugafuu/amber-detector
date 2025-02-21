const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const resultText = document.getElementById("result");

// 🎥 カメラ起動
navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
    .then(stream => {
        video.srcObject = stream;
        requestAnimationFrame(detectAmber);
    })
    .catch(err => console.error("カメラ取得失敗:", err));

// 🎯 リアルタイム AI判定（毎秒処理）
function detectAmber() {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    let amberPixels = countAmberPixels(imgData);
    let totalPixels = imgData.data.length / 4;
    let isAmber = isAmberDetected(amberPixels, totalPixels);
    let isRound = detectCircularShapes(imgData, canvas.width, canvas.height);

    if (isAmber && isRound) {
        resultText.innerText = "✅ 琥珀発見！";
        resultText.style.color = "green";
    } else {
        resultText.innerText = "❌ 琥珀なし...";
        resultText.style.color = "darkred";
    }

    requestAnimationFrame(detectAmber);
}
