const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Initialize SQLite Database
const db = new sqlite3.Database('./mewwys.db', (err) => {
  if (err) console.error('Database connection error:', err.message);
  else console.log('Connected to SQLite database.');
});

// Create Tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    category TEXT,
    price REAL,
    description TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_name TEXT,
    customer_ign TEXT,
    game_id TEXT,
    zone_id TEXT,
    amount REAL,
    status TEXT DEFAULT 'Pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// API: Get all products for storefront
app.get('/api/products', (req, res) => {
  db.all(`SELECT * FROM products`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// API: Owner adds a new product to catalog
app.post('/api/products', (req, res) => {
  const { name, category, price, description } = req.body;
  db.run(`INSERT INTO products (name, category, price, description) VALUES (?, ?, ?, ?)`,
    [name, category, price, description], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, success: true });
    });
});

// API: Customer submits an order
app.post('/api/orders', (req, res) => {
  const { product_name, customer_ign, game_id, zone_id, amount } = req.body;
  db.run(`INSERT INTO orders (product_name, customer_ign, game_id, zone_id, amount) VALUES (?, ?, ?, ?, ?)`,
    [product_name, customer_ign, game_id, zone_id, amount], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ orderId: this.lastID, success: true });
    });
});

// API: Owner views all incoming orders
app.get('/api/orders', (req, res) => {
  db.all(`SELECT * FROM orders ORDER BY created_at DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.listen(PORT, () => {
  console.log(`MEWWY's server running on port ${PORT}`);
});
