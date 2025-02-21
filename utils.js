// 🎯 琥珀っぽい色のピクセルをカウント
function countAmberPixels(imgData) {
    let amberPixels = 0;
    
    for (let i = 0; i < imgData.data.length; i += 4) {
        const r = imgData.data[i], g = imgData.data[i + 1], b = imgData.data[i + 2];

        // 🟡 黄色～オレンジの色範囲（適宜調整OK）
        if (r > 160 && g > 100 && b < 90) {
            amberPixels++;
        }
    }

    return amberPixels;
}

// 📊 琥珀判定（全体の何％が琥珀っぽいか）
function isAmberDetected(amberPixels, totalPixels) {
    let amberRatio = (amberPixels / totalPixels) * 100;
    return amberRatio > 3;  // 閾値を3%に下げて小さい琥珀も検出
}

// 🔵 丸い形のオブジェクトを検出（簡易的な方法）
function detectCircularShapes(imgData, width, height) {
    let edgePixels = 0;
    for (let i = 0; i < imgData.data.length; i += 4) {
        const r = imgData.data[i], g = imgData.data[i + 1], b = imgData.data[i + 2];

        // エッジ（明るさの変化が大きい部分）をカウント
        if (r + g + b < 100 || r + g + b > 600) {
            edgePixels++;
        }
    }
    
    return edgePixels > (width * height * 0.05);  // 全体の5%以上がエッジなら丸いと判断
}
