const jwt = require('jsonwebtoken');
require('dotenv').config();


function authenticateToken(req, res, next) {
  // Token from cookie first, fallback to Authorization header
  const token = req.cookies?.token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);

  if (!token) {
    return res.status(401).sendFile(__dirname + '/unauthorized.html')
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) {
      console.error('JWT verify error:', err);
      return res.status(403).json({ error: 'Forbidden: invalid token' });
    }

    // attach user info to request
    req.user = payload; // e.g. { username, role, iat, exp }
    next();
  });
}

function adminOnly(req, res, next) {
  if (!req.user) {
    return res.redirect('/login');
  }

  if (req.user.role === 'admin') { // ✅ match token payload key
    return next();
  } else {
    return res.redirect('/dashboardUser');
  }
}

module.exports = { authenticateToken, adminOnly };
