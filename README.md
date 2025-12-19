# Enterprise Inventory & Sales Management System

A production-ready, full-stack inventory and sales management system built with **Node.js, Express, and MySQL 8.0+** with enterprise features including ACID transactions, stored procedures, triggers, and role-based access control.

## Key Features

### Core Functionality
✅ **Product Management** - Add, edit, view products with categories and suppliers  
✅ **Order Processing** - Create orders with real-time inventory deduction  
✅ **Invoice Generation** - Auto-generate invoices from orders  
✅ **Payment Tracking** - Record and manage customer payments  
✅ **Inventory Management** - Track stock movements and generate alerts  

### Enterprise Features
✅ **ACID Transactions** - Guaranteed data consistency with stored procedures  
✅ **Role-Based Access Control** - Admin, Manager, Staff with granular permissions  
✅ **Audit Logging** - Complete change history via triggers  
✅ **JWT Authentication** - Secure token-based authentication  
✅ **Soft Deletes** - Data retention without hard deletion  
✅ **Database Triggers** - Auto stock updates, constraints, audit trails  

### Technical Excellence
✅ **Normalized Database (3NF)** - Zero data redundancy  
✅ **Optimized Indexes** - Composite & covering indexes for fast queries  
✅ **Error Handling** - Transaction rollback on failure  
✅ **Responsive Dashboard** - Real-time inventory & sales metrics  

---

##  Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Node.js 18+ + Express.js |
| **Database** | MySQL 8.0+ |
| **Frontend** | HTML5 + CSS3 + Vanilla JavaScript |
| **Authentication** | JWT + bcrypt |
| **Architecture** | REST API with Service Layer |

---

##  Database Architecture

### Tables (12 Total)
- **RBAC**: users, roles, permissions, role_permissions
- **Business**: products, categories, suppliers, customers
- **Sales**: orders, order_items, invoices, payments
- **Operations**: inventory_movements, audit_logs, stock_alerts
- **Analytics**: sales_forecast

### Stored Procedures (5)

✓ sp_create_order() - Atomic order creation + inventory deduction
✓ sp_process_payment() - Payment processing + balance updates
✓ sp_generate_invoice() - Auto invoice generation
✓ sp_cancel_order() - Rollback with inventory restoration
✓ sp_deduct_inventory() - Inventory allocation with locking


### Triggers (5)

✓ tr_prevent_negative_stock - Constraint enforcement
✓ tr_order_item_insert - Auto calculate totals
✓ tr_audit_users_update - Log user changes
✓ tr_audit_products_update - Log product changes
✓ tr_alert_low_stock - Generate low stock alerts


### Indexes
- Composite indexes on frequent JOINs (customer_id + order_date)
- Covering indexes for common reports
- FK indexes for referential integrity
- Soft delete index for filtered queries

---

##  Quick Start

### Prerequisites

Node.js 18+
MySQL 8.0+
Git


### Installation

1. **Clone Repository**
 //  ```bash
        git clone https://github.com/shagowda/inventory-system.git
        cd inventory-system

### INSTALL DEPENDENCIES

npm install

### Setup MySQL Database

mysql -u root -p
CREATE DATABASE learn_db;
USE learn_db;
-- Run SQL schema files (provided separately)

### Create .env file
 
 PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=learn_db
JWT_SECRET=your_secret_key_minimum_32_characters_here
NODE_ENV=development

### start server

npm run dev

### Access Application

http://localhost:3000

### Demo Credentials
Role	Email	Password
Admin	admin@system.com	admin123
Manager	manager@system.com	manager123
Staff	staff@system.com	staff123

### API Endpoints
### Authentication

POST /api/auth/login
  Body: { email, password }
  Returns: { token, user }

### Products

GET /api/products
  Headers: Authorization: Bearer <JWT>
  Returns: List of products with stock

GET /api/products/:productId
  Returns: Single product details

### Orders

GET /api/orders
  Returns: All orders with customer info

POST /api/orders
  Body: { customer_id, product_id, quantity }
  Returns: Created order with auto-generated invoice

POST /api/orders/:orderId/cancel
  Performs rollback: restores inventory, cancels invoice

### Payments

POST /api/payments
  Body: { invoice_id, amount_paid, payment_method, reference_number }
  Updates: Invoice status, customer balance

### What I Learned Building This
✅ Database Design

Normalization (1NF → 3NF → BCNF)
Indexing strategies for performance
Transaction design & isolation levels

✅ MySQL Enterprise Features

Stored procedures with error handling
Triggers for automation & audit
Views for reporting
Foreign key constraints

✅ Application Architecture

REST API design with Express
Service layer for business logic
Middleware for auth & error handling
Separation of concerns

✅ Security & Compliance

JWT authentication
Role-based access control
SQL injection prevention
Audit logging for compliance

✅ Performance Optimization

Query analysis with EXPLAIN
Composite index design
Connection pooling
Soft deletes for data retention