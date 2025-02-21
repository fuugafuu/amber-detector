/* script.js */
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const statusText = document.getElementById('statusText');

async function startCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
}

async function loadModel() {
    return await tf.loadGraphModel('https://tfhub.dev/tensorflow/ssd_mobilenet_v2/2/default/1');
}

async function detectAmber(model) {
    if (video.videoWidth === 0 || video.videoHeight === 0) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const tensor = tf.browser.fromPixels(video)
        .resizeNearestNeighbor([300, 300])
        .toFloat()
        .expandDims(0);

    const predictions = await model.executeAsync(tensor);
    const boxes = predictions[1].arraySync()[0]; // バウンディングボックス
    const scores = predictions[2].arraySync()[0]; // 信頼度
    const classes = predictions[3].arraySync()[0]; // クラスID

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    let found = false;
    for (let i = 0; i < boxes.length; i++) {
        if (scores[i] > 0.5) { // 信頼度50%以上
            const [ymin, xmin, ymax, xmax] = boxes[i];
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 4;
            ctx.strokeRect(xmin * canvas.width, ymin * canvas.height, (xmax - xmin) * canvas.width, (ymax - ymin) * canvas.height);

            // 一時的に「瓶（bottle）」を琥珀として判定
            if (classes[i] === 44) { // クラスID 44 = bottle（参考: COCO dataset）
                found = true;
            }
        }
    }

    if (found) {
        statusText.innerText = "琥珀（っぽいもの）が見つかりました！";
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
