// ============================================
// MES Application - Request Validator Middleware
// ============================================
const { AppError } = require('./errorHandler');

/**
 * Factory: returns middleware that validates req.body against a schema.
 * Schema is an object where keys map to validation rules.
 *
 * Example schema:
 *   { name: { required: true, type: 'string', maxLength: 100 } }
 */
const validate = (schema) => (req, _res, next) => {
  const errors = [];

  for (const [field, rules] of Object.entries(schema)) {
    const value = req.body[field];

    // Required check
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field} is required`);
      continue;
    }

    // Skip optional fields that are absent
    if (value === undefined || value === null) continue;

    // Type check
    if (rules.type && typeof value !== rules.type) {
      errors.push(`${field} must be a ${rules.type}`);
    }

    // Min / Max for numbers
    if (rules.type === 'number') {
      if (rules.min !== undefined && value < rules.min) {
        errors.push(`${field} must be at least ${rules.min}`);
      }
      if (rules.max !== undefined && value > rules.max) {
        errors.push(`${field} must be at most ${rules.max}`);
      }
    }

    // String constraints
    if (rules.type === 'string' && typeof value === 'string') {
      if (rules.maxLength && value.length > rules.maxLength) {
        errors.push(`${field} must be at most ${rules.maxLength} characters`);
      }
      if (rules.minLength && value.length < rules.minLength) {
        errors.push(`${field} must be at least ${rules.minLength} characters`);
      }
      if (rules.pattern && !rules.pattern.test(value)) {
        errors.push(`${field} format is invalid`);
      }
    }

    // Enum check
    if (rules.enum && !rules.enum.includes(value)) {
      errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
    }
  }

  if (errors.length > 0) {
    return next(new AppError('Validation failed', 400, errors));
  }

  next();
};

/**
 * Validate that req.params.id is a valid UUID.
 */
const validateUUID = (paramName = 'id') => (req, _res, next) => {
  const uuid = req.params[paramName];
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(uuid)) {
    return next(new AppError(`Invalid ${paramName}: must be a valid UUID`, 400));
  }
  next();
};

module.exports = { validate, validateUUID };
