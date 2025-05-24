const { getAuth } = require('firebase-admin/auth');
const winston = require('winston');

const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    winston.error('Authentication error:', { error: error.message });
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = { authenticateUser }; 