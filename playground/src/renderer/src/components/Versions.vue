<script setup lang="ts">
import { onMounted, ref } from 'vue'
const versions = ref()
onMounted(() => {
  const _versions = window.electron.process.versions
  console.log(_versions)
  versions.value = { ..._versions }
})
</script>

<template>
  <ul v-if="versions" class="versions">
    <li class="electron-version">Electron v{{ versions.electron }}</li>
    <li class="chrome-version">Chromium v{{ versions.chrome }}</li>
    <li class="node-version">Node v{{ versions.node }}</li>
  </ul>
</template>
