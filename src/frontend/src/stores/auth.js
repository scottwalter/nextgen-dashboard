import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService } from '../services/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('auth_token'))
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))

  const isAuthenticated = computed(() => !!token.value)

  const login = async (username, password) => {
    try {
      const response = await apiService.login(username, password)
      token.value = response.token
      user.value = response.user

      localStorage.setItem('auth_token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))

      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
  }

  return {
    token,
    user,
    isAuthenticated,
    login,
    logout
  }
})