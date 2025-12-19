const pool = require('../config/database');

const processPayment = async (req, res) => {
    try {
        const { invoice_id, amount_paid, payment_method } = req.body;
        const user_id = req.user.user_id;

        if (!invoice_id || !amount_paid || !payment_method) {
            return res.status(400).json({
                success: false,
                message: 'invoice_id, amount_paid, and payment_method required'
            });
        }

        const connection = await pool.getConnection();

        try {
            await connection.query(
                'CALL sp_process_payment_v2(?, ?, ?, ?, @payment_id, @message)',
                [invoice_id, amount_paid, payment_method, user_id]
            );

            const [[output]] = await connection.query('SELECT @payment_id AS payment_id, @message AS message');

            if (output.payment_id === -1) {
                connection.release();
                return res.status(400).json({
                    success: false,
                    message: output.message
                });
            }

            connection.release();

            res.status(201).json({
                success: true,
                message: output.message,
                payment_id: output.payment_id
            });
        } catch (dbError) {
            connection.release();
            throw dbError;
        }
    } catch (error) {
        console.error('Process payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process payment'
        });
    }
};

module.exports = { processPayment };