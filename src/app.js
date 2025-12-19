const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const { login } = require('./controllers/authController');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payments');
const productRoutes = require('./routes/products');

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Auth route
app.post('/api/auth/login', login);

// Protected routes
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/products', productRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

module.exports = app;