const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 8081;

// Middleware
app.use(cors());
app.use(express.static(__dirname));

// Serve index.html for all routes (SPA support)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Frontend server running on http://localhost:${PORT}`);
});
