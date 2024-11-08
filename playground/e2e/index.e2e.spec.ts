import { browser } from '@wdio/globals'

describe('Electron Testing', () => {
  beforeEach(async () => {
    await browser.$('#btn-reset').click()
    expect(await browser.$('#counter').getText()).toBe('0')
  })

  it('should print application title', async () => {
    expect(await browser.getTitle()).toBe('Electron')
  })

  it('should invoke the function of main process', async () => {
    await browser.$('#btn-add').click()
    expect(await browser.$('#counter').getText()).toBe('2')
  })

  it('should receive the message from main process', async () => {
    await browser.$('#btn-on-test').click()
    expect(await browser.$('#counter').getText()).toBe('1')
  })
})
