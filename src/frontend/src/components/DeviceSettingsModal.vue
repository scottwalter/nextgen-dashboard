<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content settings-modal" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">Settings for {{ device?.name }}</h3>
        <button @click="$emit('close')" class="modal-close">×</button>
      </div>

      <div class="modal-body">
        <div v-if="loading" class="loading">
          <div class="spinner"></div>
          <p>Loading device settings...</p>
        </div>

        <div v-else-if="error" class="error">
          <p>{{ error }}</p>
          <button @click="loadDeviceConfig" class="btn btn-secondary">Retry</button>
        </div>

        <div v-else class="settings-form">
          <!-- Device Section -->
          <div class="settings-section">
            <h4>Device</h4>
            <div class="form-group">
              <label class="form-label">Hostname</label>
              <input v-model="settings.hostname" type="text" class="form-input">
            </div>
            <div class="form-group">
              <label class="checkbox-label">
                <input v-model="settings.invertScreen" type="checkbox" class="form-checkbox">
                Invert Screen
              </label>
            </div>
            <div class="form-group">
              <label class="form-label">Screen Resolution</label>
              <select v-model="settings.screenResolution" class="form-select">
                <option value="64x128">64x128</option>
                <option value="64x32">64x32</option>
                <option value="32x128">32x128</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Display Timeout (mins)</label>
              <input v-model.number="settings.displayTimeout" type="number" class="form-input" min="0" max="60">
            </div>
          </div>

          <!-- WiFi Section -->
          <div class="settings-section">
            <h4>WiFi</h4>
            <div class="form-group">
              <label class="form-label">SSID</label>
              <input v-model="settings.wifiSSID" type="text" class="form-input">
            </div>
            <div class="form-group">
              <label class="form-label">Password</label>
              <input v-model="settings.wifiPassword" type="password" class="form-input" placeholder="Leave blank to keep current">
            </div>
          </div>

          <!-- Mining Section -->
          <div class="settings-section">
            <h4>Mining</h4>
            <div class="form-group">
              <label class="form-label">ASIC Frequency (x)</label>
              <input v-model.number="settings.asicFrequency" type="number" class="form-input" min="400" max="600" step="25">
            </div>
          </div>

          <!-- Primary Pool Section -->
          <div class="settings-section">
            <h4>Primary Pool</h4>
            <div class="form-group">
              <label class="form-label">URL</label>
              <input v-model="settings.primaryPool.url" type="text" class="form-input" placeholder="stratum+tcp://...">
            </div>
            <div class="form-group">
              <label class="form-label">Port</label>
              <input v-model.number="settings.primaryPool.port" type="number" class="form-input">
            </div>
            <div class="form-group">
              <label class="form-label">Username</label>
              <input v-model="settings.primaryPool.username" type="text" class="form-input">
            </div>
            <div class="form-group">
              <label class="form-label">Password</label>
              <input v-model="settings.primaryPool.password" type="password" class="form-input" placeholder="Leave blank to keep current">
            </div>
            <div class="form-group">
              <label class="form-label">Suggested Difficulty</label>
              <input v-model.number="settings.primaryPool.difficulty" type="number" class="form-input">
            </div>
            <div class="form-group">
              <label class="checkbox-label">
                <input v-model="settings.primaryPool.extranonce" type="checkbox" class="form-checkbox">
                Extranonce Subscribe
              </label>
            </div>
          </div>

          <!-- Fallback Pool Section -->
          <div class="settings-section">
            <h4>Fallback Pool</h4>
            <div class="form-group">
              <label class="form-label">URL</label>
              <input v-model="settings.fallbackPool.url" type="text" class="form-input" placeholder="stratum+tcp://...">
            </div>
            <div class="form-group">
              <label class="form-label">Port</label>
              <input v-model.number="settings.fallbackPool.port" type="number" class="form-input">
            </div>
            <div class="form-group">
              <label class="form-label">Username</label>
              <input v-model="settings.fallbackPool.username" type="text" class="form-input">
            </div>
            <div class="form-group">
              <label class="form-label">Password</label>
              <input v-model="settings.fallbackPool.password" type="password" class="form-input" placeholder="Leave blank to keep current">
            </div>
            <div class="form-group">
              <label class="form-label">Suggested Difficulty</label>
              <input v-model.number="settings.fallbackPool.difficulty" type="number" class="form-input">
            </div>
            <div class="form-group">
              <label class="checkbox-label">
                <input v-model="settings.fallbackPool.extranonce" type="checkbox" class="form-checkbox">
                Extranonce Subscribe
              </label>
            </div>
          </div>

          <!-- Performance Section -->
          <div class="settings-section">
            <h4>Performance</h4>
            <div class="form-group">
              <label class="checkbox-label">
                <input v-model="settings.performance.enableOverclock" type="checkbox" class="form-checkbox">
                Enable Overclock
              </label>
            </div>
            <div class="form-group">
              <label class="form-label">Frequency (MHz)</label>
              <input v-model.number="settings.performance.frequency" type="number" class="form-input" min="400" max="650">
            </div>
            <div class="form-group">
              <label class="form-label">Core Voltage (mV)</label>
              <input v-model.number="settings.performance.coreVoltage" type="number" class="form-input" min="1000" max="1400">
            </div>
            <div class="form-group">
              <label class="checkbox-label">
                <input v-model="settings.performance.autoFanSpeed" type="checkbox" class="form-checkbox">
                Auto Fan Speed
              </label>
            </div>
            <div class="form-group">
              <label class="form-label">Manual Fan Speed (%)</label>
              <input
                v-model.number="settings.performance.manualFanSpeed"
                type="number"
                class="form-input"
                min="0"
                max="100"
                :disabled="settings.performance.autoFanSpeed"
              >
              <small class="form-help">Used if auto fan speed disabled</small>
            </div>
            <div class="form-group">
              <label class="form-label">Minimum Fan Speed (%)</label>
              <input v-model.number="settings.performance.minFanSpeed" type="number" class="form-input" min="0" max="100">
              <small class="form-help">Used if auto fan is on</small>
            </div>
            <div class="form-group">
              <label class="form-label">Target Temp (°C)</label>
              <input v-model.number="settings.performance.targetTemp" type="number" class="form-input" min="50" max="90">
              <small class="form-help">Used if auto fan is on</small>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="$emit('close')" class="btn btn-secondary">Cancel</button>
        <button
          @click="saveSettings"
          class="btn btn-primary"
          :disabled="saving"
        >
          {{ saving ? 'Saving...' : 'Save Changes' }}
        </button>
        <button
          @click="restartDevice"
          class="btn btn-secondary"
          :disabled="restarting"
        >
          {{ restarting ? 'Restarting...' : 'Restart Device' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { apiService } from '../services/api'

const props = defineProps({
  device: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close'])

const loading = ref(true)
const saving = ref(false)
const restarting = ref(false)
const error = ref('')

// Mock settings structure based on AxeOS design wireframe
const settings = reactive({
  hostname: 'bitaxe1',
  invertScreen: false,
  screenResolution: '64x128',
  displayTimeout: 5,
  wifiSSID: 'MyNetwork',
  wifiPassword: '',
  asicFrequency: 575,
  primaryPool: {
    url: 'stratum+tcp://solo.ckpool.org',
    port: 3333,
    username: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh.bitaxe1',
    password: '',
    difficulty: 1024,
    extranonce: true
  },
  fallbackPool: {
    url: 'stratum+tcp://backup.pool.org',
    port: 3333,
    username: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh.bitaxe1',
    password: '',
    difficulty: 1024,
    extranonce: true
  },
  performance: {
    enableOverclock: false,
    frequency: 575,
    coreVoltage: 1200,
    autoFanSpeed: true,
    manualFanSpeed: 75,
    minFanSpeed: 30,
    targetTemp: 70
  }
})

const loadDeviceConfig = async () => {
  loading.value = true
  error.value = ''

  try {
    // In a real implementation, this would fetch actual device config
    // For now, we'll use mock data that matches the wireframe
    console.log('Loading device config for:', props.device.name)

    // Mock delay to simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Settings are already pre-populated with mock data
  } catch (err) {
    error.value = 'Failed to load device settings: ' + err.message
  } finally {
    loading.value = false
  }
}

const saveSettings = async () => {
  saving.value = true

  try {
    // Mock save operation - in real implementation this would call the API
    await new Promise(resolve => setTimeout(resolve, 1500))

    console.log('Saving settings:', settings)
    // await apiService.updateDeviceConfig(props.device.id || props.device.name, settings)

    // Show success and close
    alert('Settings saved successfully!')
    emit('close')
  } catch (err) {
    alert('Failed to save settings: ' + err.message)
  } finally {
    saving.value = false
  }
}

const restartDevice = async () => {
  if (!confirm(`Are you sure you want to restart ${props.device.name}? This will temporarily interrupt mining.`)) {
    return
  }

  restarting.value = true

  try {
    // Mock restart operation
    await new Promise(resolve => setTimeout(resolve, 2000))

    console.log('Restarting device:', props.device.name)
    // await apiService.restartDevice(props.device.id || props.device.name)

    alert('Restart command sent successfully!')
    emit('close')
  } catch (err) {
    alert('Failed to restart device: ' + err.message)
  } finally {
    restarting.value = false
  }
}

onMounted(() => {
  loadDeviceConfig()
})
</script>

<style scoped>
.settings-modal {
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
}

.settings-form {
  max-height: 70vh;
  overflow-y: auto;
  padding: 1rem;
}

.settings-section {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--color-border);
}

.settings-section:last-child {
  border-bottom: none;
}

.settings-section h4 {
  color: var(--color-red);
  margin-bottom: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
}

.form-help {
  color: var(--color-text-muted);
  font-size: 0.8rem;
  margin-top: 0.25rem;
  display: block;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.modal-footer {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .settings-modal {
    width: 95%;
    margin: 1rem;
  }

  .modal-footer {
    justify-content: stretch;
  }

  .modal-footer .btn {
    flex: 1;
  }
}
</style>