import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService } from '../services/api'

export const useConfigStore = defineStore('config', () => {
  const config = ref({})
  const loading = ref(false)

  const isConfigured = computed(() => {
    return config.value && Object.keys(config.value).length > 0
  })

  const loadConfig = async () => {
    loading.value = true
    try {
      const response = await apiService.getConfig()
      config.value = response
    } catch (error) {
      console.error('Failed to load config:', error)
      config.value = {}
    } finally {
      loading.value = false
    }
  }

  const updateConfig = async (newConfig) => {
    try {
      const response = await apiService.updateConfig(newConfig)
      config.value = response
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const createConfig = async (initialConfig) => {
    try {
      const response = await apiService.createConfig(initialConfig)
      config.value = response
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  return {
    config,
    loading,
    isConfigured,
    loadConfig,
    updateConfig,
    createConfig
  }
})