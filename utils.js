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
    return amberRatio > 5;  // 5%以上なら琥珀と判定
}
