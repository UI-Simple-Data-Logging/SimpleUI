const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  processType: {
    type: String,
    enum: ['Silvering', 'Streeting'],
    required: true
  },

  // Silvering fields
  squeegeeSpeed: {
    value: { type: Number },
    unit: { type: String, default: 'mm/s' },
    deviceSource: { type: String, default: 'clicker' }
  },
  printPressure: {
    value: { type: Number },
    unit: { type: String, default: 'N/m²' },
    deviceSource: { type: String, default: 'load_cell' }
  },
  inkViscosity: {
    value: { type: Number },
    unit: { type: String, default: 'cP' },
    deviceSource: { type: String, default: 'viscometer' }
  },

  // Streeting fields
  temperature: {
    value: { type: Number },
    unit: { type: String, default: '°C' },
    deviceSource: { type: String, default: 'thermometer' }
  },
  speed: {
    value: { type: Number },
    unit: { type: String, default: 'mm/s' },
    deviceSource: { type: String, default: 'encoder' }
  },

  // Shared fields
  priority: {
    type: String,
    enum: ['L', 'M', 'H'],
    default: 'M'
  },
  targetMetricAffected: [{ type: String }],
  operator: {
    type: String,
    default: 'Unknown'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Item', itemSchema);
