const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// 📹 カメラ映像を取得（アウトカメラ）
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

// 🎥 フレームを解析
function processVideo() {
    if (video.readyState === 4) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        detectAmber();
    }
    requestAnimationFrame(processVideo);  // 高速処理
}

// 🔎 琥珀の色＋エッジ解析
function detectAmber() {
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const width = canvas.width, height = canvas.height;
    
    const amberPixels = [];
    for (let i = 0; i < imgData.data.length; i += 4) {
        const r = imgData.data[i], g = imgData.data[i + 1], b = imgData.data[i + 2];
        if (r > 160 && g > 110 && b < 90) {  // 🟡 琥珀っぽい色（少し厳しく）
            const x = (i / 4) % width;
            const y = Math.floor((i / 4) / width);
            amberPixels.push({ x, y });
        }
    }

    // 🏴‍☠️ エッジ検出（小さいものをキャッチする）
    const edges = applySobelFilter(imgData, width, height, 80);  // ← しきい値を 80 に下げる

    // 🎯 色＋エッジがあるものを厳しくフィルタリング
    const filteredPoints = edges.filter(point => 
        amberPixels.some(p => Math.abs(p.x - point.x) < 5 && Math.abs(p.y - point.y) < 5) // 5px以内ならOK
    );

    drawBoxes(filteredPoints);
}

// 🟡 小さい琥珀を囲む
function drawBoxes(points) {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "yellow";
    ctx.lineWidth = 1;

    points.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 8, 0, Math.PI * 2);  // ← 小さいものを囲む（半径8px）
        ctx.stroke();
    });
}

// 🏴‍☠️ Sobelフィルター（エッジ検出）
function applySobelFilter(imgData, width, height, threshold) {
    const sobelX = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]];
    const sobelY = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]];

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
