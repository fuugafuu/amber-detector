const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// 🎥 アウトカメラで映像を取得
navigator.mediaDevices.getUserMedia({
    video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } }
}).then(stream => {
    video.srcObject = stream;
    video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        processVideo();
    };
}).catch(err => console.error("カメラ取得失敗:", err));

function processVideo() {
    if (video.readyState === 4) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        detectPossibleAmber();  // 🔎 ステップ①（大まかに黄色い部分を探す）
    }
    requestAnimationFrame(processVideo);
}

// 🟡 **ステップ①：「ざっくり黄色い部分を探す」**
function detectPossibleAmber() {
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const width = canvas.width, height = canvas.height;

    let possiblePoints = [];
    for (let i = 0; i < imgData.data.length; i += 4) {
        const r = imgData.data[i], g = imgData.data[i + 1], b = imgData.data[i + 2];
        const brightness = (r + g + b) / 3;

        // 🟡 琥珀っぽい色（黄色～オレンジ）
        if (r > 160 && g > 110 && b < 90 && brightness > 80 && brightness < 200) {
            const x = (i / 4) % width;
            const y = Math.floor((i / 4) / width);
            possiblePoints.push({ x, y });
        }
    }

    // 🎯 **ステップ②：「1つずつ拡大して分析」**
    filterRealAmber(possiblePoints);
}

// 🏴‍☠️ **ステップ②：「拡大分析」**
function filterRealAmber(points) {
    let realAmbers = [];

    for (let point of points) {
        const { x, y } = point;
        const zoomSize = 15; // 🔍 この範囲を拡大分析

        // 📷 小さい範囲の画像を取得
        const imgData = ctx.getImageData(x - zoomSize / 2, y - zoomSize / 2, zoomSize, zoomSize);
        
        // 🏴‍☠️ さらに形状チェック（エッジ分析）
        if (checkAmberShape(imgData, zoomSize, zoomSize) && checkTransparency(imgData)) {
            realAmbers.push(point);
        }
    }

    // **ステップ③：「本物っぽいのだけ表示」**
    drawBoxes(realAmbers);
}

// 🎯 **形状チェック（エッジ検出）**
function checkAmberShape(imgData, width, height) {
    let edgeCount = 0;
    const sobelThreshold = 80;  // 🔧 エッジのしきい値（高いほど輪郭が強いものだけ通す）

    for (let i = 0; i < imgData.data.length; i += 4) {
        const brightness = (imgData.data[i] + imgData.data[i + 1] + imgData.data[i + 2]) / 3;

        // 🏴‍☠️ 急激な明るさの変化（エッジ）をカウント
        if (i > 4 && Math.abs(brightness - imgData.data[i - 4]) > sobelThreshold) {
            edgeCount++;
        }
    }

    // **形が丸っぽかったらOK**
    return edgeCount > 5 && edgeCount < 50; 
}

// ✨ **透明度チェック（琥珀は光を通す）**
function checkTransparency(imgData) {
    let transparencyCount = 0;
    let totalPixels = imgData.data.length / 4;

    for (let i = 0; i < imgData.data.length; i += 4) {
        const r = imgData.data[i], g = imgData.data[i + 1], b = imgData.data[i + 2];
        const brightness = (r + g + b) / 3;

        // 光を通しやすい部分は、全体の明るさと近い
        if (Math.abs(brightness - 150) < 20) {
            transparencyCount++;
        }
    }

    // 全体の30%以上が透明っぽかったらOK
    return (transparencyCount / totalPixels) > 0.3;
}

// **ステップ③：「見せるのは本物っぽいものだけ」**
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
