const express = require('express')
const axios = require('axios')
const configManager = require('../config')
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

// Get mining core data
router.get('/data', checkAuth, async (req, res) => {
  try {
    const config = configManager.getAppConfig()

    if (!config?.miningCore?.enabled) {
      return res.status(404).json({ error: 'Mining core integration is not enabled' })
    }

    if (!config.miningCore.url) {
      return res.status(400).json({ error: 'Mining core URL not configured' })
    }

    const data = await getMiningCoreData(config.miningCore.url)
    const mappings = configManager.miningMappings

    // Format the data according to mappings
    const formattedData = {}
    for (const [key, mapping] of Object.entries(mappings)) {
      if (data[key] !== undefined) {
        formattedData[key] = {
          raw: data[key],
          formatted: formatMiningCoreValue(data[key], mapping.type, mapping.unit),
          displayName: mapping.displayName,
          type: mapping.type
        }
      }
    }

    res.json({
      status: data.status,
      lastUpdate: data.lastUpdate,
      pools: data.pools || [],
      data: formattedData,
      raw: data
    })

  } catch (error) {
    console.error('Mining core data error:', error)
    res.status(500).json({ error: 'Failed to fetch mining core data' })
  }
})

async function getMiningCoreData(miningCoreUrl) {
  try {
    // This is a mock implementation - replace with actual Mining Core API calls
    const response = await axios.get(`${miningCoreUrl}/api/pools`, {
      timeout: 5000
    })

    // Mock data structure - adjust based on actual Mining Core API
    const mockData = {
      status: 'available',
      lastUpdate: new Date().toISOString(),
      networkHashrate: 450000000000000000, // Mock network hashrate in H/s
      networkDifficulty: 35000000000000,
      lastBlockTime: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      blockHeight: 810000,
      connectedPeers: 8,
      nodeVersion: '25.0.0',
      pools: [
        {
          name: 'Bitcoin Pool',
          connectedMiners: 245,
          poolHashrate: 125000000000000, // Pool hashrate in H/s
          totalPaid: 1.25430000,
          totalBlocks: 142,
          totalConfirmedBlocks: 140,
          totalPendingBlocks: 2,
          lastPoolBlockTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          blockReward: 6.25
        }
      ]
    }

    return mockData

  } catch (error) {
    console.error(`Failed to fetch mining core data from ${miningCoreUrl}:`, error.message)
    return {
      status: 'unavailable',
      error: error.message,
      lastUpdate: new Date().toISOString(),
      pools: []
    }
  }
}

function formatMiningCoreValue(value, type, unit) {
  if (value === null || value === undefined) {
    return 'N/A'
  }

  switch (type) {
    case 'hashrate':
      return formatHashrate(value)
    case 'difficulty':
      return formatDifficulty(value)
    case 'datetime':
      return new Date(value).toLocaleString()
    case 'currency':
      return `${parseFloat(value).toFixed(8)} ${unit}`
    case 'number':
      return value.toLocaleString()
    case 'string':
      return value
    default:
      return `${value}${unit ? ' ' + unit : ''}`
  }
}

function formatHashrate(value) {
  const units = ['H/s', 'KH/s', 'MH/s', 'GH/s', 'TH/s', 'PH/s', 'EH/s']
  let unitIndex = 0
  let hashrate = value

  while (hashrate >= 1000 && unitIndex < units.length - 1) {
    hashrate /= 1000
    unitIndex++
  }

  return `${hashrate.toFixed(2)} ${units[unitIndex]}`
}

function formatDifficulty(value) {
  const units = ['', 'K', 'M', 'G', 'T', 'P', 'E']
  let unitIndex = 0
  let difficulty = value

  while (difficulty >= 1000 && unitIndex < units.length - 1) {
    difficulty /= 1000
    unitIndex++
  }

  return `${difficulty.toFixed(2)}${units[unitIndex]}`
}

module.exports = router