<template>
  <div id="app">
    <!-- Header -->
    <header class="header">
      <div class="header-left">
        <h1 class="header-title">{{ config.applicationTitle || 'Bitaxe Dashboard' }}</h1>
        <span class="header-version">{{ config.version || '2.0.0' }}</span>
      </div>
      <div class="header-right">
        <span v-if="authStore.isAuthenticated" class="header-user">
          {{ authStore.user?.username }}
        </span>
        <button
          v-if="authStore.isAuthenticated"
          @click="logout"
          class="logout-btn"
          title="Logout"
        >
          🚪
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="main-content">
      <!-- Loading State -->
      <div v-if="isLoading" class="loading">
        <div class="spinner"></div>
        <p>Loading dashboard...</p>
      </div>

      <!-- Dashboard Content -->
      <div v-else>
        <!-- Device Cards -->
        <div v-if="config.devices && config.devices.length > 0" class="devices-grid">
          <DeviceCard
            v-for="device in config.devices"
            :key="device.id"
            :device="device"
            :device-data="devicesStore.devices[device.id]"
            :loading="devicesStore.loading"
            :error="devicesStore.errors[device.id]"
            @show-chart="showDeviceChart"
            @show-settings="showDeviceSettings"
          />
        </div>

        <!-- Mining Core Cards -->
        <div
          v-if="config.miningCore?.enabled && miningCoreData"
          class="mining-core-grid"
        >
          <MiningCoreCard
            v-for="pool in miningCoreData.pools"
            :key="pool.name"
            :pool="pool"
            :loading="devicesStore.loading"
            :error="devicesStore.errors.miningCore"
          />
        </div>

        <!-- No Data State -->
        <div v-if="!config.devices || config.devices.length === 0" class="no-data">
          <h3>No devices configured</h3>
          <p>Please configure your Bitaxe devices in the application settings.</p>
          <button @click="showAppConfig" class="btn btn-primary">
            Configure Devices
          </button>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-left">
        <span>© 2024 Scott Walter</span>
        <span>Author: Scott Walter</span>
      </div>
      <div class="footer-right">
        <span>Last updated: {{ lastUpdate }}</span>
        <span>Version: {{ config.version || '2.0.0' }}</span>
      </div>
    </footer>

    <!-- Modals -->
    <ChartModal
      v-if="showChart"
      :device="selectedDevice"
      @close="showChart = false"
    />

    <DeviceSettingsModal
      v-if="showSettings"
      :device="selectedDevice"
      @close="showSettings = false"
    />

    <AppConfigModal
      v-if="showConfig"
      @close="showConfig = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useConfigStore } from '../stores/config'
import { useDevicesStore } from '../stores/devices'

import DeviceCard from '../components/DeviceCard.vue'
import MiningCoreCard from '../components/MiningCoreCard.vue'
import ChartModal from '../components/ChartModal.vue'
import DeviceSettingsModal from '../components/DeviceSettingsModal.vue'
import AppConfigModal from '../components/AppConfigModal.vue'

const router = useRouter()
const authStore = useAuthStore()
const configStore = useConfigStore()
const devicesStore = useDevicesStore()

const isLoading = ref(true)
const lastUpdate = ref(new Date().toLocaleString())
const refreshInterval = ref(null)

const showChart = ref(false)
const showSettings = ref(false)
const showConfig = ref(false)
const selectedDevice = ref(null)

const config = computed(() => configStore.config)
const miningCoreData = computed(() => devicesStore.miningCore)

const logout = () => {
  authStore.logout()
  router.push('/login')
}

const showDeviceChart = (device) => {
  selectedDevice.value = device
  showChart.value = true
}

const showDeviceSettings = (device) => {
  selectedDevice.value = device
  showSettings.value = true
}

const showAppConfig = () => {
  showConfig.value = true
}

const updateDeviceData = async () => {
  if (!config.value?.devices) return

  const updatePromises = config.value.devices.map(device =>
    devicesStore.updateDeviceData(device.id || device.name)
  )

  await Promise.all(updatePromises)

  // Update mining core data if enabled
  if (config.value.miningCore?.enabled) {
    await devicesStore.updateMiningCoreData()
  }

  lastUpdate.value = new Date().toLocaleString()
}

const startDataRefresh = () => {
  // Initial data load
  updateDeviceData()

  // Set up recurring refresh
  const intervalSeconds = config.value?.refreshInterval || 25
  refreshInterval.value = setInterval(updateDeviceData, intervalSeconds * 1000)
}

const stopDataRefresh = () => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
    refreshInterval.value = null
  }
}

onMounted(async () => {
  try {
    // Load configuration
    await configStore.loadConfig()

    // Start data refresh cycle
    startDataRefresh()
  } catch (error) {
    console.error('Failed to load dashboard:', error)
  } finally {
    isLoading.value = false
  }
})

onUnmounted(() => {
  stopDataRefresh()
})
</script>

<style scoped>
.no-data {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--color-text-muted);
}

.no-data h3 {
  color: var(--color-white);
  margin-bottom: 1rem;
}

.no-data p {
  margin-bottom: 2rem;
}
</style>