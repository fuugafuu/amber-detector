// グレースケール取得
function getGray(data, x, y, width) {
    const idx = (y * width + x) * 4;
    return (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
}

// Sobelフィルター（エッジ検出）
function applySobelFilter(imgData, width, height, edgeThreshold) {
    const data = imgData.data;
    const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
    const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
    let edges = [];

    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            let gx = 0, gy = 0;

            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    gx += getGray(data, x + j, y + i, width) * sobelX[(i + 1) * 3 + (j + 1)];
                    gy += getGray(data, x + j, y + i, width) * sobelY[(i + 1) * 3 + (j + 1)];
                }
            }

            const edgeVal = Math.sqrt(gx * gx + gy * gy);
            if (edgeVal > edgeThreshold) {
                edges.push({ x, y });
            }
        }
    }

    return edges;
}
