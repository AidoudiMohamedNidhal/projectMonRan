const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Database setup
const db = new sqlite3.Database(process.env.DB_PATH || './database.sqlite');

// Create tables
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      firstName TEXT,
      lastName TEXT,
      role TEXT DEFAULT 'customer',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      category TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS cart_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      productId INTEGER NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (productId) REFERENCES products(id),
      UNIQUE(userId, productId)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      total REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderId INTEGER NOT NULL,
      productId INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY (orderId) REFERENCES orders(id),
      FOREIGN KEY (productId) REFERENCES products(id)
    )
  `);

  // Insert sample data
  db.get("SELECT COUNT(*) as count FROM products", (err, row) => {
    if (err || row.count > 0) return;
    
    const sampleProducts = [
      ['Laptop', 'High performance laptop', 999.99, 'Electronics'],
      ['Book', 'Interesting programming book', 29.99, 'Books'],
      ['Headphones', 'Noise cancelling headphones', 199.99, 'Electronics'],
      ['Coffee Mug', 'Ceramic coffee mug', 12.99, 'Home']
    ];

    const stmt = db.prepare("INSERT INTO products (name, description, price, category) VALUES (?, ?, ?, ?)");
    sampleProducts.forEach(product => stmt.run(product));
    stmt.finalize();
  });

  // Create default admin account
  db.get("SELECT COUNT(*) as count FROM users WHERE role = 'admin'", (err, row) => {
    if (err || row.count > 0) return;
    
    bcrypt.hash('admin123', 10, (err, hashedPassword) => {
      if (err) return;
      
      db.run(
        "INSERT INTO users (email, password, firstName, lastName, role) VALUES (?, ?, ?, ?, ?)",
        ['admin@example.com', hashedPassword, 'Admin', 'User', 'admin'],
        (err) => {
          if (err) {
            console.error('Error creating admin account:', err);
          } else {
            console.log('Default admin account created: admin@example.com / admin123');
          }
        }
      );
    });
  });
});

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Middleware to check admin role
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
      'INSERT INTO users (email, password, firstName, lastName) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, firstName, lastName],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.status(400).json({ error: 'Email already exists' });
          }
          return res.status(500).json({ error: 'Registration failed' });
        }

        const token = jwt.sign(
          { id: this.lastID, email, role: 'customer' },
          JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.status(201).json({
          message: 'User registered successfully',
          token,
          user: { id: this.lastID, email, firstName, lastName, role: 'customer' }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    db.get(
      'SELECT * FROM users WHERE email = ?',
      [email],
      async (err, user) => {
        if (err || !user) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
          { id: user.id, email: user.email, role: user.role },
          JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.json({
          message: 'Login successful',
          token,
          user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/auth/profile', authenticateToken, (req, res) => {
  db.get(
    'SELECT id, email, firstName, lastName, role, createdAt FROM users WHERE id = ?',
    [req.user.id],
    (err, user) => {
      if (err || !user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    }
  );
});

// Product routes
app.get('/api/products', (req, res) => {
  db.all('SELECT * FROM products ORDER BY createdAt DESC', (err, products) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch products' });
    }
    res.json(products);
  });
});

app.get('/api/products/:id', (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM products WHERE id = ?', [id], (err, product) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch product' });
    }
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  });
});

app.post('/api/products', authenticateToken, requireAdmin, (req, res) => {
  const { name, description, price, category } = req.body;

  if (!name || !price) {
    return res.status(400).json({ error: 'Name and price are required' });
  }

  db.run(
    'INSERT INTO products (name, description, price, category) VALUES (?, ?, ?, ?)',
    [name, description, price, category],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create product' });
      }

      res.status(201).json({
        message: 'Product created successfully',
        product: { id: this.lastID, name, description, price, category }
      });
    }
  );
});

app.put('/api/products/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { name, description, price, category } = req.body;

  if (!name || !price) {
    return res.status(400).json({ error: 'Name and price are required' });
  }

  db.run(
    'UPDATE products SET name = ?, description = ?, price = ?, category = ? WHERE id = ?',
    [name, description, price, category, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update product' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }

      res.json({
        message: 'Product updated successfully',
        product: { id: parseInt(id), name, description, price, category }
      });
    }
  );
});

app.delete('/api/products/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM products WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete product' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  });
});

// Cart routes
app.get('/api/cart', authenticateToken, (req, res) => {
  db.all(`
    SELECT ci.*, p.name, p.price, p.description 
    FROM cart_items ci 
    JOIN products p ON ci.productId = p.id 
    WHERE ci.userId = ?
  `, [req.user.id], (err, cartItems) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch cart' });
    }
    res.json(cartItems);
  });
});

app.post('/api/cart/add', authenticateToken, (req, res) => {
  const { productId, quantity = 1 } = req.body;

  if (!productId) {
    return res.status(400).json({ error: 'Product ID is required' });
  }

  // Check if product exists
  db.get('SELECT * FROM products WHERE id = ?', [productId], (err, product) => {
    if (err || !product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Add to cart (or update quantity if already exists)
    db.run(`
      INSERT INTO cart_items (userId, productId, quantity) 
      VALUES (?, ?, ?)
      ON CONFLICT(userId, productId) 
      DO UPDATE SET quantity = quantity + ?
    `, [req.user.id, productId, quantity, quantity], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to add to cart' });
      }
      res.json({ message: 'Product added to cart successfully' });
    });
  });
});

app.put('/api/cart/update', authenticateToken, (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId || !quantity || quantity < 1) {
    return res.status(400).json({ error: 'Product ID and valid quantity are required' });
  }

  db.run(
    'UPDATE cart_items SET quantity = ? WHERE userId = ? AND productId = ?',
    [quantity, req.user.id, productId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update cart' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Item not found in cart' });
      }
      res.json({ message: 'Cart updated successfully' });
    }
  );
});

app.delete('/api/cart/remove/:productId', authenticateToken, (req, res) => {
  const { productId } = req.params;

  db.run(
    'DELETE FROM cart_items WHERE userId = ? AND productId = ?',
    [req.user.id, productId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to remove from cart' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Item not found in cart' });
      }
      res.json({ message: 'Item removed from cart' });
    }
  );
});

// Order routes
app.post('/api/orders/checkout', authenticateToken, (req, res) => {
  // Get cart items
  db.all(`
    SELECT ci.*, p.name, p.price 
    FROM cart_items ci 
    JOIN products p ON ci.productId = p.id 
    WHERE ci.userId = ?
  `, [req.user.id], (err, cartItems) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to process order' });
    }

    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Calculate total
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Create order
    db.run(
      'INSERT INTO orders (userId, total) VALUES (?, ?)',
      [req.user.id, total],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to create order' });
        }

        const orderId = this.lastID;

        // Add order items
        const stmt = db.prepare('INSERT INTO order_items (orderId, productId, quantity, price) VALUES (?, ?, ?, ?)');
        cartItems.forEach(item => {
          stmt.run([orderId, item.productId, item.quantity, item.price]);
        });
        stmt.finalize();

        // Clear cart
        db.run('DELETE FROM cart_items WHERE userId = ?', [req.user.id]);

        res.json({
          message: 'Order placed successfully',
          order: { id: orderId, total, status: 'pending' }
        });
      }
    );
  });
});

app.get('/api/orders', authenticateToken, (req, res) => {
  db.all('SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC', [req.user.id], (err, orders) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch orders' });
    }
    res.json(orders);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
