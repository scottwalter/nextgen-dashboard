const jwt = require('jsonwebtoken')
const configManager = require('../config')

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Access token required' })
  }

  const config = configManager.getAppConfig()
  if (!config?.authentication?.jwtSecret) {
    return res.status(500).json({ error: 'JWT secret not configured' })
  }

  jwt.verify(token, config.authentication.jwtSecret, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' })
    }

    req.user = decoded
    next()
  })
}

function generateToken(user, jwtSecret, expiresIn = '1h') {
  return jwt.sign(
    {
      username: user.username,
      id: user.id || 1,
      iat: Math.floor(Date.now() / 1000)
    },
    jwtSecret,
    { expiresIn }
  )
}

module.exports = {
  authenticateToken,
  generateToken
}