const pool = require('../config/database');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log('Login attempt:', { email, password });

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password required'
            });
        }

        const connection = await pool.getConnection();

        const [users] = await connection.query(
            'SELECT user_id, email, password_hash, first_name, role_id FROM users WHERE email = ? AND deleted_at IS NULL',
            [email]
        );

        console.log('User found:', users.length > 0 ? 'Yes' : 'No');

        if (users.length === 0) {
            connection.release();
            console.log('User not found');
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const user = users[0];
        console.log('Comparing passwords...');
        console.log('Stored hash:', user.password_hash);
        console.log('Password entered:', password);

        // Compare password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        
        console.log('Password valid:', isPasswordValid);

        if (!isPasswordValid) {
            connection.release();
            console.log('Password mismatch');
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Get permissions
        const [permissions] = await connection.query(
            `SELECT DISTINCT p.permission_code
             FROM role_permissions rp
             JOIN permissions p ON rp.permission_id = p.permission_id
             WHERE rp.role_id = ?`,
            [user.role_id]
        );

        const permissionCodes = permissions.map(p => p.permission_code);

        // Generate JWT
        const token = jwt.sign(
            {
                user_id: user.user_id,
                email: user.email,
                name: user.first_name,
                role_id: user.role_id,
                permissions: permissionCodes
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Update last login
        await connection.query(
            'UPDATE users SET last_login = NOW() WHERE user_id = ?',
            [user.user_id]
        );

        connection.release();

        console.log('Login successful for:', email);

        res.json({
            success: true,
            token,
            user: {
                user_id: user.user_id,
                email: user.email,
                name: user.first_name,
                role_id: user.role_id
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: error.message
        });
    }
};

module.exports = { login };