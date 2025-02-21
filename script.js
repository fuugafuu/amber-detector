const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const statusText = document.getElementById('statusText');

async function startCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
}

async function loadModel() {
    return await tf.loadGraphModel('model/model.json'); // 学習済みモデルをロード
}

async function detectAmber(model) {
    if (video.videoWidth === 0 || video.videoHeight === 0) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const tensor = tf.browser.fromPixels(canvas)
        .resizeNearestNeighbor([224, 224])
        .toFloat()
        .expandDims();
    
    const predictions = await model.executeAsync(tensor);
    const boxes = predictions[1].arraySync()[0]; // バウンディングボックス
    const scores = predictions[2].arraySync()[0]; // 信頼度スコア
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    let found = false;
    for (let i = 0; i < boxes.length; i++) {
        if (scores[i] > 0.5) { // しきい値 0.5 以上を琥珀と判定
            found = true;
            const [ymin, xmin, ymax, xmax] = boxes[i];
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 4;
            ctx.strokeRect(xmin * canvas.width, ymin * canvas.height, (xmax - xmin) * canvas.width, (ymax - ymin) * canvas.height);
        }
    }
    
    if (found) {
        statusText.innerText = "琥珀が見つかりました！";
        statusText.style.color = 'green';
    } else {
        statusText.innerText = "琥珀は見つかりませんでした...";
        statusText.style.color = 'red';
    }
}

async function main() {
    await startCamera();
    const model = await loadModel();
    setInterval(() => detectAmber(model), 2000);
}

main();
