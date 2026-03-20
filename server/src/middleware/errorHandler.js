export const errorHandler = (err, req, res, next) => {
    console.error('Error:', err.message);
  
    // Multer errors (file too large, wrong type)
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
    }
    if (err.message === 'Only image files are allowed') {
      return res.status(400).json({ error: 'Only image files are allowed (jpg, png, gif, webp).' });
    }
  
    // Mongoose validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ error: messages[0] });
    }
  
    // Mongoose duplicate key
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      return res.status(409).json({ error: `${field} already exists` });
    }
  
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
  
    // Default
    res.status(err.status || 500).json({
      error: err.message || 'Internal server error'
    });
  };