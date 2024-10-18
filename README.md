[![Run Test](https://github.com/mato533/electron-typed-ipc-bridge/actions/workflows/test.yml/badge.svg)](https://github.com/mato533/electron-typed-ipc-bridge/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/mato533/electron-typed-ipc-bridge/graph/badge.svg?token=T4ICAR3SCF)](https://codecov.io/gh/mato533/electron-typed-ipc-bridge)
[![GitHub](https://img.shields.io/github/license/mato533/rollup-plugin-gas)](https://github.com/mato533/rollup-plugin-gas/blob/main/LICENSE)

# What is the electron-typed-ipc-bridge?

Generate api on the bridge across isolated contexts of the electron.

# Why use this library？

There are following reasends.

1. When implementing IPC using contextBridge, we want to use it in a type-safe.

<img width="824" alt="image" src="https://github.com/user-attachments/assets/cbe58812-bda6-4294-bb28-911f549c6a3e">

1. We want to be freed from channel management.

   This library is automaticaly generate channel ids with uuid.

# How to use it?

## install

```
npm install electron-typed-ipc-bridge
```

## Implimentation

**There 5 steps to use this library.**

1. Create api on main script

   See the playground code: [`main/api/index.ts`](playground/src/main/api/index.ts)

1. Add handler at main.ts

   See the playground code: [`main/index.ts`](playground/src/main/index.ts)

1. Add invoker at preload.ts

   See the playground code: [`preload/index.ts`](playground/src/preload/index.ts)

1. Add type decolation

   See the playground code: [`preload/index.d.ts`](playground/src/preload/index.ts)

1. Call the exposed API or add a handler for messages sent via the API at renderer.

   See the playground code: [`renderer/src/App.vue`](playground/src/renderer/src/App.vue)
