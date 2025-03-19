const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Serve static files (HTML, CSS)
app.use(express.static(path.join(__dirname, 'public')));

// Video streaming endpoint
app.get('/stream', (req, res) => {
    const videoPath = path.join(__dirname, 'sample.mp4');
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
        // Handle range requests (for seeking)
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(videoPath, { start, end });
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4',
        };

        res.writeHead(206, head);
        file.pipe(res);
    } else {
        // Serve the entire file if no range is specified
        const head = {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4',
        };
        res.writeHead(200, head);
        fs.createReadStream(videoPath).pipe(res);
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
