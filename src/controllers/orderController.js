const pool = require('../config/database');

const createOrder = async (req, res) => {
    try {
        const { customer_id, product_id, quantity } = req.body;
        const user_id = req.user.user_id;

        if (!customer_id || !product_id || !quantity) {
            return res.status(400).json({
                success: false,
                message: 'customer_id, product_id, and quantity required'
            });
        }

        const connection = await pool.getConnection();

        const [result] = await connection.query(
            'CALL sp_create_order_v2(?, ?, ?, ?, @order_id, @message)',
            [customer_id, product_id, quantity, user_id]
        );

        const [[output]] = await connection.query('SELECT @order_id AS order_id, @message AS message');
        connection.release();

        if (output.order_id === -1) {
            return res.status(400).json({
                success: false,
                message: output.message
            });
        }

        res.status(201).json({
            success: true,
            message: output.message,
            order_id: output.order_id
        });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create order'
        });
    }
};

const getOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const connection = await pool.getConnection();

        const [orders] = await connection.query(
            `SELECT o.*, c.customer_name
             FROM orders o
             JOIN customers c ON o.customer_id = c.customer_id
             WHERE o.order_id = ?`,
            [orderId]
        );

        if (orders.length === 0) {
            connection.release();
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        const order = orders[0];

        const [items] = await connection.query(
            `SELECT oi.*, p.product_name
             FROM order_items oi
             JOIN products p ON oi.product_id = p.product_id
             WHERE oi.order_id = ?`,
            [orderId]
        );

        connection.release();

        res.json({
            success: true,
            order: {
                ...order,
                items
            }
        });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve order'
        });
    }
};

const listOrders = async (req, res) => {
    try {
        const connection = await pool.getConnection();

        const [orders] = await connection.query(
            `SELECT o.*, c.customer_name
             FROM orders o
             JOIN customers c ON o.customer_id = c.customer_id
             WHERE o.deleted_at IS NULL
             ORDER BY o.order_date DESC
             LIMIT 50`
        );

        connection.release();

        res.json({
            success: true,
            orders
        });
    } catch (error) {
        console.error('List orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to list orders'
        });
    }
};

module.exports = { createOrder, getOrder, listOrders };