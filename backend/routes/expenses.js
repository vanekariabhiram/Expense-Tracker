const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

// Get all expenses for user
router.get('/', auth, async (req, res) => {
  try {
    const [expenses] = await db.query(
      `SELECT e.*, c.name as category_name 
       FROM expenses e 
       LEFT JOIN categories c ON e.category_id = c.id 
       WHERE e.user_id = ? 
       ORDER BY e.date DESC`,
      [req.userId]
    );
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add expense
router.post('/', auth, async (req, res) => {
  try {
    const { amount, description, date, category_id } = req.body;
    
    const [result] = await db.query(
      'INSERT INTO expenses (user_id, amount, description, date, category_id) VALUES (?, ?, ?, ?, ?)',
      [req.userId, amount, description, date, category_id]
    );

    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update expense
router.put('/:id', auth, async (req, res) => {
  try {
    const { amount, description, date, category_id } = req.body;
    
    await db.query(
      'UPDATE expenses SET amount = ?, description = ?, date = ?, category_id = ? WHERE id = ? AND user_id = ?',
      [amount, description, date, category_id, req.params.id, req.userId]
    );

    res.json({ message: 'Expense updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete expense
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.query(
      'DELETE FROM expenses WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId]
    );

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get categories
router.get('/categories', auth, async (req, res) => {
  try {
    const [categories] = await db.query(
      'SELECT * FROM categories WHERE user_id = ? OR user_id IS NULL',
      [req.userId]
    );
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add category
router.post('/categories', auth, async (req, res) => {
  try {
    const { name } = req.body;
    
    const [result] = await db.query(
      'INSERT INTO categories (name, user_id) VALUES (?, ?)',
      [name, req.userId]
    );

    res.status(201).json({ id: result.insertId, name });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;