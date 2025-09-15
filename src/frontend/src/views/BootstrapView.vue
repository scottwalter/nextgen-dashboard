<template>
  <div class="bootstrap-page">
    <div class="bootstrap-container">
      <div class="bootstrap-header">
        <h1>Bitaxe Dashboard - First Time Setup</h1>
        <p class="version">Version 2.0</p>
      </div>

      <div class="bootstrap-content">
        <div class="welcome-section">
          <h2>Welcome to Bitaxe Dashboard</h2>
          <p>This system is for your first-time viewing the application. Please configure the initial settings below.</p>
          <p class="warning">
            <strong>Note:</strong> Once you save the settings your application will automatically reload and take you
            to the main page (or login page if authentication is enabled).
          </p>
        </div>

        <form @submit.prevent="submitConfiguration" class="bootstrap-form">
          <div class="form-section">
            <h3>Basic Settings</h3>

            <div class="form-group">
              <label class="form-label" for="appTitle">Application Title *</label>
              <input
                v-model="config.applicationTitle"
                type="text"
                id="appTitle"
                class="form-input"
                required
                placeholder="Enter application title"
              >
            </div>

            <div class="form-group">
              <label class="form-label" for="url">URL</label>
              <input
                v-model="config.url"
                type="url"
                id="url"
                class="form-input"
                placeholder="http://localhost:3000"
              >
            </div>
          </div>

          <div class="form-section">
            <h3>Authentication Settings</h3>

            <div class="form-group">
              <label class="checkbox-label">
                <input
                  v-model="config.authentication.enabled"
                  type="checkbox"
                  class="form-checkbox"
                >
                Enable Authentication
              </label>
              <p class="form-help">Secure access using username/password + JWTokens</p>
            </div>

            <div v-if="config.authentication.enabled" class="auth-settings">
              <div class="form-group">
                <label class="form-label" for="username">Username *</label>
                <input
                  v-model="config.authentication.username"
                  type="text"
                  id="username"
                  class="form-input"
                  required
                  placeholder="Enter username"
                >
              </div>

              <div class="form-group">
                <label class="form-label" for="password">Password *</label>
                <div class="password-input">
                  <input
                    v-model="config.authentication.password"
                    :type="showPassword ? 'text' : 'password'"
                    id="password"
                    class="form-input"
                    required
                    placeholder="Enter password"
                  >
                  <button
                    type="button"
                    @click="showPassword = !showPassword"
                    class="password-toggle"
                  >
                    {{ showPassword ? 'Hide' : 'Show' }}
                  </button>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">JWT Token Key</label>
                <div class="jwt-input">
                  <input
                    v-model="config.authentication.jwtSecret"
                    type="text"
                    class="form-input"
                    placeholder="32 character JWT token key"
                    readonly
                  >
                  <button
                    type="button"
                    @click="generateJWTSecret"
                    class="btn btn-secondary"
                  >
                    Generate Key
                  </button>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="jwtAge">JWT Token Age</label>
                <select v-model="config.authentication.jwtExpiration" id="jwtAge" class="form-select">
                  <option value="1h">1 Hour</option>
                  <option value="6h">6 Hours</option>
                  <option value="12h">12 Hours</option>
                  <option value="1d">1 Day</option>
                  <option value="7d">7 Days</option>
                </select>
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3>Bitaxe Devices</h3>
            <p>Add your Bitaxe devices that you want to monitor through the configuration below.</p>

            <div
              v-for="(device, index) in config.devices"
              :key="index"
              class="device-config"
            >
              <div class="device-header">
                <h4>Device {{ index + 1 }}</h4>
                <button
                  v-if="config.devices.length > 1"
                  type="button"
                  @click="removeDevice(index)"
                  class="btn btn-secondary"
                >
                  Remove
                </button>
              </div>

              <div class="form-group">
                <label class="form-label">Device Name *</label>
                <input
                  v-model="device.name"
                  type="text"
                  class="form-input"
                  required
                  placeholder="e.g., Bitaxe1"
                >
              </div>

              <div class="form-group">
                <label class="form-label">Device URL *</label>
                <input
                  v-model="device.url"
                  type="url"
                  class="form-input"
                  required
                  placeholder="e.g., http://192.168.7.220"
                >
              </div>
            </div>

            <button
              type="button"
              @click="addDevice"
              class="btn btn-secondary"
            >
              Add Another Device
            </button>
          </div>

          <div class="form-section">
            <h3>Mining Core Integration (Optional)</h3>

            <div class="form-group">
              <label class="checkbox-label">
                <input
                  v-model="config.miningCore.enabled"
                  type="checkbox"
                  class="form-checkbox"
                >
                Enable Mining Core Integration
              </label>
              <p class="form-help">Connect to mining pool software for additional statistics</p>
            </div>

            <div v-if="config.miningCore.enabled" class="mining-core-settings">
              <div class="form-group">
                <label class="form-label" for="miningCoreUrl">Mining Core API URL *</label>
                <input
                  v-model="config.miningCore.url"
                  type="url"
                  id="miningCoreUrl"
                  class="form-input"
                  required
                  placeholder="e.g., http://192.168.7.149:4000"
                >
                <p class="form-help">URL to your mining core API endpoint</p>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button
              type="submit"
              :disabled="isSubmitting"
              class="btn btn-primary submit-btn"
            >
              {{ isSubmitting ? 'Creating Configuration...' : 'Create Configuration' }}
            </button>
          </div>

          <div v-if="error" class="error">
            {{ error }}
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useConfigStore } from '../stores/config'
import { apiService } from '../services/api'

const router = useRouter()
const configStore = useConfigStore()

const showPassword = ref(false)
const isSubmitting = ref(false)
const error = ref('')

const config = reactive({
  applicationTitle: 'Bitaxe Dashboard',
  url: window.location.origin,
  authentication: {
    enabled: false,
    username: '',
    password: '',
    jwtSecret: '',
    jwtExpiration: '1d'
  },
  devices: [
    {
      name: '',
      url: ''
    }
  ],
  miningCore: {
    enabled: false,
    url: ''
  }
})

const addDevice = () => {
  config.devices.push({
    name: '',
    url: ''
  })
}

const removeDevice = (index) => {
  config.devices.splice(index, 1)
}

const generateJWTSecret = async () => {
  try {
    const response = await apiService.login('', '') // This will fail but that's ok
  } catch (err) {
    // Generate client-side fallback
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    config.authentication.jwtSecret = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }
}

const validateConfiguration = () => {
  if (!config.applicationTitle.trim()) {
    throw new Error('Application title is required')
  }

  if (config.devices.length === 0) {
    throw new Error('At least one device must be configured')
  }

  for (let i = 0; i < config.devices.length; i++) {
    const device = config.devices[i]
    if (!device.name.trim()) {
      throw new Error(`Device ${i + 1} name is required`)
    }
    if (!device.url.trim()) {
      throw new Error(`Device ${i + 1} URL is required`)
    }
    try {
      new URL(device.url)
    } catch (e) {
      throw new Error(`Device ${i + 1} has an invalid URL`)
    }
  }

  if (config.authentication.enabled) {
    if (!config.authentication.username.trim()) {
      throw new Error('Username is required when authentication is enabled')
    }
    if (!config.authentication.password.trim()) {
      throw new Error('Password is required when authentication is enabled')
    }
    if (!config.authentication.jwtSecret.trim()) {
      throw new Error('JWT secret must be generated when authentication is enabled')
    }
  }

  if (config.miningCore.enabled && !config.miningCore.url.trim()) {
    throw new Error('Mining core URL is required when mining core integration is enabled')
  }

  if (config.miningCore.enabled && config.miningCore.url.trim()) {
    try {
      new URL(config.miningCore.url)
    } catch (e) {
      throw new Error('Mining core URL is invalid')
    }
  }
}

const submitConfiguration = async () => {
  error.value = ''
  isSubmitting.value = true

  try {
    validateConfiguration()

    // Add IDs to devices
    config.devices.forEach((device, index) => {
      device.id = device.name.toLowerCase().replace(/\s+/g, '-') || `device-${index + 1}`
    })

    const result = await configStore.createConfig(config)

    if (result.success) {
      // Navigate to home page
      router.push('/')
    } else {
      error.value = result.error || 'Failed to create configuration'
    }
  } catch (err) {
    error.value = err.message
  } finally {
    isSubmitting.value = false
  }
}

// Generate initial JWT secret
generateJWTSecret()
</script>

<style scoped>
.bootstrap-page {
  min-height: 100vh;
  background-color: var(--color-dark-bg);
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.bootstrap-container {
  width: 100%;
  max-width: 800px;
  background-color: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  overflow: hidden;
}

.bootstrap-header {
  background-color: var(--color-dark-header);
  padding: 2rem;
  text-align: center;
  border-bottom: 1px solid var(--color-border);
}

.bootstrap-header h1 {
  margin-bottom: 0.5rem;
  color: var(--color-white);
}

.version {
  color: var(--color-text-muted);
  margin: 0;
}

.bootstrap-content {
  padding: 2rem;
}

.welcome-section {
  margin-bottom: 2rem;
}

.welcome-section h2 {
  color: var(--color-red);
  margin-bottom: 1rem;
}

.warning {
  background-color: rgba(255, 23, 68, 0.1);
  border: 1px solid var(--color-red);
  padding: 1rem;
  border-radius: 4px;
  margin-top: 1rem;
}

.form-section {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--color-border);
}

.form-section:last-child {
  border-bottom: none;
}

.form-section h3 {
  color: var(--color-white);
  margin-bottom: 1rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  margin-bottom: 0.5rem;
}

.form-help {
  color: var(--color-text-muted);
  font-size: 0.9rem;
  margin: 0.5rem 0 0 0;
}

.auth-settings {
  margin-top: 1rem;
  padding: 1rem;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.password-input {
  display: flex;
  gap: 0.5rem;
}

.password-input input {
  flex: 1;
}

.password-toggle {
  padding: 0.75rem 1rem;
  background-color: var(--color-border);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  color: var(--color-white);
  cursor: pointer;
  font-size: 0.9rem;
}

.jwt-input {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.jwt-input input {
  flex: 1;
}

.device-config {
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.device-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.device-header h4 {
  color: var(--color-white);
  margin: 0;
}

.mining-core-settings {
  margin-top: 1rem;
  padding: 1rem;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.submit-btn {
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .bootstrap-page {
    padding: 1rem;
  }

  .bootstrap-container {
    margin: 0;
  }

  .bootstrap-content {
    padding: 1rem;
  }

  .password-input,
  .jwt-input {
    flex-direction: column;
  }
}
</style>