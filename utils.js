// 🎯 琥珀っぽい色のピクセルをカウント（明るい黄色や透明感のあるオレンジを判定）
function countAmberPixels(imgData) {
    let amberPixels = 0;
    
    for (let i = 0; i < imgData.data.length; i += 4) {
        const r = imgData.data[i], g = imgData.data[i + 1], b = imgData.data[i + 2];

        // 🟡 琥珀っぽい色の範囲（小さい琥珀用に調整）
        if (r > 150 && g > 90 && b < 100 && (r - b) > 50) {
            amberPixels++;
        }
    }

    return amberPixels;
}

// 📊 琥珀判定（小さい琥珀にも対応）
function isAmberDetected(amberPixels, totalPixels) {
    let amberRatio = (amberPixels / totalPixels) * 100;
    return amberRatio > 1.5;  // 🔥 小さい琥珀を見逃さないように閾値を下げる！
}

// 🔵 小さな円形も検出（より小さな琥珀を検出）
function detectCircularShapes(imgData, width, height) {
    let edgePixels = 0;
    for (let i = 0; i < imgData.data.length; i += 4) {
        const r = imgData.data[i], g = imgData.data[i + 1], b = imgData.data[i + 2];

        // エッジ（明るさの変化が大きい部分）を検出（小さい部分も考慮）
        if (r + g + b < 120 || r + g + b > 700) {
            edgePixels++;
        }
    }
    
    return edgePixels > (width * height * 0.02);  // 🔥 小さい琥珀も見逃さないように調整！
}
