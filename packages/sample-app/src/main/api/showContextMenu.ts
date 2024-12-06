import { Menu } from 'electron'

import type { IpcMainInvokeEvent } from 'electron'

export const getContextMenuHandler = () => {
  const getMenu = () => {
    return Menu.getApplicationMenu()
  }

  return (_e: IpcMainInvokeEvent) => {
    const menu = getMenu()
    if (menu) {
      menu!.popup()
    }
  }
}
