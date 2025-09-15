const express = require('express')
const configManager = require('../config')
const { authenticateToken } = require('../auth/middleware')

const router = express.Router()

// Get current configuration
router.get('/', (req, res) => {
  try {
    const config = configManager.getAppConfig()
    res.json(config || {})
  } catch (error) {
    res.status(500).json({ error: 'Failed to load configuration' })
  }
})

// Create initial configuration (bootstrap)
router.post('/', async (req, res) => {
  try {
    const {
      applicationTitle,
      authentication,
      devices,
      miningCore
    } = req.body

    // Validate required fields
    if (!applicationTitle) {
      return res.status(400).json({ error: 'Application title is required' })
    }

    if (!devices || devices.length === 0) {
      return res.status(400).json({ error: 'At least one device must be configured' })
    }

    // Validate device URLs
    for (const device of devices) {
      if (!device.name || !device.url) {
        return res.status(400).json({ error: 'Device name and URL are required' })
      }

      try {
        new URL(device.url)
      } catch (e) {
        return res.status(400).json({ error: `Invalid URL for device ${device.name}` })
      }
    }

    // Validate mining core URL if enabled
    if (miningCore?.enabled && miningCore.url) {
      try {
        new URL(miningCore.url)
      } catch (e) {
        return res.status(400).json({ error: 'Invalid mining core URL' })
      }
    }

    const config = {
      applicationTitle,
      version: '2.0.0',
      authentication: authentication || { enabled: false },
      devices,
      miningCore: miningCore || { enabled: false },
      refreshInterval: 25,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    configManager.saveAppConfig(config)
    res.json(config)
  } catch (error) {
    console.error('Configuration creation error:', error)
    res.status(500).json({ error: 'Failed to create configuration' })
  }
})

// Update configuration (requires authentication if enabled)
router.put('/', async (req, res) => {
  try {
    const currentConfig = configManager.getAppConfig()

    // Check if authentication is required
    if (currentConfig?.authentication?.enabled) {
      return authenticateToken(req, res, () => {
        updateConfiguration(req, res, currentConfig)
      })
    } else {
      updateConfiguration(req, res, currentConfig)
    }
  } catch (error) {
    console.error('Configuration update error:', error)
    res.status(500).json({ error: 'Failed to update configuration' })
  }
})

function updateConfiguration(req, res, currentConfig) {
  try {
    const updatedConfig = {
      ...currentConfig,
      ...req.body,
      updatedAt: new Date().toISOString()
    }

    configManager.saveAppConfig(updatedConfig)
    res.json(updatedConfig)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update configuration' })
  }
}

// Get device field mappings
router.get('/device-mappings', (req, res) => {
  try {
    res.json(configManager.getDeviceMappings())
  } catch (error) {
    res.status(500).json({ error: 'Failed to load device mappings' })
  }
})

// Get mining core field mappings
router.get('/mining-mappings', (req, res) => {
  try {
    res.json(configManager.getMiningMappings())
  } catch (error) {
    res.status(500).json({ error: 'Failed to load mining mappings' })
  }
})

module.exports = router