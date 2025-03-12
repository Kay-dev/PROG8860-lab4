const express = require('express');
const app = express();

app.use(express.json());

// Simple API endpoint that returns a greeting
app.get('/api/greeting', (req, res) => {
    const name = req.query.name || 'World';
    res.json({
        message: `Hello, ${name}!`,
        timestamp: new Date().toISOString()
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK' });
});

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

module.exports = app;
