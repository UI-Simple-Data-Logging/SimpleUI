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
      humidity,
      temperature,
      speed,
      processStation,
      productId,
      reworkability,
      affectedOutput,
      priority,
      targetMetricAffected,
      operator,
      statusCode,
      reworked,
      decision,
      causeOfFailure,
      timestamp
    } = req.body;

    // Basic processType check
    if (!processType) throw new Error('Missing processType');

    // Silvering validation
    if (processType === 'Silvering') {
      if (!squeegeeSpeed?.value || !printPressure?.value || !inkViscosity?.value || !humidity?.value) {
        throw new Error('Missing required silvering sensor values');
      }
    }

    // Streeting validation
    if (processType === 'Streeting') {
      if (!temperature?.value || !speed?.value) {
        throw new Error('Missing required streeting sensor values');
      }
    }

    // Quality Control validation
    if (processType === 'QualityControl') {
      if (!processStation || !productId) {
        throw new Error('Missing required quality control fields');
      }
    }

    // Validate causeOfFailure when decision is false or goes to rework
    if ((decision === 'No' || decision === 'Goes to Rework') && (!causeOfFailure || causeOfFailure.length === 0)) {
      throw new Error('Cause of failure is required when decision is No or Goes to Rework');
    }

    const item = new Item({
      processType,
      squeegeeSpeed,
      printPressure,
      inkViscosity,
      humidity,
      temperature,
      speed,
      processStation,
      productId,
      reworkability,
      affectedOutput: affectedOutput || [],
      priority: priority || 'M',
      targetMetricAffected: targetMetricAffected || [],
      operator: operator || 'Unknown',
      statusCode,
      reworked: reworked || 'No',
      decision: decision || 'Yes',
      causeOfFailure: causeOfFailure || [],
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
    existing.processStation = req.body.processStation || existing.processStation;
    existing.productId = req.body.productId || existing.productId;
    existing.reworkability = req.body.reworkability || existing.reworkability;
    existing.affectedOutput = req.body.affectedOutput || existing.affectedOutput;
    existing.priority = req.body.priority || existing.priority;
    existing.targetMetricAffected = req.body.targetMetricAffected || existing.targetMetricAffected;
    existing.operator = req.body.operator || existing.operator;
    existing.statusCode = req.body.statusCode || existing.statusCode;
    existing.reworked = req.body.reworked !== undefined ? req.body.reworked : existing.reworked;
    existing.decision = req.body.decision !== undefined ? req.body.decision : existing.decision;
    existing.causeOfFailure = req.body.causeOfFailure !== undefined ? req.body.causeOfFailure : existing.causeOfFailure;
    existing.timestamp = Date.now();

    // Validate causeOfFailure when decision is false or goes to rework
    if ((existing.decision === 'No' || existing.decision === 'Goes to Rework') && 
        (!existing.causeOfFailure || existing.causeOfFailure.length === 0)) {
      throw new Error('Cause of failure is required when decision is No or Goes to Rework');
    }

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