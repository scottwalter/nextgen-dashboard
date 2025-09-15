const fs = require('fs-extra')
const path = require('path')

const CONFIG_PATH = path.join(__dirname, '../../../config')
const APP_CONFIG_FILE = path.join(CONFIG_PATH, 'app-config.json')
const DEVICE_MAPPINGS_FILE = path.join(CONFIG_PATH, 'device-mappings.json')
const MINING_MAPPINGS_FILE = path.join(CONFIG_PATH, 'mining-mappings.json')

class ConfigManager {
  constructor() {
    this.appConfig = null
    this.deviceMappings = null
    this.miningMappings = null
    this.init()
  }

  init() {
    fs.ensureDirSync(CONFIG_PATH)
    this.loadConfigs()
  }

  loadConfigs() {
    try {
      // Load app config
      if (fs.existsSync(APP_CONFIG_FILE)) {
        this.appConfig = fs.readJsonSync(APP_CONFIG_FILE)
      }

      // Load device mappings
      if (fs.existsSync(DEVICE_MAPPINGS_FILE)) {
        this.deviceMappings = fs.readJsonSync(DEVICE_MAPPINGS_FILE)
      } else {
        this.deviceMappings = this.getDefaultDeviceMappings()
        this.saveDeviceMappings()
      }

      // Load mining mappings
      if (fs.existsSync(MINING_MAPPINGS_FILE)) {
        this.miningMappings = fs.readJsonSync(MINING_MAPPINGS_FILE)
      } else {
        this.miningMappings = this.getDefaultMiningMappings()
        this.saveMiningMappings()
      }
    } catch (error) {
      console.error('Error loading configs:', error)
    }
  }

  getAppConfig() {
    return this.appConfig
  }

  saveAppConfig(config) {
    this.appConfig = config
    fs.writeJsonSync(APP_CONFIG_FILE, config, { spaces: 2 })
  }

  isConfigured() {
    return this.appConfig !== null && Object.keys(this.appConfig).length > 0
  }

  saveDeviceMappings() {
    fs.writeJsonSync(DEVICE_MAPPINGS_FILE, this.deviceMappings, { spaces: 2 })
  }

  saveMiningMappings() {
    fs.writeJsonSync(MINING_MAPPINGS_FILE, this.miningMappings, { spaces: 2 })
  }

  getDefaultDeviceMappings() {
    return [
      {
        "Mining Metrics": [
          { "hashRate": "Hashrate" },
          { "expectedHashrate": "Expect Hashrate" },
          { "bestDiff": "Best Difficulty" },
          { "bestSessionDiff": "Best Session Difficulty" },
          { "poolDifficulty": "Pool Difficulty" },
          { "sharesAccepted": "Shares Accepted" },
          { "sharesRejected": "Shares Rejected" },
          { "sharesRejectedReasons": "Shares Rejected Reasons" },
          { "responseTime": "Response Time" }
        ]
      },
      {
        "General Information": [
          { "hostname": "Hostname" },
          { "power": "Power" },
          { "voltage": "Voltage" },
          { "coreVoltageActual": "ASIC Voltage" },
          { "frequency": "Frequency" },
          { "temp": "ASIC Temp" },
          { "vrTemp": "VR Temp" },
          { "fanspeed": "Fan Speed" },
          { "minFanSpeed": "Min Fan Speed" },
          { "fanrpm": "Fan RPM" },
          { "temptarget": "Target Temp" },
          { "overheat_mode": "Over Heat Mode" },
          { "uptimeSeconds": "Uptime" },
          { "coreVoltage": "Core Voltage" },
          { "current": "Current" },
          { "wifiRSSI": "Wifi RSSI" },
          { "stratumURL": "Stratum URL" },
          { "stratumUser": "Stratum User" },
          { "stratumPort": "Stratum Port" },
          { "isUsingFallbackStratum": "Using Fallback Stratum" },
          { "axeOSVersion": "AxeOS Version" },
          { "idfVersion": "IDF Version" },
          { "boardVersion": "Board Version" },
          { "ASICModel": "ASIC Chip" }
        ]
      }
    ]
  }

  getDeviceMappings() {
    return this.deviceMappings
  }

  getMiningMappings() {
    return this.miningMappings
  }

  getDefaultMiningMappings() {
    return {
      "networkHashrate": {
        "displayName": "Network Hashrate",
        "type": "hashrate",
        "unit": "H/s"
      },
      "networkDifficulty": {
        "displayName": "Network Difficulty",
        "type": "difficulty",
        "unit": ""
      },
      "lastBlockTime": {
        "displayName": "Last Block Time",
        "type": "datetime",
        "unit": ""
      },
      "blockHeight": {
        "displayName": "Block Height",
        "type": "number",
        "unit": ""
      },
      "connectedPeers": {
        "displayName": "Connected Peers",
        "type": "number",
        "unit": ""
      },
      "nodeVersion": {
        "displayName": "Node Version",
        "type": "string",
        "unit": ""
      },
      "connectedMiners": {
        "displayName": "Connected Miners",
        "type": "number",
        "unit": ""
      },
      "poolHashrate": {
        "displayName": "Pool Hashrate",
        "type": "hashrate",
        "unit": "H/s"
      },
      "totalPaid": {
        "displayName": "Total Paid",
        "type": "currency",
        "unit": "BTC"
      },
      "totalBlocks": {
        "displayName": "Total Blocks",
        "type": "number",
        "unit": ""
      },
      "totalConfirmedBlocks": {
        "displayName": "Total Confirmed Blocks",
        "type": "number",
        "unit": ""
      },
      "totalPendingBlocks": {
        "displayName": "Total Pending Blocks",
        "type": "number",
        "unit": ""
      },
      "lastPoolBlockTime": {
        "displayName": "Last Pool Block Time",
        "type": "datetime",
        "unit": ""
      },
      "blockReward": {
        "displayName": "Block Reward",
        "type": "currency",
        "unit": "BTC"
      }
    }
  }
}

module.exports = new ConfigManager()