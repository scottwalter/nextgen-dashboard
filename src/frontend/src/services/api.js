import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const apiService = {
  // Authentication
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password })
    return response.data
  },

  // Configuration
  getConfig: async () => {
    const response = await api.get('/config')
    return response.data
  },

  createConfig: async (config) => {
    const response = await api.post('/config', config)
    return response.data
  },

  updateConfig: async (config) => {
    const response = await api.put('/config', config)
    return response.data
  },

  // Device data
  getDeviceData: async (deviceId) => {
    const response = await api.get(`/devices/${deviceId}/data`)
    return response.data
  },

  getDeviceChartData: async (deviceId, hours = 24) => {
    const response = await api.get(`/devices/${deviceId}/chart?hours=${hours}`)
    return response.data
  },

  restartDevice: async (deviceId) => {
    const response = await api.post(`/devices/${deviceId}/restart`)
    return response.data
  },

  updateDeviceConfig: async (deviceId, config) => {
    const response = await api.put(`/devices/${deviceId}/config`, config)
    return response.data
  },

  getDeviceConfig: async (deviceId) => {
    const response = await api.get(`/devices/${deviceId}/config`)
    return response.data
  },

  // Mining core data
  getMiningCoreData: async () => {
    const response = await api.get('/mining-core/data')
    return response.data
  }
}