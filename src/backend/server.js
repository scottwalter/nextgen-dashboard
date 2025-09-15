const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const path = require('path')
const fs = require('fs-extra')

const authRoutes = require('./api/auth')
const configRoutes = require('./api/config')
const deviceRoutes = require('./api/devices')
const miningCoreRoutes = require('./api/mining-core')

const app = express()
const PORT = process.env.PORT || 3000

// Security middleware
app.use(helmet())
app.use(cors())

// Body parsing middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Ensure config directory exists
const configDir = path.join(__dirname, '../../config')
fs.ensureDirSync(configDir)

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/config', configRoutes)
app.use('/api/devices', deviceRoutes)
app.use('/api/mining-core', miningCoreRoutes)

// Serve static files from public directory (built Vue.js app)
app.use(express.static(path.join(__dirname, '../../public')))

// SPA fallback - serve index.html for all non-API routes (but not API routes)
app.get('*', (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' })
  }
  res.sendFile(path.join(__dirname, '../../public/index.html'))
})

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error)
  res.status(error.status || 500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`Bitaxe Dashboard server running on port ${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
})