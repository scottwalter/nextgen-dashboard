<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useConfigStore } from './stores/config'

const configStore = useConfigStore()

onMounted(() => {
  configStore.loadConfig()
})
</script>