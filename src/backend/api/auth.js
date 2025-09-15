const express = require('express')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const configManager = require('../config')
const { generateToken } = require('../auth/middleware')

const router = express.Router()

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' })
    }

    const config = configManager.getAppConfig()
    if (!config?.authentication?.enabled) {
      return res.status(400).json({ error: 'Authentication is not enabled' })
    }

    const authConfig = config.authentication

    // Check username
    if (username !== authConfig.username) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Hash the provided password with SHA256 (as specified in design)
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex')

    // Compare with stored password hash
    const isValidPassword = await bcrypt.compare(hashedPassword, authConfig.passwordHash)

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Generate JWT token
    const token = generateToken(
      { username, id: 1 },
      authConfig.jwtSecret,
      authConfig.jwtExpiration || '1h'
    )

    res.json({
      token,
      user: {
        username,
        id: 1
      },
      expiresIn: authConfig.jwtExpiration || '1h'
    })

  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Login failed' })
  }
})

// Generate JWT secret utility
router.post('/generate-secret', (req, res) => {
  try {
    const secret = crypto.randomBytes(32).toString('hex')
    res.json({ secret })
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate secret' })
  }
})

module.exports = router