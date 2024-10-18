# electron-typed-ipc-bridge

Generate api on the bridge across isolated contexts of the electron.

# Use

## install

```
npm install --save-dev electron-typed-ipc-bridge
```

# Implimentation

1. create api on main script

   ```ex. main/api.ts
   const api = {
     hello: (to: string)=>console.log(`hellow ${to}!`),
     calc: {
       add: (a:number, b:number) => a + b,
       minus: (a:number, b:number) => a - b,
     }
   } as const

   export type IpcBridgeApi = IpcBridgeApiTypeGenerator<typeof api>

   ```

1. add handler at main.ts

   ```
   registerIpcHandler(api)
   ```

1. add invoker at preload.ts

   ```
   const api = await getApiInvoker()

   if (process.contextIsolated) {
     try {
       contextBridge.exposeInMainWorld('electron', electronAPI)
       contextBridge.exposeInMainWorld('api', api)
     } catch (error) {
       console.error(error)
     }
   } else {
     window.electron = electronAPI
     window.api = api
   }

   ```

1. add type decolation

   ```
   import type { IpcBridgeApi } from '@main/api'

   import type { ElectronAPI } from '@electron-toolkit/preload'

   declare global {
     interface Window {
       electron: ElectronAPI
       api: IpcBridgeApi
     }
   }

   ```
