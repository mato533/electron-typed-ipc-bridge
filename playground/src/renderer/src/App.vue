<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import Versions from './components/Versions.vue'

const ipcHandle = () => window.api.invoke.ping()
const counter = ref(0)

const ipcHandleAdd = async () => {
  counter.value = await window.api.invoke.culc.add(counter.value, 2)
}
const ipcHandleMinus = async () => {
  counter.value = await window.api.invoke.culc.minus(counter.value, 2)
}
const emitEvent = () => {
  window.api.invoke.emitEvent()
}

const handler = (event: MouseEvent) => {
  event.preventDefault()
  window.api.invoke.showContextMenu()
}

onMounted(() => {
  window.addEventListener('contextmenu', handler)
  // handle message from main process
  window.api.on.updateCounter(
    (_e, value) => (counter.value = counter.value + value)
  )
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
      <a target="_blank" rel="noreferrer" @click="ipcHandle">Send IPC</a>
    </div>
    <div id="btn-reset" class="action">
      <a target="_blank" rel="noreferrer" @click="(counter = 0)">Reset</a>
    </div>
    <div id="btn-add" class="action">
      <a target="_blank" rel="noreferrer" @click="ipcHandleAdd"
        >Add 2 to counter</a
      >
    </div>
    <div id="btn-minus" class="action">
      <a target="_blank" rel="noreferrer" @click="ipcHandleMinus"
        >Minus 2 to counter</a
      >
    </div>
    <div id="btn-on-test" class="action">
      <a target="_blank" rel="noreferrer" @click="emitEvent"
        >Test Main to Renderer</a
      >
    </div>
  </div>
  <p class="tip">
    Please try right click and test message menu. Updated below counter
  </p>
  <p class="tip">
    counter: <code id="counter">{{ counter }}</code>
  </p>
  <Versions />
</template>
