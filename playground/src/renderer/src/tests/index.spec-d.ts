describe('E2E', () => {
  it('should not any', () => {
    expectTypeOf<typeof window.api>().not.toBeAny()
  })
  describe('Types should be guessed correctly - invoke', () => {
    it('culc.add', () => {
      expectTypeOf<typeof window.api.invoke.culc.add>().not.toBeAny()

      type ExpectedType = (arg0: number, arg1: number) => Promise<number>
      expectTypeOf<
        typeof window.api.invoke.culc.add
      >().toEqualTypeOf<ExpectedType>()
    })

    it('culc.minus', () => {
      expectTypeOf<typeof window.api.invoke.culc.minus>().not.toBeAny()

      type ExpectedType = (arg0: number, arg1: number) => Promise<number>
      expectTypeOf<
        typeof window.api.invoke.culc.minus
      >().toEqualTypeOf<ExpectedType>()
    })

    it('ping', () => {
      expectTypeOf<typeof window.api.invoke.ping>().not.toBeAny()

      type ExpectedType = () => Promise<void>
      expectTypeOf<
        typeof window.api.invoke.ping
      >().toEqualTypeOf<ExpectedType>()
    })
    it('showContextMenu', () => {
      expectTypeOf<typeof window.api.invoke.showContextMenu>().not.toBeAny()

      type ExpectedType = () => Promise<void>
      expectTypeOf<
        typeof window.api.invoke.showContextMenu
      >().toEqualTypeOf<ExpectedType>()
    })
  })

  describe('Types should be guessed correctly - on', () => {
    it('updateCounter', () => {
      expectTypeOf<typeof window.api.on.updateCounter>().not.toBeAny()

      type ExpectedType = (
        callback: (
          event: Electron.CrossProcessExports.IpcRendererEvent,
          args: number
        ) => void
      ) => void
      expectTypeOf<
        typeof window.api.on.updateCounter
      >().toEqualTypeOf<ExpectedType>()
    })
  })
})
