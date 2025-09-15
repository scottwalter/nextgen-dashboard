const express = require('express')
const configManager = require('../config')
const axeosService = require('../services/axeos')
const { authenticateToken } = require('../auth/middleware')

const router = express.Router()

// Middleware to check if authentication is required
function checkAuth(req, res, next) {
  const config = configManager.getAppConfig()
  if (config?.authentication?.enabled) {
    return authenticateToken(req, res, next)
  }
  next()
}

// Get device data
router.get('/:deviceId/data', checkAuth, async (req, res) => {
  try {
    const { deviceId } = req.params
    const config = configManager.getAppConfig()

    if (!config || !config.devices) {
      return res.status(404).json({ error: 'No devices configured' })
    }

    const device = config.devices.find(d => d.id === deviceId || d.name === deviceId)
    if (!device) {
      return res.status(404).json({ error: 'Device not found' })
    }

    const data = await axeosService.getDeviceData(device.url)
    const deviceMappings = configManager.getDeviceMappings()
    const miningMappings = configManager.getMiningMappings()

    // Process device mappings (array structure with categories)
    const processedCategories = {}
    if (deviceMappings && Array.isArray(deviceMappings)) {
      deviceMappings.forEach(category => {
        const categoryName = Object.keys(category)[0]
        const fields = category[categoryName]

        processedCategories[categoryName] = []
        fields.forEach(fieldMapping => {
          const fieldKey = Object.keys(fieldMapping)[0]
          const displayName = fieldMapping[fieldKey]

          if (data[fieldKey] !== undefined) {
            // Determine field type for formatting
            const miningMapping = miningMappings[fieldKey]
            const fieldType = miningMapping ? miningMapping.type : 'string'
            const unit = miningMapping ? miningMapping.unit : ''

            processedCategories[categoryName].push({
              key: fieldKey,
              raw: data[fieldKey],
              formatted: axeosService.formatValue(data[fieldKey], fieldType, unit),
              displayName: displayName,
              type: fieldType,
              unit: unit
            })
          }
        })
      })
    }

    res.json({
      deviceId,
      deviceName: device.name,
      status: data.status || 'online',
      lastUpdate: new Date().toISOString(),
      categories: processedCategories,
      raw: data
    })

  } catch (error) {
    console.error('Device data error:', error)
    res.status(500).json({ error: 'Failed to fetch device data' })
  }
})

// Get device chart data
router.get('/:deviceId/chart', checkAuth, async (req, res) => {
  try {
    const { deviceId } = req.params
    const { hours = 24 } = req.query
    const config = configManager.getAppConfig()

    const device = config.devices.find(d => d.id === deviceId || d.name === deviceId)
    if (!device) {
      return res.status(404).json({ error: 'Device not found' })
    }

    const chartData = await axeosService.getChartData(device.url, deviceId, parseInt(hours))
    res.json(chartData)

  } catch (error) {
    console.error('Device chart data error:', error)
    res.status(500).json({ error: 'Failed to fetch chart data' })
  }
})

// Restart device
router.post('/:deviceId/restart', checkAuth, async (req, res) => {
  try {
    const { deviceId } = req.params
    const config = configManager.getAppConfig()

    const device = config.devices.find(d => d.id === deviceId || d.name === deviceId)
    if (!device) {
      return res.status(404).json({ error: 'Device not found' })
    }

    await axeosService.restartDevice(device.url)
    res.json({ success: true, message: 'Device restart initiated' })

  } catch (error) {
    console.error('Device restart error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Get device configuration
router.get('/:deviceId/config', checkAuth, async (req, res) => {
  try {
    const { deviceId } = req.params
    const config = configManager.getAppConfig()

    const device = config.devices.find(d => d.id === deviceId || d.name === deviceId)
    if (!device) {
      return res.status(404).json({ error: 'Device not found' })
    }

    const deviceConfig = await axeosService.getDeviceConfig(device.url)
    res.json(deviceConfig)

  } catch (error) {
    console.error('Device config error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Update device configuration
router.put('/:deviceId/config', checkAuth, async (req, res) => {
  try {
    const { deviceId } = req.params
    const config = configManager.getAppConfig()

    const device = config.devices.find(d => d.id === deviceId || d.name === deviceId)
    if (!device) {
      return res.status(404).json({ error: 'Device not found' })
    }

    await axeosService.updateDeviceConfig(device.url, req.body)
    res.json({ success: true, message: 'Device configuration updated' })

  } catch (error) {
    console.error('Device config update error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Get all devices status
router.get('/', checkAuth, async (req, res) => {
  try {
    const config = configManager.getAppConfig()

    if (!config || !config.devices) {
      return res.json({ devices: [] })
    }

    const deviceStatuses = await Promise.all(
      config.devices.map(async (device) => {
        try {
          const data = await axeosService.getDeviceData(device.url)
          return {
            id: device.id || device.name,
            name: device.name,
            url: device.url,
            status: data.status,
            lastUpdate: data.lastUpdate
          }
        } catch (error) {
          return {
            id: device.id || device.name,
            name: device.name,
            url: device.url,
            status: 'unavailable',
            error: error.message,
            lastUpdate: new Date().toISOString()
          }
        }
      })
    )

    res.json({ devices: deviceStatuses })

  } catch (error) {
    console.error('Devices status error:', error)
    res.status(500).json({ error: 'Failed to fetch devices status' })
  }
})

module.exports = router