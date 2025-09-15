<template>
  <div class="device-card">
    <div class="card-header">
      <div class="card-title">
        <div
          class="status-indicator"
          :class="{
            'status-available': deviceData?.status === 'available',
            'status-unavailable': deviceData?.status === 'unavailable'
          }"
        ></div>
        {{ device.name }}
      </div>
      <div class="card-actions">
        <button
          @click="$emit('show-chart', device)"
          class="action-btn"
          title="Show Charts"
        >
          📊
        </button>
        <button
          @click="$emit('show-settings', device)"
          class="action-btn"
          title="Device Settings"
        >
          ⚙️
        </button>
      </div>
    </div>

    <div class="card-body">
      <!-- Loading State -->
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Loading device data...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error">
        <p>{{ error }}</p>
        <small>Last attempt: {{ lastUpdate }}</small>
      </div>

      <!-- Device Data -->
      <div v-else-if="deviceData && deviceData.categories" class="device-data">
        <!-- Render each category -->
        <div
          v-for="(fields, categoryName) in deviceData.categories"
          :key="categoryName"
          class="category-section"
        >
          <h4 class="category-title">{{ categoryName }}</h4>

          <!-- Primary metrics for mining data -->
          <div v-if="categoryName === 'Mining Metrics'" class="primary-metrics">
            <div
              v-for="field in getHighlightedFields(fields)"
              :key="field.key"
              class="metric-highlight"
            >
              <span class="metric-label">{{ field.displayName }}</span>
              <span class="metric-value">{{ field.formatted }}</span>
            </div>
          </div>

          <!-- Standard field grid -->
          <div class="fields-grid">
            <div
              v-for="field in getRegularFields(fields, categoryName)"
              :key="field.key"
              class="data-field"
            >
              <div class="field-content">
                <span class="data-label">{{ field.displayName }}</span>

                <!-- Progress bar for certain fields -->
                <div v-if="shouldShowProgress(field)" class="progress-container">
                  <div class="progress-bar">
                    <div
                      class="progress-fill"
                      :class="getProgressClass(field)"
                      :style="{ width: getProgressWidth(field) }"
                    ></div>
                  </div>
                  <span class="data-value" :class="getValueClass(field)">
                    {{ field.formatted }}
                  </span>
                </div>

                <!-- Regular value display -->
                <span
                  v-else
                  class="data-value"
                  :class="getValueClass(field)"
                >
                  {{ field.formatted }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Last Update -->
        <div class="last-update">
          Last updated: {{ formatTimestamp(deviceData.lastUpdate) }}
          <span v-if="deviceData.raw?._mockData" class="mock-indicator">
            (Mock Data)
          </span>
        </div>
      </div>

      <!-- No Data State -->
      <div v-else class="no-data">
        <p>No data available</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  device: {
    type: Object,
    required: true
  },
  deviceData: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['show-chart', 'show-settings'])

const lastUpdate = computed(() => {
  if (props.deviceData?.lastUpdate) {
    return formatTimestamp(props.deviceData.lastUpdate)
  }
  return new Date().toLocaleString()
})

// Field filtering functions
const getHighlightedFields = (fields) => {
  // Show hashrate fields prominently in mining metrics
  const highlightKeys = ['hashRate', 'expectedHashrate']
  return fields.filter(field => highlightKeys.includes(field.key))
}

const getRegularFields = (fields, categoryName) => {
  // For mining metrics, exclude the highlighted ones
  if (categoryName === 'Mining Metrics') {
    const highlightKeys = ['hashRate', 'expectedHashrate']
    return fields.filter(field => !highlightKeys.includes(field.key))
  }
  return fields
}

// Progress bar logic
const shouldShowProgress = (field) => {
  // Show progress bars for temperature, fan speed, and percentage fields
  const progressKeys = ['temp', 'vrTemp', 'fanspeed', 'fanrpm']
  const progressTypes = ['temperature', 'percentage']
  return progressKeys.includes(field.key) || progressTypes.includes(field.type)
}

const getProgressWidth = (field) => {
  const value = parseFloat(field.raw)

  switch (field.key) {
    case 'temp':
    case 'vrTemp':
      // Temperature: 0-100°C range
      return `${Math.min(100, Math.max(0, (value / 100) * 100))}%`
    case 'fanspeed':
      // Fan speed: 0-100% range
      return `${Math.min(100, Math.max(0, value))}%`
    case 'fanrpm':
      // Fan RPM: approximate 0-5000 RPM range
      return `${Math.min(100, Math.max(0, (value / 5000) * 100))}%`
    default:
      return '0%'
  }
}

const getProgressClass = (field) => {
  const value = parseFloat(field.raw)

  switch (field.key) {
    case 'temp':
    case 'vrTemp':
      // Temperature thresholds
      if (value >= 85) return 'progress-critical'
      if (value >= 75) return 'progress-warning'
      if (value >= 60) return 'progress-good'
      return 'progress-excellent'

    case 'fanspeed':
      // Fan speed thresholds
      if (value >= 90) return 'progress-critical'
      if (value >= 75) return 'progress-warning'
      if (value >= 50) return 'progress-good'
      return 'progress-excellent'

    case 'fanrpm':
      // RPM thresholds
      if (value >= 4500) return 'progress-critical'
      if (value >= 3500) return 'progress-warning'
      if (value >= 2000) return 'progress-good'
      return 'progress-excellent'

    default:
      return 'progress-good'
  }
}

const getValueClass = (field) => {
  const value = parseFloat(field.raw)

  // Apply color coding to temperature and critical values
  switch (field.key) {
    case 'temp':
    case 'vrTemp':
      if (value >= 85) return 'text-critical'
      if (value >= 75) return 'text-warning'
      if (value >= 60) return 'text-good'
      return 'text-excellent'

    case 'fanspeed':
      if (value >= 90) return 'text-critical'
      if (value >= 75) return 'text-warning'
      return 'text-good'

    case 'overheat_mode':
      return value > 0 ? 'text-critical' : 'text-excellent'

    default:
      return 'text-normal'
  }
}

const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'Never'

  const date = new Date(timestamp)
  return date.toLocaleTimeString()
}
</script>

<style scoped>
.device-card {
  background-color: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  overflow: hidden;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  background: none;
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

.action-btn:hover {
  background-color: var(--color-border);
  color: var(--color-white);
}

.card-body {
  padding: 1.5rem;
}

/* Category sections */
.category-section {
  margin-bottom: 2rem;
}

.category-section:last-child {
  margin-bottom: 1rem;
}

.category-title {
  color: var(--color-white);
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--color-border);
}

/* Primary metrics highlighting */
.primary-metrics {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.metric-highlight {
  text-align: center;
  padding: 1rem;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(16, 185, 129, 0.1));
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 6px;
}

.metric-label {
  display: block;
  color: var(--color-text-muted);
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.metric-value {
  display: block;
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--color-white);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

/* Field grid layout */
.fields-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.data-field {
  background-color: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 0.75rem;
}

.field-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* Progress bars */
.progress-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s ease, background-color 0.3s ease;
  border-radius: 3px;
}

/* Progress bar colors */
.progress-excellent {
  background: linear-gradient(90deg, #10b981, #34d399);
}

.progress-good {
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
}

.progress-warning {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}

.progress-critical {
  background: linear-gradient(90deg, #ef4444, #f87171);
}

/* Text colors */
.text-excellent {
  color: #10b981;
}

.text-good {
  color: #3b82f6;
}

.text-warning {
  color: #f59e0b;
}

.text-critical {
  color: #ef4444;
}

.text-normal {
  color: var(--color-white);
}

/* Data labels and values */
.data-label {
  color: var(--color-text-muted);
  font-size: 0.8rem;
  font-weight: 500;
}

.data-value {
  color: var(--color-white);
  font-size: 0.9rem;
  font-weight: 600;
}

/* Mock data indicator */
.mock-indicator {
  color: var(--color-warning);
  font-size: 0.7rem;
  font-style: italic;
}

.last-update {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
  text-align: center;
  color: var(--color-text-muted);
  font-size: 0.8rem;
}

.no-data {
  text-align: center;
  color: var(--color-text-muted);
  padding: 2rem;
}

.loading {
  text-align: center;
  padding: 2rem;
}

.loading .spinner {
  margin: 0 auto 1rem;
}

.device-info {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.info-label {
  color: var(--color-text-muted);
  font-size: 0.85rem;
  font-weight: 500;
}

.info-value {
  color: var(--color-white);
  font-size: 0.85rem;
}

@media (max-width: 768px) {
  .primary-metrics {
    grid-template-columns: 1fr;
  }

  .fields-grid {
    grid-template-columns: 1fr;
  }

  .progress-container {
    flex-direction: column;
    gap: 0.25rem;
    align-items: stretch;
  }

  .card-body {
    padding: 1rem;
  }

  .category-section {
    margin-bottom: 1.5rem;
  }
}
</style>