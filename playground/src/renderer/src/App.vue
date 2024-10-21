<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import Versions from './components/Versions.vue'

const ipcHandle = () => window.api.invoke.ping()
const ipcHandleAdd = async () => {
  counter.value = await window.api.invoke.culc.add(counter.value, 2)
}
const ipcHandleMinus = async () =>
  (counter.value = await window.api.invoke.culc.minus(counter.value, 2))
const counter = ref(0)
const handler = (event: MouseEvent) => {
  event.preventDefault()
  window.api.invoke.showContextMenu()
}
// handle message from main process
window.api.on.updateCounter((_e, value) => (counter.value = counter.value + value))

onMounted(() => {
  window.addEventListener('contextmenu', handler)
})

onBeforeUnmount(() => {
  window.removeEventListener('contextmenu', handler)
})
</script>

<template>
  <img alt="logo" class="logo" src="./assets/electron.svg" />
  <div class="creator">Powered by electron-vite</div>
  <div class="text">
    Build an Electron app with
    <span class="vue">Vue</span>
    and
    <span class="ts">TypeScript</span>
  </div>
  <p class="tip">Please try pressing <code>F12</code> to open the devTool</p>
  <div class="actions">
    <div class="action">
      <a href="https://electron-vite.org/" target="_blank" rel="noreferrer">Documentation</a>
    </div>
    <div class="action">
      <a target="_blank" rel="noreferrer" @click="ipcHandle">Send IPC</a>
    </div>
    <div class="action">
      <a target="_blank" rel="noreferrer" @click="ipcHandleAdd">Add 2 to counter</a>
    </div>
    <div class="action">
      <a target="_blank" rel="noreferrer" @click="ipcHandleMinus">Minus 2 to counter</a>
    </div>
  </div>
  <p class="tip">Please try right click and test message menu. Updated below counter</p>
  <p class="tip">
    counter: <code>{{ counter }}</code>
  </p>
  <Versions />
</template>
