const API_URL = 'http://localhost:3000/api';

let token = localStorage.getItem('token');
let user = JSON.parse(localStorage.getItem('user') || 'null');
let productsCache = [];
let ordersCache = [];

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    if (token && user) {
        showDashboard();
        loadDashboardData();
    } else {
        showLogin();
    }

    // Event listeners
    document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
    document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);
    document.getElementById('createOrderForm')?.addEventListener('submit', handleCreateOrder);

    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            switchSection(section);
        });
    });

    // Product search
    document.getElementById('productSearch')?.addEventListener('input', filterProducts);
});

// ===== LOGIN FLOW =====
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            showError('loginError', data.message || 'Login failed');
            return;
        }

        // Save token and user
        token = data.token;
        user = data.user;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        // Switch to dashboard
        showDashboard();
        loadDashboardData();
    } catch (error) {
        showError('loginError', 'Connection failed: ' + error.message);
    }
}

function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    token = null;
    user = null;
    showLogin();
}

// ===== DASHBOARD =====
function showLogin() {
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('dashboardSection').style.display = 'none';
}

function showDashboard() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('dashboardSection').style.display = 'block';
    document.getElementById('userName').textContent = `👤 ${user.name}`;
}

async function loadDashboardData() {
    try {
        // Load products
        const productsRes = await fetch(`${API_URL}/products`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const productsData = await productsRes.json();

        // Load orders
        const ordersRes = await fetch(`${API_URL}/orders`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const ordersData = await ordersRes.json();

        if (productsData.success) {
            const products = productsData.products;
            document.getElementById('totalProducts').textContent = products.length;
            
            // Calculate stock value
            const stockValue = products.reduce((sum, p) => {
                return sum + (p.quantity_in_stock * p.cost_price);
            }, 0);
            document.getElementById('totalStockValue').textContent = `$${stockValue.toFixed(2)}`;

            // Low stock
            const lowStock = products.filter(p => p.quantity_in_stock < p.reorder_level).length;
            document.getElementById('lowStockItems').textContent = lowStock;

            // Populate products table
            displayProducts(products);

            // Populate product select
            const productSelect = document.getElementById('productId');
            products.forEach(p => {
                const option = document.createElement('option');
                option.value = p.product_id;
                option.textContent = `${p.product_name} (₹${p.unit_price})`;
                productSelect.appendChild(option);
        });     

            // Add quantity change listener
            document.getElementById('quantity')?.addEventListener('input', updateTotalPrice);
            document.getElementById('productId')?.addEventListener('change', updateTotalPrice);
        }

        if (ordersData.success) {
            document.getElementById('totalOrders').textContent = ordersData.orders.length;
            displayRecentOrders(ordersData.orders);
            displayOrders(ordersData.orders);
        }

        // Load customers for order form
        loadCustomers();
    } catch (error) {
        console.error('Load dashboard error:', error);
    }
}

async function loadCustomers() {
    // For now, add sample customers
    const customerSelect = document.getElementById('customerId');
    const customers = [
        { id: 1, name: 'ABC Corporation' },
        { id: 2, name: 'XYZ Ltd' },
        { id: 3, name: 'John Doe' }
    ];

    customers.forEach(c => {
        const option = document.createElement('option');
        option.value = c.id;
        option.textContent = c.name;
        customerSelect.appendChild(option);
    });
}

// ===== DISPLAY FUNCTIONS =====
function displayProducts(products) {
    productsCache = products;
    const tbody = document.getElementById('productsTable');
    tbody.innerHTML = products.map(p => `
        <tr>
            <td>${p.sku}</td>
            <td>${p.product_name}</td>
            <td>${p.category_name}</td>
            <td>₹${p.unit_price}</td>
            <td>${p.quantity_in_stock}</td>
            <td><span class="badge ${p.quantity_in_stock < p.reorder_level ? 'badge-warning' : 'badge-success'}">${p.status}</span></td>
        </tr>
    `).join('');
}

function displayOrders(orders) {
    ordersCache = orders;
    const tbody = document.getElementById('ordersTable');
    tbody.innerHTML = orders.map(o => `
        <tr>
            <td>${o.order_number}</td>
            <td>${o.customer_name}</td>
            <td>${new Date(o.order_date).toLocaleDateString()}</td>
            <td>₹${o.total_amount}</td>
            <td><span class="badge badge-${o.order_status}">${o.order_status}</span></td>
        </tr>
    `).join('');
}

function displayRecentOrders(orders) {
    const container = document.getElementById('recentOrders');
    const recent = orders.slice(0, 5);
    container.innerHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${recent.map(o => `
                    <tr>
                        <td>${o.order_number}</td>
                        <td>${o.customer_name}</td>
                        <td>₹${o.total_amount}</td>
                        <td>${o.order_status}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function filterProducts() {
    const search = document.getElementById('productSearch').value.toLowerCase();
    const rows = document.querySelectorAll('#productsTable tr');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(search) ? '' : 'none';
    });
}

function updateTotalPrice() {
    const productSelect = document.getElementById('productId');
    const quantity = parseInt(document.getElementById('quantity').value) || 0;
    
    if (productSelect.value) {
        const selectedOption = productSelect.options[productSelect.selectedIndex];
        const priceMatch = selectedOption.textContent.match(/₹([0-9.]+)/);
        const price = priceMatch ? parseFloat(priceMatch[1]) : 0;
        const total = price * quantity;
        document.getElementById('totalPrice').textContent = total.toFixed(2);
    }
}
// ===== CREATE ORDER =====
async function handleCreateOrder(e) {
    e.preventDefault();

    const customerId = parseInt(document.getElementById('customerId').value);
    const productId = parseInt(document.getElementById('productId').value);
    const quantity = parseInt(document.getElementById('quantity').value);

    try {
        const response = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ customer_id: customerId, product_id: productId, quantity })
        });

        const data = await response.json();

        if (!response.ok) {
            showError('orderError', data.message || 'Failed to create order');
            return;
        }

        showSuccess('orderSuccess', `✅ ${data.message}`);
        document.getElementById('createOrderForm').reset();
        document.getElementById('totalPrice').textContent = '0.00';

        // Reload data
        setTimeout(() => loadDashboardData(), 1500);
    } catch (error) {
        showError('orderError', 'Connection failed: ' + error.message);
    }
}

// ===== NAVIGATION =====
function switchSection(section) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(s => {
        s.classList.remove('active');
    });

    // Remove active from nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    // Show selected section
    document.getElementById(section).classList.add('active');
    document.querySelector(`[data-section="${section}"]`).classList.add('active');
}

// ===== UTILITY FUNCTIONS =====
function showError(elementId, message) {
    const elem = document.getElementById(elementId);
    if (elem) {
        elem.textContent = message;
        elem.style.display = 'block';
        setTimeout(() => {
            elem.style.display = 'none';
        }, 5000);
    }
}

function showSuccess(elementId, message) {
    const elem = document.getElementById(elementId);
    if (elem) {
        elem.textContent = message;
        elem.style.display = 'block';
        setTimeout(() => {
            elem.style.display = 'none';
        }, 5000);
    }
}