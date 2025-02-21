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
    
    // 🟡 琥珀っぽい色フィルタ
    const amberPixels = [];
    for (let i = 0; i < imgData.data.length; i += 4) {
        const r = imgData.data[i], g = imgData.data[i + 1], b = imgData.data[i + 2];
        if (r > 150 && g > 100 && b < 80) {  // 黄～オレンジ系の色
            const x = (i / 4) % width;
            const y = Math.floor((i / 4) / width);
            amberPixels.push({ x, y });
        }
    }

    // 🏴‍☠️ エッジ検出（閾値を高める）
    const edges = applySobelFilter(imgData, width, height, 120);  // ← しきい値を 120 にUP

    // 🎯 琥珀っぽい色＋輪郭が丸いものを抽出
    const filteredPoints = edges.filter(point => 
        amberPixels.some(p => Math.abs(p.x - point.x) < 10 && Math.abs(p.y - point.y) < 10)
    );

    drawBoxes(filteredPoints);
}

// 🟡 琥珀っぽい部分を黄色い円で囲む
function drawBoxes(points) {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "yellow";
    ctx.lineWidth = 2;

    points.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 20, 0, Math.PI * 2);  // ← 半径20に変更（小さいノイズを除去）
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

// 🏴‍☠️ Sobelフィルター（エッジ検出）
function applySobelFilter(imgData, width, height, threshold) {
    const sobelX = [
        [-1, 0, 1],
        [-2, 0, 2],
        [-1, 0, 1]
    ];
    const sobelY = [
        [-1, -2, -1],
        [0, 0, 0],
        [1, 2, 1]
    ];

    const edges = [];
    const gray = new Uint8ClampedArray(width * height);

    for (let i = 0; i < imgData.data.length; i += 4) {
        const r = imgData.data[i], g = imgData.data[i + 1], b = imgData.data[i + 2];
        gray[i / 4] = 0.3 * r + 0.59 * g + 0.11 * b;
    }

    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            let gx = 0, gy = 0;
            for (let ky = -1; ky <= 1; ky++) {
                for (let kx = -1; kx <= 1; kx++) {
                    const pixel = gray[(y + ky) * width + (x + kx)];
                    gx += sobelX[ky + 1][kx + 1] * pixel;
                    gy += sobelY[ky + 1][kx + 1] * pixel;
                }
            }
            const edgeVal = Math.sqrt(gx * gx + gy * gy);
            if (edgeVal > threshold) {
                edges.push({ x, y });
            }
        }
    }
    return edges;
}
