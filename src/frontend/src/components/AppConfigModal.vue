<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content config-modal" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">Application Configuration</h3>
        <button @click="$emit('close')" class="modal-close">×</button>
      </div>

      <div class="modal-body">
        <div v-if="loading" class="loading">
          <div class="spinner"></div>
          <p>Loading configuration...</p>
        </div>

        <div v-else-if="error" class="error">
          <p>{{ error }}</p>
        </div>

        <div v-else class="config-form">
          <p>Application configuration interface will be implemented here.</p>
          <p>This modal will allow modification of application settings, device configurations, and mining core settings.</p>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="$emit('close')" class="btn btn-secondary">Cancel</button>
        <button class="btn btn-primary">Save Configuration</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineEmits(['close'])

const loading = ref(false)
const error = ref('')
</script>

<style scoped>
.config-modal {
  width: 95%;
  max-width: 800px;
}

.config-form {
  padding: 1rem;
}
</style>