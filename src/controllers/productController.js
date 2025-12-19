const pool = require('../config/database');

const listProducts = async (req, res) => {
    try {
        const connection = await pool.getConnection();

        const [products] = await connection.query(
            `SELECT p.*, c.category_name, s.supplier_name
             FROM products p
             JOIN categories c ON p.category_id = c.category_id
             JOIN suppliers s ON p.supplier_id = s.supplier_id
             ORDER BY p.product_name`
        );

        connection.release();

        res.json({ success: true, products });
    } catch (error) {
        console.error('List products error:', error);
        res.status(500).json({ success: false, message: 'Failed to list products' });
    }
};

module.exports = { listProducts };