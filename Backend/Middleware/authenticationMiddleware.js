// authenticationMiddleware.js

// Authentication middleware function (skips authentication)
function authenticateUser(req, res, next) {
  // Skip authentication check since there are no user accounts
  next();
}

module.exports = { authenticateUser };
