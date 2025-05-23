// backend/routes/itemRoutes.js

const express = require('express');
const router = express.Router();
const Item = require('../models/Item');

// Create
router.post('/', async (req, res) => {
  try {
    const newItem = new Item(req.body);
    const saved = await newItem.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Read
router.get('/', async (req, res) => {
  try {
    const items = await Item.find();
    res.status(200).json(items);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const existing = await Item.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Item not found' });

    existing.name = req.body.name;
    existing.value = req.body.value;
    existing.timestamp = Date.now(); // 👈 update timestamp on edit
    // Preserve original timestamp
    await existing.save();

    res.status(200).json(existing);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete
router.delete('/:id', async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Item deleted' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;