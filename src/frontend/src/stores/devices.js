import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import { apiService } from '../services/api'

export const useDevicesStore = defineStore('devices', () => {
  const devices = ref({})
  const miningCore = ref({})
  const loading = ref(false)
  const errors = reactive({})

  const updateDeviceData = async (deviceId) => {
    try {
      errors[deviceId] = null
      const response = await apiService.getDeviceData(deviceId)
      if (!devices.value[deviceId]) {
        devices.value[deviceId] = {}
      }
      devices.value[deviceId] = { ...devices.value[deviceId], ...response }
    } catch (error) {
      errors[deviceId] = error.message
      console.error(`Failed to update device ${deviceId}:`, error)
    }
  }

  const updateMiningCoreData = async () => {
    try {
      errors.miningCore = null
      const response = await apiService.getMiningCoreData()
      miningCore.value = response
    } catch (error) {
      errors.miningCore = error.message
      console.error('Failed to update mining core data:', error)
    }
  }

  const restartDevice = async (deviceId) => {
    try {
      await apiService.restartDevice(deviceId)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const updateDeviceConfig = async (deviceId, config) => {
    try {
      await apiService.updateDeviceConfig(deviceId, config)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const getDeviceChartData = async (deviceId, hours = 24) => {
    try {
      return await apiService.getDeviceChartData(deviceId, hours)
    } catch (error) {
      console.error(`Failed to get chart data for device ${deviceId}:`, error)
      throw error
    }
  }

  return {
    devices,
    miningCore,
    loading,
    errors,
    updateDeviceData,
    updateMiningCoreData,
    restartDevice,
    updateDeviceConfig,
    getDeviceChartData
  }
})