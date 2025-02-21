const express = require("express");
const fs = require("fs");
const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.static("uploads"));

app.post("/upload", (req, res) => {
    const image = req.body.image.replace(/^data:image\/png;base64,/, "");
    const filePath = `uploads/amber_${Date.now()}.png`;

    fs.writeFileSync(filePath, image, "base64");
    res.json({ message: "画像を保存しました！", path: filePath });
});

app.listen(3000, () => console.log("Server running on port 3000"));
