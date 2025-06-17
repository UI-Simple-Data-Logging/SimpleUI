const mongoose = require('mongoose');

/**
 * Status Code Documentation
 * 
 * 4-digit status code format: XYZW
 * 
 * First digit (X): Department
 * - 1: Silvering
 * - 2: Streeting
 * 
 * Second digit (Y): Data Source
 * - 1: Manual Form Entry
 * - 2: Sensor Data
 * 
 * Third digit (Z): Sensor Type (only for sensor data, Y=2)
 * - 0: General/Manual
 * - 1: Clicker (Squeegee Speed)
 * - 2: Load Cell (Print Pressure) 
 * - 3: Viscometer (Ink Viscosity)
 * - 4: Thermometer (Temperature)
 * - 5: Encoder (Speed)
 * 
 * Fourth digit (W): Parameter Index
 * - 0: Single parameter or general
 * - 1: First parameter
 * - 2: Second parameter
 * - 3: Third parameter
 * 
 */

const itemSchema = new mongoose.Schema({
  processType: {
    type: String,
    enum: ['Silvering', 'Streeting', 'QualityControl'],
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

  // Quality Control fields
  processStation: {
    type: String,
    enum: ['Silvering', 'Streeting', 'Final Product check']
  },
  productId: {
    type: String
  },
  reworkability: {
    type: String,
    enum: ['Yes', 'No']
  },
  affectedOutput: [{ type: String }],

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
  
  // New fields
  statusCode: {
    type: String,
    required: true
  },
  reworked: {
    type: String,
    enum: ['Yes', 'No'],
    default: 'No'
  },
  decision: {
    type: String,
    enum: ['Yes', 'No', 'Goes to Rework'],
    default: 'Yes'
  },
  causeOfFailure: [{ type: String }],
  
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Pre-save middleware to auto-generate status code if not provided
itemSchema.pre('save', function(next) {
  if (!this.statusCode) {
    this.statusCode = generateStatusCode(this);
  }
  next();
});

/**
 * Generate status code based on item data
 * @param {Object} item - The item object
 * @returns {string} - 4-digit status code
 */
function generateStatusCode(item) {
  // First digit: Department
  let dept = '1'; // Default to silvering
  if (item.processType === 'Streeting') dept = '2';
  else if (item.processType === 'QualityControl') dept = '3';
  
  // Second digit: Always '1' for manual form entry (can be updated for sensor data)
  const source = '1';
  
  // Third and fourth digits: Default to '00' for manual entry
  const sensorAndParam = '00';
  
  return dept + source + sensorAndParam;
}

module.exports = mongoose.model('Item', itemSchema);
