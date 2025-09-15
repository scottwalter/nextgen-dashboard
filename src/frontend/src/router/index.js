import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useConfigStore } from '../stores/config'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
      beforeEnter: async (to, from, next) => {
        const configStore = useConfigStore()

        // Ensure config is loaded
        if (!configStore.config || Object.keys(configStore.config).length === 0) {
          await configStore.loadConfig()
        }

        if (!configStore.isConfigured) {
          next('/bootstrap')
          return
        }

        const authStore = useAuthStore()
        if (configStore.config.authentication?.enabled && !authStore.isAuthenticated) {
          next('/login')
          return
        }

        next()
      }
    },
    {
      path: '/bootstrap',
      name: 'bootstrap',
      component: () => import('../views/BootstrapView.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      beforeEnter: (to, from, next) => {
        const configStore = useConfigStore()
        if (!configStore.config.authentication?.enabled) {
          next('/')
          return
        }
        next()
      }
    }
  ]
})

export default router