import { Menu, MenuItem } from 'electron'

import type { IpcSenderType } from './api'
import type { BrowserWindow } from 'electron'

const createMenu = (targetWindow: BrowserWindow, api: IpcSenderType) => {
  return new MenuItem({
    label: 'Test Message',
    submenu: [
      {
        label: 'Increment',
        click: () => {
          api.send.updateCounter(targetWindow, 1)
        }
      },
      {
        label: 'Decrement',
        click: () => api.send.updateCounter(targetWindow, -1)
      }
    ]
  })
}

export const setMenu = (targetWindow: BrowserWindow, api: IpcSenderType) => {
  const appMenu = Menu.getApplicationMenu()
  const menuItems = appMenu
    ? appMenu.items.concat([new MenuItem({ type: 'separator' })], createMenu(targetWindow, api))
    : [createMenu(targetWindow, api)]
  const newMenu = new Menu()
  menuItems.forEach((item, index) => {
    newMenu.insert(index, item)
  })
  Menu.setApplicationMenu(newMenu)
}
