// src/utils/testUtils.js
const jwt = require('jsonwebtoken');

exports.generateTestToken = () => {
  return jwt.sign({ id: 1, role: 'test-user' }, process.env.JWT_SECRET || 'test-secret', { expiresIn: '1h' });
};
