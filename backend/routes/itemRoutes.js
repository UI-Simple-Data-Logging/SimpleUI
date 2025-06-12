const express = require('express');
const router = express.Router();
const Item = require('../models/Item');

// POST grouped payload for Silvering or Streeting
router.post('/', async (req, res) => {
  try {
    const {
      processType,
      squeegeeSpeed,
      printPressure,
      inkViscosity,
      temperature,
      speed,
      priority,
      targetMetricAffected,
      operator,
      timestamp
    } = req.body;

    // Basic processType check
    if (!processType) throw new Error('Missing processType');

    // Silvering validation
    if (processType === 'Silvering') {
      if (!squeegeeSpeed?.value || !printPressure?.value || !inkViscosity?.value) {
        throw new Error('Missing required silvering sensor values');
      }
    }

    // Streeting validation
    if (processType === 'Streeting') {
      if (!temperature?.value || !speed?.value) {
        throw new Error('Missing required streeting sensor values');
      }
    }

    const item = new Item({
      processType,
      squeegeeSpeed,
      printPressure,
      inkViscosity,
      temperature,
      speed,
      priority: priority || 'M',
      targetMetricAffected: targetMetricAffected || [],
      operator: operator || 'Unknown',
      timestamp: timestamp || Date.now()
    });

    const savedItem = await item.save();
    res.status(201).json(savedItem);
  } catch (err) {
    console.error('❌ Failed to create item:', err.message);
    res.status(400).json({ message: err.message });
  }
});

// GET items with optional filters
router.get('/', async (req, res) => {
  try {
    const filters = {};
    if (req.query.processType) filters.processType = req.query.processType;
    if (req.query.operator) filters.operator = req.query.operator;

    const items = await Item.find(filters).sort({ timestamp: -1 });
    res.status(200).json(items);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update item (supports nested fields)
router.put('/:id', async (req, res) => {
  try {
    const existing = await Item.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Item not found' });

    existing.processType = req.body.processType || existing.processType;
    existing.priority = req.body.priority || existing.priority;
    existing.targetMetricAffected = req.body.targetMetricAffected || existing.targetMetricAffected;
    existing.operator = req.body.operator || existing.operator;
    existing.timestamp = Date.now();

    const nestedFields = ['squeegeeSpeed', 'printPressure', 'inkViscosity', 'temperature', 'speed'];
    nestedFields.forEach(field => {
      if (req.body[field]) {
        existing[field] = {
          ...existing[field],
          ...req.body[field]
        };
      }
    });

    const updated = await existing.save();
    res.status(200).json(updated);
  } catch (err) {
    console.error('❌ Update failed:', err.message);
    res.status(400).json({ message: err.message });
  }
});

// DELETE item
router.delete('/:id', async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Item deleted' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;