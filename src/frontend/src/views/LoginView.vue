<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <h1>Bitaxe Dashboard</h1>
        <p class="version">Version: {{ version }}</p>
      </div>

      <div class="login-form-container">
        <form @submit.prevent="handleLogin" class="login-form">
          <h2>Login</h2>

          <div class="form-group">
            <label class="form-label" for="username">Username</label>
            <input
              v-model="credentials.username"
              type="text"
              id="username"
              class="form-input"
              required
              autofocus
              :disabled="isLoggingIn"
            >
          </div>

          <div class="form-group">
            <label class="form-label" for="password">Password</label>
            <input
              v-model="credentials.password"
              type="password"
              id="password"
              class="form-input"
              required
              :disabled="isLoggingIn"
            >
          </div>

          <button
            type="submit"
            class="btn btn-primary login-btn"
            :disabled="isLoggingIn || !isFormValid"
          >
            {{ isLoggingIn ? 'Logging in...' : 'Login' }}
          </button>

          <div v-if="error" class="error">
            {{ error }}
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useConfigStore } from '../stores/config'

const router = useRouter()
const authStore = useAuthStore()
const configStore = useConfigStore()

const credentials = ref({
  username: '',
  password: ''
})

const isLoggingIn = ref(false)
const error = ref('')
const version = ref('2.0.0')

const isFormValid = computed(() => {
  return credentials.value.username.trim() && credentials.value.password.trim()
})

const handleLogin = async () => {
  if (!isFormValid.value || isLoggingIn.value) return

  error.value = ''
  isLoggingIn.value = true

  try {
    const result = await authStore.login(credentials.value.username, credentials.value.password)

    if (result.success) {
      // Redirect to dashboard
      router.push('/')
    } else {
      error.value = result.error || 'Login failed'
      // Clear password field on error
      credentials.value.password = ''
    }
  } catch (err) {
    error.value = 'An unexpected error occurred'
    credentials.value.password = ''
  } finally {
    isLoggingIn.value = false
  }
}

onMounted(() => {
  // Load config to get version info
  if (configStore.config?.version) {
    version.value = configStore.config.version
  }

  // If user is already authenticated, redirect to dashboard
  if (authStore.isAuthenticated) {
    router.push('/')
  }
})
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background-color: var(--color-dark-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.login-container {
  width: 100%;
  max-width: 500px;
  background-color: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.login-header {
  background-color: var(--color-dark-header);
  padding: 2rem;
  text-align: center;
  border-bottom: 1px solid var(--color-border);
}

.login-header h1 {
  font-size: 2rem;
  font-weight: 600;
  color: var(--color-white);
  margin-bottom: 0.5rem;
}

.version {
  color: var(--color-text-muted);
  font-size: 0.9rem;
  margin: 0;
}

.login-form-container {
  padding: 3rem 2rem;
}

.login-form h2 {
  text-align: center;
  color: var(--color-red);
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 2rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--color-red);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--color-white);
  font-size: 0.95rem;
}

.form-input {
  width: 100%;
  padding: 1rem;
  font-size: 1rem;
  background-color: var(--color-dark-bg);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  color: var(--color-white);
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-red);
}

.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-btn {
  width: 100%;
  padding: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
  margin-top: 1rem;
  transition: all 0.2s;
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(255, 23, 68, 0.3);
}

.error {
  margin-top: 1rem;
  text-align: center;
}

/* Loading spinner for login button */
.login-btn:disabled::after {
  content: '';
  display: inline-block;
  width: 16px;
  height: 16px;
  margin-left: 0.5rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  vertical-align: middle;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .login-page {
    padding: 1rem;
  }

  .login-form-container {
    padding: 2rem 1.5rem;
  }

  .login-header {
    padding: 1.5rem;
  }

  .login-header h1 {
    font-size: 1.6rem;
  }
}
</style>