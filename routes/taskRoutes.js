const express = require('express');
const Task = require('../models/task');
const router = express.Router();

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

// Create a new task
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;
    const task = await Task.create(req.session.userId, title, description, dueDate);
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error creating task', error: error.message });
  }
});

// Get all tasks for the authenticated user
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const tasks = await Task.findByUserId(req.session.userId);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks', error: error.message });
  }
});

// Get a specific task
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    if (task.user_id !== req.session.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching task', error: error.message });
  }
});

// Update a task
router.put('/:id', isAuthenticated, async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    if (task.user_id !== req.session.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const updatedTask = await Task.update(req.params.id, title, description, dueDate);
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Error updating task', error: error.message });
  }
});

// Delete a task
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    if (task.user_id !== req.session.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    await Task.delete(req.params.id);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting task', error: error.message });
  }
});

module.exports = router;
