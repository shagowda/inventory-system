const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { listProducts } = require('../controllers/productController');

router.use(authMiddleware);

router.get('/', listProducts);

module.exports = router;