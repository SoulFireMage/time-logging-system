const express = require('express');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const db = require('./db');
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/taskRoutes');
const User = require('./models/user');
const app = express();
const port = process.env.PORT || 3000;

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Session middleware
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // set to true if using https
}));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Authentication middleware
const authenticateUser = (req, res, next) => {
  console.log('Session:', req.session);
  if (req.session.userId) {
    console.log('User authenticated:', req.session.userId);
    next();
  } else {
    console.log('User not authenticated, redirecting to home');
    res.redirect('/');
  }
};

// Routes
app.use('/auth', authRoutes);
app.use('/tasks', authenticateUser, taskRoutes);

app.get('/', (req, res) => {
  res.render('index', { title: 'Time Logging System' });
});

// Protected dashboard route
app.get('/dashboard', authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      console.log('User not found:', req.session.userId);
      return res.status(404).json({ message: 'User not found' });
    }
    console.log('Rendering dashboard for user:', user.username);
    res.render('dashboard', { title: 'Dashboard', user: user });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ message: 'Error fetching user data', error: error.message });
  }
});

// Database status route
app.get('/db-status', (req, res) => {
  db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
    if (err) {
      console.error('Error getting table names:', err);
      res.status(500).json({ error: 'Error getting table names', details: err.message });
    } else {
      console.log('Database tables:', tables.map(table => table.name));
      res.json({ tables: tables.map(table => table.name) });
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// 404 handler
app.use((req, res, next) => {
  console.log('404 - Route not found:', req.url);
  res.status(404).json({ message: 'Route not found' });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log('Visit http://localhost:3000 to access the Time Logging System');
});
