const express = require('express');
const app = require('./src/app');

// Serve static files from public folder
app.use(express.static('public'));

// Serve index.html for root path
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📍 http://localhost:${PORT}`);
    console.log(`🌐 Dashboard: http://localhost:${PORT}`);
    console.log(`🔐 API: POST http://localhost:${PORT}/api/auth/login`);
});