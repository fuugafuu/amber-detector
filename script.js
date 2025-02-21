const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const captureBtn = document.getElementById("capture");
const recordBtn = document.getElementById("record");
const stopBtn = document.getElementById("stop");
const downloadLink = document.getElementById("download");

let mediaRecorder;
let recordedChunks = [];

// 📹 カメラ映像を取得（アウトカメラ）
navigator.mediaDevices.getUserMedia({
    video: { facingMode: "environment", width: { ideal: 640 }, height: { ideal: 480 } }
}).then(stream => {
    video.srcObject = stream;
    video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        processVideo();
    };
}).catch(err => console.error("カメラ取得失敗:", err));

// 🎥 フレームを解析（琥珀検出）
function processVideo() {
    if (video.readyState === 4) {  // カメラが準備完了している場合のみ実行
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        detectAmber();
    }
    setTimeout(processVideo, 100);  // 100msごとに処理（負荷軽減）
}

// 🔎 琥珀の特徴（色＋形）を解析
function detectAmber() {
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const width = canvas.width, height = canvas.height;
    
    // エッジ検出（輪郭抽出）
    const edges = applySobelFilter(imgData, width, height, 80); // 閾値80に調整
    
    drawBoxes(edges);
}

// 🟡 琥珀を黄色い円で囲む
function drawBoxes(points) {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "yellow";
    ctx.lineWidth = 2;

    points.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 10, 0, Math.PI * 2);
        ctx.stroke();
    });
}

// 📸 写真撮影（タップでスクリーンショット）
captureBtn.addEventListener("click", () => {
    const imgUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = imgUrl;
    a.download = "capture.png";
    a.click();
});

// 🎥 録画開始
recordBtn.addEventListener("click", () => {
    recordedChunks = [];
    mediaRecorder = new MediaRecorder(video.srcObject);
    mediaRecorder.ondataavailable = event => recordedChunks.push(event.data);
    mediaRecorder.onstop = saveRecording;
    mediaRecorder.start();
    recordBtn.disabled = true;
    stopBtn.disabled = false;
});

// ⏹️ 録画停止
stopBtn.addEventListener("click", () => {
    mediaRecorder.stop();
    recordBtn.disabled = false;
    stopBtn.disabled = true;
});

// 📥 録画データをダウンロード
function saveRecording() {
    const blob = new Blob(recordedChunks, { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    downloadLink.href = url;
    downloadLink.download = "recorded_video.webm";
    downloadLink.style.display = "block";
    downloadLink.click();
}
