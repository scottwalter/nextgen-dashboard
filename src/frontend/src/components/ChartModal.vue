<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content chart-modal" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">{{ device?.name }} - Real-time Statistics</h3>
        <button @click="$emit('close')" class="modal-close">×</button>
      </div>

      <div class="modal-body">
        <div v-if="loading" class="loading">
          <div class="spinner"></div>
          <p>Loading chart data...</p>
        </div>

        <div v-else-if="error" class="error">
          <p>{{ error }}</p>
          <button @click="loadChartData" class="btn btn-secondary">Retry</button>
        </div>

        <div v-else class="chart-container">
          <!-- Chart Header Info -->
          <div class="chart-info">
            <div class="chart-status">
              <span class="status-badge live">Live</span>
              <span>Update Interval: {{ updateInterval }}s</span>
            </div>
            <div class="chart-metrics">
              <span>Hashrate: {{ currentHashrate }}</span>
              <span>Average: {{ averageHashrate }}</span>
              <span>ASIC Temp: {{ currentTemp }}°C</span>
            </div>
            <div class="chart-timestamp">
              Last update: {{ lastUpdate }}
            </div>
          </div>

          <!-- Chart Canvas -->
          <div class="chart-wrapper">
            <canvas
              ref="chartCanvas"
              width="800"
              height="400"
            ></canvas>
          </div>

          <!-- Chart Legend -->
          <div class="chart-legend">
            <div class="legend-item">
              <span class="legend-color hashrate"></span>
              <span>Hashrate</span>
            </div>
            <div class="legend-item">
              <span class="legend-color temperature"></span>
              <span>ASIC Temp</span>
            </div>
          </div>

          <!-- Chart Controls -->
          <div class="chart-controls">
            <label>Time Range:</label>
            <select v-model="timeRange" @change="loadChartData">
              <option value="1">Last Hour</option>
              <option value="6">Last 6 Hours</option>
              <option value="12">Last 12 Hours</option>
              <option value="24">Last 24 Hours</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useDevicesStore } from '../stores/devices'

const props = defineProps({
  device: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close'])

const devicesStore = useDevicesStore()

const loading = ref(true)
const error = ref('')
const chartData = ref(null)
const chartCanvas = ref(null)
const timeRange = ref(24)
const updateInterval = ref(25)
const refreshTimer = ref(null)

const currentHashrate = ref('Loading...')
const averageHashrate = ref('Loading...')
const currentTemp = ref('Loading...')
const lastUpdate = ref(new Date().toLocaleTimeString())

const loadChartData = async () => {
  loading.value = true
  error.value = ''

  try {
    const data = await devicesStore.getDeviceChartData(props.device.id || props.device.name, timeRange.value)
    chartData.value = data

    // Update current metrics
    if (data.dataPoints && data.dataPoints.length > 0) {
      const latest = data.dataPoints[data.dataPoints.length - 1]
      const hashrates = data.dataPoints.map(p => p.hashrate).filter(h => h != null)

      currentHashrate.value = `${(latest.hashrate / 1000).toFixed(2)} TH/s`
      currentTemp.value = `${latest.asicTemp.toFixed(1)}`

      if (hashrates.length > 0) {
        const avgHashrate = hashrates.reduce((sum, h) => sum + h, 0) / hashrates.length
        averageHashrate.value = `${(avgHashrate / 1000).toFixed(2)} TH/s`
      }
    }

    drawChart()
  } catch (err) {
    error.value = 'Failed to load chart data'
    console.error('Chart data error:', err)
  } finally {
    loading.value = false
  }
}

const drawChart = () => {
  if (!chartCanvas.value || !chartData.value) return

  const canvas = chartCanvas.value
  const ctx = canvas.getContext('2d')
  const { width, height } = canvas
  const data = chartData.value.dataPoints || []

  // Clear canvas
  ctx.clearRect(0, 0, width, height)

  if (data.length === 0) {
    ctx.fillStyle = '#666'
    ctx.font = '16px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('No data available', width / 2, height / 2)
    return
  }

  // Chart dimensions
  const padding = 60
  const chartWidth = width - 2 * padding
  const chartHeight = height - 2 * padding

  // Find data ranges
  const hashrates = data.map(d => d.hashrate).filter(h => h != null)
  const temps = data.map(d => d.asicTemp).filter(t => t != null)
  const timestamps = data.map(d => new Date(d.timestamp))

  const hashrateMin = Math.min(...hashrates) * 0.9
  const hashrateMax = Math.max(...hashrates) * 1.1
  const tempMin = Math.min(...temps) * 0.9
  const tempMax = Math.max(...temps) * 1.1

  // Draw grid
  ctx.strokeStyle = '#333'
  ctx.lineWidth = 1

  // Vertical grid lines
  for (let i = 0; i <= 10; i++) {
    const x = padding + (chartWidth * i / 10)
    ctx.beginPath()
    ctx.moveTo(x, padding)
    ctx.lineTo(x, height - padding)
    ctx.stroke()
  }

  // Horizontal grid lines
  for (let i = 0; i <= 8; i++) {
    const y = padding + (chartHeight * i / 8)
    ctx.beginPath()
    ctx.moveTo(padding, y)
    ctx.lineTo(width - padding, y)
    ctx.stroke()
  }

  // Draw hashrate line
  if (hashrates.length > 0) {
    ctx.strokeStyle = '#ff1744'
    ctx.lineWidth = 2
    ctx.beginPath()

    data.forEach((point, index) => {
      if (point.hashrate == null) return

      const x = padding + (chartWidth * index / (data.length - 1))
      const y = height - padding - ((point.hashrate - hashrateMin) / (hashrateMax - hashrateMin)) * chartHeight

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.stroke()
  }

  // Draw temperature line (scaled to same range)
  if (temps.length > 0) {
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2
    ctx.beginPath()

    data.forEach((point, index) => {
      if (point.asicTemp == null) return

      const x = padding + (chartWidth * index / (data.length - 1))
      const y = height - padding - ((point.asicTemp - tempMin) / (tempMax - tempMin)) * chartHeight

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.stroke()
  }

  // Draw axes labels
  ctx.fillStyle = '#aaa'
  ctx.font = '12px Arial'
  ctx.textAlign = 'left'

  // Y-axis labels (hashrate)
  ctx.fillStyle = '#ff1744'
  for (let i = 0; i <= 4; i++) {
    const value = hashrateMin + ((hashrateMax - hashrateMin) * i / 4)
    const y = height - padding - (chartHeight * i / 4)
    const displayValue = value >= 1000 ? `${(value/1000).toFixed(2)} TH/s` : `${value.toFixed(0)} GH/s`
    ctx.fillText(displayValue, 5, y + 3)
  }

  // Y-axis labels (temperature) - right side
  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'right'
  for (let i = 0; i <= 4; i++) {
    const value = tempMin + ((tempMax - tempMin) * i / 4)
    const y = height - padding - (chartHeight * i / 4)
    ctx.fillText(`${value.toFixed(1)}°C`, width - 5, y + 3)
  }

  // X-axis labels (time)
  ctx.fillStyle = '#aaa'
  ctx.textAlign = 'center'
  const timeStep = Math.max(1, Math.floor(data.length / 6))
  for (let i = 0; i < data.length; i += timeStep) {
    const x = padding + (chartWidth * i / (data.length - 1))
    const time = new Date(data[i].timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })
    ctx.fillText(time, x, height - padding + 15)
  }
}

const startAutoRefresh = () => {
  refreshTimer.value = setInterval(() => {
    loadChartData()
    lastUpdate.value = new Date().toLocaleTimeString()
  }, updateInterval.value * 1000)
}

const stopAutoRefresh = () => {
  if (refreshTimer.value) {
    clearInterval(refreshTimer.value)
    refreshTimer.value = null
  }
}

const handleOverlayClick = () => {
  emit('close')
}

onMounted(() => {
  loadChartData()
  startAutoRefresh()
})

onUnmounted(() => {
  stopAutoRefresh()
})
</script>

<style scoped>
.chart-modal {
  width: 95%;
  max-width: 1000px;
  max-height: 90vh;
}

.chart-container {
  padding: 1rem 0;
}

.chart-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 1rem;
  background-color: var(--color-dark-header);
  border-radius: 4px;
  font-size: 0.9rem;
}

.chart-status {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.status-badge {
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-badge.live {
  background-color: var(--color-green);
  color: white;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.chart-metrics {
  display: flex;
  gap: 1rem;
  color: var(--color-text-muted);
}

.chart-timestamp {
  color: var(--color-text-muted);
}

.chart-wrapper {
  background-color: var(--color-dark-bg);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.chart-wrapper canvas {
  width: 100%;
  height: auto;
  display: block;
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 1rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.legend-color {
  width: 20px;
  height: 3px;
  border-radius: 2px;
}

.legend-color.hashrate {
  background-color: var(--color-red);
}

.legend-color.temperature {
  background-color: var(--color-white);
}

.chart-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.chart-controls label {
  font-weight: 500;
}

.chart-controls select {
  padding: 0.5rem;
  background-color: var(--color-dark-bg);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  color: var(--color-white);
}

@media (max-width: 768px) {
  .chart-modal {
    width: 98%;
    margin: 1rem;
  }

  .chart-info {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }

  .chart-metrics {
    flex-direction: column;
    gap: 0.5rem;
  }

  .chart-legend {
    gap: 1rem;
  }
}
</style>