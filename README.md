[![npm version](https://badge.fury.io/js/electron-typed-ipc-bridge.svg)](https://badge.fury.io/js/electron-typed-ipc-bridge)
[![Run Test](https://github.com/mato533/electron-typed-ipc-bridge/actions/workflows/test.yml/badge.svg)](https://github.com/mato533/electron-typed-ipc-bridge/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/mato533/electron-typed-ipc-bridge/graph/badge.svg?token=T4ICAR3SCF)](https://codecov.io/gh/mato533/electron-typed-ipc-bridge)
[![CodeFactor](https://www.codefactor.io/repository/github/mato533/electron-typed-ipc-bridge/badge)](https://www.codefactor.io/repository/github/mato533/electron-typed-ipc-bridge)
[![Maintainability](https://api.codeclimate.com/v1/badges/9c2ebe526ae977ef54ab/maintainability)](https://codeclimate.com/github/mato533/electron-typed-ipc-bridge/maintainability)
[![GitHub](https://img.shields.io/github/license/mato533/rollup-plugin-gas)](https://github.com/mato533/rollup-plugin-gas/blob/main/LICENSE)

# What is the electron-typed-ipc-bridge?

Generate api on the bridge across isolated contexts of the electron.

# Why use this library？

There are following reasons.

1. When implementing IPC using contextBridge, we want to use it in a type-safe.

   <img width="824" alt="image" src="https://github.com/user-attachments/assets/cbe58812-bda6-4294-bb28-911f549c6a3e">

1. We want to be free from channel management.

   This library is automatically generate channel ids with uuid.  
   We can feel free to manage channel strings.(don't worry about typos. e.g. say-hello or do-hello??)

# How to use it?

## install

```
npm install electron-typed-ipc-bridge
```

## How to implement this library？?

### Core

**There are 5 STEPS to use this library.**

1. #### Create api on **`main`** script

   1. Implement the API of the IPC context bridge

      - `invoke` : **renderer --(data)--> main --(return data)--> renderer**  
        return data is the option
      - `on` : **main --(data)--> renderer**  
        if you want to return data from renderer to main, use the invoke api.

      ```typescript
      export const api = {
        invoke: {
          ping: () => console.log('pong'),
          showContextMenu: getContextMenuHandler(),
        },
        on: {
          updateCounter: (value: number) => value,
        },
      }
      ```

   1. Generate and export type definitions

      - `IpcBridgeApiEmitter`: For the type of Emitter to use message from main to renderer.(defined at `on` by step.1-1)
      - `IpcBridgeApi` : For the type of exposed api(exposed to renderer, defined at `invoke` and `on` by step.1-1)

      ```typescript
      import type {
        IpcBridgeApiEmitterGenerator,
        IpcBridgeApiGenerator,
      } from 'electron-typed-ipc-bridge/main'
      export type IpcBridgeApiEmitter = IpcBridgeApiEmitterGenerator<typeof api>
      export type IpcBridgeApi = IpcBridgeApiGenerator<typeof api>
      ```

   See the playground code: [`main/api/index.ts`](playground/src/main/api/index.ts)

1. #### Add handler at `main.ts`

   1. Resister IPC handlers(apis defined at `invoke`)

      ```typescript
      import { getIpcBridgeApiEmitter, registerIpcHandler } from 'electron-typed-ipc-bridge/main'
      import { api } from './api'
      registerIpcHandler(api)
      ```

   1. Generate the Ipc context bridge API Emitter(apis defined at `on`)  
      The type of `ipcApi` is same as `IpcBridgeApiEmitter` exported by [Step1](#create-api-on-main-script)

      ```typescript
      const ipcApi = getIpcBridgeApiEmitter(api)

      // When send a message to renderer,
      // use as following code
      //(see the playground code of `setMenu(mainWindow, api)`
      // at the `createWindow(ipcApi)`)
      ipcApi.send.updateCounter(mainWindow, 1)
      ```

   See the playground code: [`main/index.ts`](playground/src/main/index.ts)

1. #### Add invoker at `preload.ts`

   1. Generate Ipc Context Bridge API

      ```typescript
      import { generateIpcBridgeApi } from 'electron-typed-ipc-bridge/preload'
      import type { IpcBridgeApi } from '../main/api'
      const api = await generateIpcBridgeApi<IpcBridgeApi>()
      ```

   1. Expose the API to renderer

   See the playground code: [`preload/index.ts`](playground/src/preload/index.ts)

1. #### Add type decoration

   Extends the window object.  
   Import the type exported by [Step1](#create-api-on-main-script) and use it as follow.

   ```typescript
   import type { IpcBridgeApi } from '../main/api'

   declare global {
     interface Window {
       electron: ElectronAPI
       api: IpcBridgeApi
     }
   }
   ```

   See the playground code: [`preload/index.d.ts`](playground/src/preload/index.d.ts)

1. #### Call the exposed API or add a handler for messages sent via the API at renderer.

   1. Use api defined at `invoke` with type-safe!

      ```typescript
      window.api.invoke.showContextMenu()
      ```

   2. Add handler of messages from main defined at `on` with type-safe!

      ```typescript
      window.api.on.updateCounter((_e, value) => (counter.value = counter.value + value))
      ```

   See the playground code: [`renderer/src/App.vue`](playground/src/renderer/src/App.vue)

### Logging for this library

This library is implemented the logger using `console.log`, `console.error` and `console.debug`.

But you may want to disable logging or use another logging library(e.g. [`electron-log`](https://github.com/megahertz/electron-log/tree/master)).  
 This library provides a way in which you can do so.

#### Disable logging

Import the `initialize` function and set empty object to `logger`.
Call it before calling another functions exported by this library.

- main.ts

  ```typescript
  import { initialize } from 'electron-typed-ipc-bridge/main'

  initialize({ logger: {} })
  ```

- preload.ts

  ```typescript
  import { initialize } from 'electron-typed-ipc-bridge/preload'

  initialize({ logger: {} })
  ```

#### Implement custom logger.

<details>

<summary>Sample code is here.

Import `AbstractLogger` and implement it.  
Please expand this section who are interested in.

</summary>

```ts
import { AbstractLogger, type LogLevel } from 'electron-typed-ipc-bridge'

export class MyLogger extends AbstractLogger {
  protected writeLog(level: LogLevel, message: string): void {
    switch (level) {
      case 'info':
      case 'warn':
        console.log(message)
        break

      case 'error':
        console.error(message)
        break

      case 'verbose':
      case 'debug':
      case 'silly':
        console.debug(message)
        break
    }
  }
}
```

Set to the logger to this library.

- main.ts

  ```typescript
  import { initialize } from 'electron-typed-ipc-bridge/main'

  initialize({ logger: { main: new MyLogger() } })
  ```

- preload.ts

  ```typescript
  import { initialize } from 'electron-typed-ipc-bridge/preload'

  initialize({ logger: { preload: new MyLogger() } })
  ```

</details>

#### Log Level

Each log levels are output following information.  
(This is what we do now, but this may change in the future.)

|  level  | overview                                                               |
| :-----: | ---------------------------------------------------------------------- |
|  info   | Output the start and end of processing by the library                  |
|  warn   | - (Not used)                                                           |
|  error  | Output the message when runtime error occurred.                        |
| verbose | - (Not used)                                                           |
|  debug  | Output detailed log regarding `IpcBridgeApi` generation process        |
|  silly  | Output the function name and channel every time `IpcBridgeApi` is used |
