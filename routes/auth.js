const express = require('express');
const User = require('../models/user');
const { body, validationResult } = require('express-validator');
const router = express.Router();

router.post('/register', [
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
  body('email').isEmail().withMessage('Must be a valid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { username, password, email } = req.body;
    const user = await User.create(username, password, email);
    console.log('User registered:', user);
    res.status(201).json({ message: 'User created successfully', user });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

router.post('/login', [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { username, password } = req.body;
    console.log('Login attempt:', username);
    const user = await User.findByUsername(username);
    if (!user) {
      console.log('User not found:', username);
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    const isValid = await User.verifyPassword(user, password);
    if (!isValid) {
      console.log('Invalid password for user:', username);
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    
    // Set user session
    req.session.userId = user.id;
    console.log('Login successful:', username);

    res.json({ 
      message: 'Login successful', 
      user: { id: user.id, username: user.username, email: user.email }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ message: 'Could not log out, please try again' });
    }
    console.log('Logout successful');
    res.json({ message: 'Logout successful' });
  });
});

router.get('/check-status', (req, res) => {
  if (req.session.userId) {
    User.findById(req.session.userId)
      .then(user => {
        if (user) {
          res.json({ isLoggedIn: true, username: user.username });
        } else {
          res.json({ isLoggedIn: false });
        }
      })
      .catch(error => {
        console.error('Error checking user status:', error);
        res.status(500).json({ message: 'Error checking user status', error: error.message });
      });
  } else {
    res.json({ isLoggedIn: false });
  }
});

module.exports = router;
