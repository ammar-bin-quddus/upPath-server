const jwt = require('jsonwebtoken');

// Middleware to verify JWT token from the Authorization header
module.exports = (req, res, next) => {
  // Expecting the token in the format: "Bearer <token>"
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    // Verify token using secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to request object for use in routes
    req.user = decoded;
    next();
  } catch (err) {
    console.error('JWT verification failed:', err.message);
    res.status(403).json({ message: 'Invalid or expired token.' });
  }
};
