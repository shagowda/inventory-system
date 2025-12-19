const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { createOrder, listOrders } = require('../controllers/orderController');

router.use(authMiddleware);

router.post('/', createOrder);
router.get('/', listOrders);

module.exports = router;