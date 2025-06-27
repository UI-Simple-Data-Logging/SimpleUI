/**
 * Status Code Configuration
 * 
 * Centralized status code definitions for the Simple Data Logging application.
 * These codes are used throughout the application to identify data sources and types.
 */

export const STATUS_CODES = {
  // Department codes (First digit)
  DEPARTMENTS: {
    SILVERING: '1',
    STREETING: '2',
    QUALITY_CONTROL: '3'
  },

  // Source codes (Second digit)  
  SOURCES: {
    MANUAL_FORM: '1',
    SENSOR_DATA: '2'
  },

  // Sensor type codes (Third digit)
  SENSORS: {
    GENERAL: '0',
    CLICKER: '1',        // Squeegee Speed
    LOAD_CELL: '2',      // Print Pressure
    VISCOMETER: '3',     // Ink Viscosity
    THERMOMETER: '4',    // Temperature
    ENCODER: '5'         // Speed
  },

  // Parameter index codes (Fourth digit)
  PARAMETERS: {
    SINGLE: '0',
    FIRST: '1',
    SECOND: '2', 
    THIRD: '3'
  }
};

/**
 * Pre-defined status codes for common scenarios
 */
export const PREDEFINED_CODES = {
  // Silvering manual form entries
  SILVERING_MANUAL: '1100',
  SILVERING_SQUEEGEE_SPEED: '1110', 
  SILVERING_PRINT_PRESSURE: '1120',
  SILVERING_INK_VISCOSITY: '1130',

  // Silvering sensor data
  SILVERING_CLICKER_SENSOR: '1210',
  SILVERING_LOAD_CELL_SENSOR: '1220', 
  SILVERING_VISCOMETER_SENSOR: '1230',

  // Streeting manual form entries
  STREETING_MANUAL: '2100',
  STREETING_TEMPERATURE: '2110',
  STREETING_SPEED: '2120',

  // Streeting sensor data
  STREETING_THERMOMETER_SENSOR: '2240',
  STREETING_ENCODER_SENSOR: '2250',

  // Quality Control manual form entries
  QUALITY_CONTROL_MANUAL: '3100',
  QUALITY_CONTROL_SILVERING_STATION: '3110',
  QUALITY_CONTROL_STREETING_STATION: '3120',
  QUALITY_CONTROL_FINAL_PRODUCT: '3130'
};

/**
 * Generate status code based on parameters
 * @param {string} department - 'silvering' or 'streeting'
 * @param {string} source - 'manual' or 'sensor'
 * @param {string} sensorType - sensor type identifier
 * @param {number} paramIndex - parameter index (0-9)
 * @returns {string} 4-digit status code
 */
export const generateStatusCode = (department, source = 'manual', sensorType = 'general', paramIndex = 0) => {
  const dept = department.toLowerCase() === 'silvering' ? STATUS_CODES.DEPARTMENTS.SILVERING : STATUS_CODES.DEPARTMENTS.STREETING;
  const src = source === 'sensor' ? STATUS_CODES.SOURCES.SENSOR_DATA : STATUS_CODES.SOURCES.MANUAL_FORM;
  
  let sensor = STATUS_CODES.SENSORS.GENERAL;
  switch(sensorType.toLowerCase()) {
    case 'clicker':
      sensor = STATUS_CODES.SENSORS.CLICKER;
      break;
    case 'load_cell':
      sensor = STATUS_CODES.SENSORS.LOAD_CELL;
      break;
    case 'viscometer':
      sensor = STATUS_CODES.SENSORS.VISCOMETER;
      break;
    case 'thermometer':
      sensor = STATUS_CODES.SENSORS.THERMOMETER;
      break;
    case 'encoder':
      sensor = STATUS_CODES.SENSORS.ENCODER;
      break;
    default:
      sensor = STATUS_CODES.SENSORS.GENERAL; // Default to general if unknown
      break;
  }
  
  const param = Math.min(paramIndex, 9).toString();
  
  return dept + src + sensor + param;
};

/**
 * Decode status code into readable information
 * @param {string} statusCode - 4-digit status code
 * @returns {Object} Decoded status information
 */
export const decodeStatusCode = (statusCode) => {
  if (!statusCode || statusCode.length !== 4) {
    return { error: 'Invalid status code format' };
  }

  const [dept, src, sensor, param] = statusCode.split('');
  
  return {
    department: dept === '1' ? 'Silvering' : 'Streeting',
    source: src === '1' ? 'Manual Form' : 'Sensor Data',
    sensorType: getSensorName(sensor),
    parameterIndex: parseInt(param),
    fullCode: statusCode
  };
};

/**
 * Get sensor name from sensor code
 * @param {string} sensorCode - Single digit sensor code
 * @returns {string} Sensor name
 */
const getSensorName = (sensorCode) => {
  const sensorMap = {
    '0': 'General',
    '1': 'Clicker (Squeegee Speed)',
    '2': 'Load Cell (Print Pressure)',
    '3': 'Viscometer (Ink Viscosity)',
    '4': 'Thermometer (Temperature)',
    '5': 'Encoder (Speed)',
    '6': 'Humidity Sensor (Humidity)'
  };
  
  return sensorMap[sensorCode] || 'Unknown';
};

/**
 * Validate status code format
 * @param {string} statusCode - Status code to validate
 * @returns {boolean} True if valid
 */
export const validateStatusCode = (statusCode) => {
  return /^[12][12][0-5][0-9]$/.test(statusCode);
};