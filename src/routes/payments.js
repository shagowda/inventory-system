const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const paymentController = require('../controllers/paymentController');

router.use(authMiddleware);

router.post('/', paymentController.processPayment);

module.exports = router;