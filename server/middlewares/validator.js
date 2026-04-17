/**
 * Phaistos schema validation middleware factory.
 *
 * Usage:
 *   const { validate } = require('../middlewares/validator');
 *   const userSchema = require('../../shared/schemas/user.schema.json');
 *   router.post('/register', validate(userSchema), authController.register);
 *
 * Phaistos validates req.body against the provided JSON Schema.
 * On failure it returns 400 with a list of validation errors.
 */

// TODO: install phaistos — `npm install phaistos` — and replace the stub below
// const Phaistos = require('phaistos');

/**
 * Stub validator — replace with real Phaistos call once the package is installed.
 * Currently performs basic required-field checking as a placeholder.
 *
 * @param {object} schema - JSON Schema object
 * @returns Express middleware function
 */
function validate(schema) {
  return function validationMiddleware(req, res, next) {
    // TODO: replace stub with Phaistos.validate(schema, req.body)
    if (!schema || !schema.required) {
      return next();
    }

    const missing = schema.required.filter(
      (field) => req.body[field] === undefined || req.body[field] === null || req.body[field] === ''
    );

    if (missing.length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        details: missing.map((f) => `${f} is required`),
      });
    }

    // TODO: add pattern validation (linkedin, github URLs) via Phaistos
    return next();
  };
}

module.exports = { validate };
