<template>
  <div class="mining-core-card">
    <div class="card-header">
      <div class="card-title">
        <div
          class="status-indicator"
          :class="{
            'status-available': !error,
            'status-unavailable': error
          }"
        ></div>
        Mining Core Instance: {{ pool.name || 'Bitcoin Pool' }}
      </div>
    </div>

    <div class="card-body">
      <!-- Loading State -->
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Loading mining core data...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error">
        <p>{{ error }}</p>
      </div>

      <!-- Mining Core Data -->
      <div v-else-if="pool" class="mining-data">
        <div class="metrics-grid">
          <div v-if="pool.networkHashrate" class="data-field">
            <span class="data-label">Network Hashrate</span>
            <span class="data-value">{{ formatHashrate(pool.networkHashrate) }}</span>
          </div>

          <div v-if="pool.networkDifficulty" class="data-field">
            <span class="data-label">Network Difficulty</span>
            <span class="data-value">{{ formatDifficulty(pool.networkDifficulty) }}</span>
          </div>

          <div v-if="pool.lastBlockTime" class="data-field">
            <span class="data-label">Last Block Time</span>
            <span class="data-value">{{ formatDateTime(pool.lastBlockTime) }}</span>
          </div>

          <div v-if="pool.blockHeight" class="data-field">
            <span class="data-label">Block Height</span>
            <span class="data-value">{{ pool.blockHeight.toLocaleString() }}</span>
          </div>

          <div v-if="pool.connectedPeers" class="data-field">
            <span class="data-label">Connected Peers</span>
            <span class="data-value">{{ pool.connectedPeers }}</span>
          </div>

          <div v-if="pool.nodeVersion" class="data-field">
            <span class="data-label">Node Version</span>
            <span class="data-value">{{ pool.nodeVersion }}</span>
          </div>

          <div v-if="pool.connectedMiners" class="data-field">
            <span class="data-label">Connected Miners</span>
            <span class="data-value">{{ pool.connectedMiners }}</span>
          </div>

          <div v-if="pool.poolHashrate" class="data-field">
            <span class="data-label">Pool Hashrate</span>
            <span class="data-value">{{ formatHashrate(pool.poolHashrate) }}</span>
          </div>

          <div v-if="pool.totalPaid" class="data-field">
            <span class="data-label">Rewards: Total Paid</span>
            <span class="data-value">{{ pool.totalPaid.toFixed(8) }} BTC</span>
          </div>

          <div v-if="pool.totalBlocks" class="data-field">
            <span class="data-label">Rewards: Total Blocks</span>
            <span class="data-value">{{ pool.totalBlocks }}</span>
          </div>

          <div v-if="pool.totalConfirmedBlocks" class="data-field">
            <span class="data-label">Rewards: Total Confirmed Blocks</span>
            <span class="data-value">{{ pool.totalConfirmedBlocks }}</span>
          </div>

          <div v-if="pool.totalPendingBlocks" class="data-field">
            <span class="data-label">Rewards: Total Pending Blocks</span>
            <span class="data-value">{{ pool.totalPendingBlocks }}</span>
          </div>

          <div v-if="pool.lastPoolBlockTime" class="data-field">
            <span class="data-label">Rewards: Last Pool Block Time</span>
            <span class="data-value">{{ formatDateTime(pool.lastPoolBlockTime) }}</span>
          </div>

          <div v-if="pool.blockReward" class="data-field">
            <span class="data-label">Rewards: Block Reward</span>
            <span class="data-value">{{ pool.blockReward }} BTC</span>
          </div>
        </div>
      </div>

      <!-- No Data State -->
      <div v-else class="no-data">
        <p>No mining core data available</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  pool: {
    type: Object,
    required: true
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

const formatHashrate = (value) => {
  if (!value) return 'N/A'

  const units = ['H/s', 'KH/s', 'MH/s', 'GH/s', 'TH/s', 'PH/s', 'EH/s']
  let unitIndex = 0
  let hashrate = value

  while (hashrate >= 1000 && unitIndex < units.length - 1) {
    hashrate /= 1000
    unitIndex++
  }

  return `${hashrate.toFixed(2)} ${units[unitIndex]}`
}

const formatDifficulty = (value) => {
  if (!value) return 'N/A'

  const units = ['', 'K', 'M', 'G', 'T', 'P', 'E']
  let unitIndex = 0
  let difficulty = value

  while (difficulty >= 1000 && unitIndex < units.length - 1) {
    difficulty /= 1000
    unitIndex++
  }

  return `${difficulty.toFixed(2)}${units[unitIndex]}`
}

const formatDateTime = (timestamp) => {
  if (!timestamp) return 'N/A'

  const date = new Date(timestamp)
  return date.toLocaleString()
}
</script>

<style scoped>
.mining-core-card {
  background-color: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  overflow: hidden;
}

.card-body {
  padding: 1.5rem;
}

.mining-data {
  /* Mining core specific styling can go here */
}

.metrics-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
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

@media (max-width: 768px) {
  .metrics-grid {
    grid-template-columns: 1fr;
  }
}
</style>