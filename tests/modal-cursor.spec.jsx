import { test, expect } from '@playwright/test'

test.use({
  browserName: 'chromium',
  channel: 'chrome',
  viewport: { width: 1440, height: 900 },
})

test('plate modal keeps a visible cursor and close control is clickable', async ({ page }) => {
  await page.goto('http://localhost:5174/?motion=full')

  const plateImage = page.locator('[data-plate-card="active"] .plate-card-media-button')
  await plateImage.scrollIntoViewIfNeeded()
  await plateImage.click()

  const dialog = page.locator('[data-plate-modal]')
  const close = page.locator('.plate-modal-close')
  await expect(dialog).toBeVisible()
  await expect(close).toBeVisible()
  await expect.poll(() => close.evaluate((element) => getComputedStyle(element).opacity)).toBe('1')
  await expect.poll(() => page.locator('.plate-modal').evaluate((element) => getComputedStyle(element).transform)).toBe('none')

  const modalCursor = page.locator('[data-plate-modal-cursor]')
  await expect(modalCursor).toBeAttached()

  await close.hover()
  await expect.poll(() => close.evaluate((element) => getComputedStyle(element).cursor)).toBe('none')
  await expect.poll(() => dialog.evaluate((element) => getComputedStyle(element).cursor)).toBe('none')
  await expect.poll(async () => Number(await modalCursor.evaluate((element) => getComputedStyle(element).opacity))).toBeGreaterThan(0.9)

  await expect.poll(async () => {
    const closeBox = await close.boundingBox()
    const cursorBox = await modalCursor.boundingBox()
    if (!closeBox || !cursorBox) return false
    const closeCenter = { x: closeBox.x + closeBox.width / 2, y: closeBox.y + closeBox.height / 2 }
    const cursorCenter = { x: cursorBox.x + cursorBox.width / 2, y: cursorBox.y + cursorBox.height / 2 }
    return Math.hypot(closeCenter.x - cursorCenter.x, closeCenter.y - cursorCenter.y) < 12
  }).toBe(true)

  await page.screenshot({ path: 'C:/Users/sergi/AppData/Local/Temp/casda-modal-cursor-proof.png', fullPage: false })

  await close.click()
  await expect(dialog).toBeHidden()
})

test('house menu dish preview stays fluid, correct, and inside the viewport', async ({ page }) => {
  const consoleErrors = []
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(`${message.text()} @ ${message.location().url || 'unknown'}`)
  })

  await page.goto('http://localhost:5174/?motion=full')
  const menu = page.locator('#menu')
  await menu.scrollIntoViewIfNeeded()
  await page.waitForTimeout(1100)

  const empanadas = page.getByRole('button', { name: /empanadas de hongos/i })
  const ceviche = page.getByRole('button', { name: /ceviche de mercado/i })
  const preview = page.locator('[data-menu-preview]')
  const firstPanel = page.locator('.menu-panel').first()
  const widthBefore = await firstPanel.evaluate((element) => element.getBoundingClientRect().width)

  await empanadas.hover()
  await expect(preview).toBeVisible()
  await expect(preview.getByRole('heading', { name: 'Empanadas de Hongos' })).toBeVisible()
  await expect(preview.locator('img')).toHaveAttribute('src', /1667450722909/)
  await page.waitForTimeout(760)
  await page.screenshot({ path: 'C:/Users/sergi/AppData/Local/Temp/casda-house-menu-preview.png', fullPage: false })
  await preview.hover()
  await expect.poll(() => preview.evaluate((element) => getComputedStyle(element).cursor)).toBe('none')
  await expect.poll(async () => Number(await page.locator('[data-cursor]').evaluate((element) => getComputedStyle(element).opacity))).toBeGreaterThan(0.9)
  await empanadas.hover()

  const firstBox = await preview.boundingBox()
  expect(firstBox).not.toBeNull()
  expect(firstBox.x).toBeGreaterThanOrEqual(12)
  expect(firstBox.y).toBeGreaterThanOrEqual(12)
  expect(firstBox.x + firstBox.width).toBeLessThanOrEqual(1428)
  expect(firstBox.y + firstBox.height).toBeLessThanOrEqual(888)

  await ceviche.hover()
  await expect(preview).toBeVisible()
  await expect(preview.getByRole('heading', { name: 'Ceviche de Mercado' })).toBeVisible()
  await expect(preview.locator('img')).toHaveAttribute('src', /1565299624946/)
  expect(await page.locator('[data-menu-preview]').count()).toBe(1)

  await ceviche.focus()
  await expect(preview).toBeVisible()
  await expect(preview).toHaveAttribute('aria-label', /ceviche de mercado preview/i)

  const widthAfter = await firstPanel.evaluate((element) => element.getBoundingClientRect().width)
  expect(Math.abs(widthAfter - widthBefore)).toBeLessThan(0.5)

  await page.locator('.menu-intro').hover()
  await expect(preview).toBeHidden()
  expect(consoleErrors).toEqual([])
})

test('house menu preview stays clear of the active dish name at laptop width', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1100, height: 760 } })
  const page = await context.newPage()
  await page.goto('http://localhost:5174/?motion=full')
  await page.locator('#menu').scrollIntoViewIfNeeded()
  await page.waitForTimeout(900)

  const empanadas = page.getByRole('button', { name: /empanadas de hongos/i })
  const preview = page.locator('[data-menu-preview]')
  await empanadas.hover()
  await expect(preview).toBeVisible()
  await page.waitForTimeout(520)

  const cardBox = await preview.boundingBox()
  const nameBox = await empanadas.locator('strong').boundingBox()
  expect(cardBox).not.toBeNull()
  expect(nameBox).not.toBeNull()
  expect(cardBox.x).toBeGreaterThanOrEqual(14)
  expect(cardBox.x + cardBox.width).toBeLessThanOrEqual(1086)
  expect(cardBox.y).toBeGreaterThanOrEqual(14)
  expect(cardBox.y + cardBox.height).toBeLessThanOrEqual(746)

  const overlapsName = !(
    cardBox.x + cardBox.width <= nameBox.x
    || cardBox.x >= nameBox.x + nameBox.width
    || cardBox.y + cardBox.height <= nameBox.y
    || cardBox.y >= nameBox.y + nameBox.height
  )
  expect(overlapsName).toBe(false)
  await context.close()
})

test('every house menu row maps to its own preview content', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce',
  })
  const page = await context.newPage()
  await page.goto('http://localhost:5174/')
  await page.locator('#menu').scrollIntoViewIfNeeded()

  const rows = page.locator('[data-menu-row]')
  const preview = page.locator('[data-menu-preview]')
  await expect(rows).toHaveCount(15)

  for (let index = 0; index < 15; index += 1) {
    const row = rows.nth(index)
    const name = (await row.locator('strong').innerText()).trim()
    await row.focus()
    await expect(preview).toHaveAttribute('aria-label', `${name} preview`)
    await expect(preview.getByRole('heading', { name, exact: true })).toBeVisible()
    const image = preview.locator('img')
    await expect(image).toBeVisible()
    await expect.poll(() => image.evaluate((element) => element.complete && element.naturalWidth > 0)).toBe(true)
    await expect(preview.locator('.menu-dish-preview-placeholder')).toHaveCount(0)
    if (index === 0) await page.screenshot({ path: 'C:/Users/sergi/AppData/Local/Temp/casda-menu-yuca.png', fullPage: false })
    if (index === 14) await page.screenshot({ path: 'C:/Users/sergi/AppData/Local/Temp/casda-menu-tres-leches.png', fullPage: false })
  }

  await context.close()
})

test('house menu preview uses opacity-only motion when reduced motion is requested', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    reducedMotion: 'reduce',
  })
  const page = await context.newPage()
  await page.goto('http://localhost:5174/')
  await page.locator('#menu').scrollIntoViewIfNeeded()

  const empanadas = page.getByRole('button', { name: /empanadas de hongos/i })
  const surface = page.locator('[data-menu-preview-surface]')
  await empanadas.hover()
  await expect(surface).toBeVisible()
  await expect(surface).toHaveCSS('transform', 'none')
  await expect(surface).toHaveCSS('filter', 'none')
  await context.close()
})

test('house menu preview supports touch switching and tap-outside dismissal', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  })
  const page = await context.newPage()
  await page.goto('http://localhost:5174/?motion=full')
  await page.locator('#menu').scrollIntoViewIfNeeded()

  const yuca = page.getByRole('button', { name: /yuca frita/i })
  const empanadas = page.getByRole('button', { name: /empanadas de hongos/i })
  const preview = page.locator('[data-menu-preview]')

  await yuca.tap()
  await expect(preview).toBeVisible()
  await expect(preview.getByRole('heading', { name: 'Yuca Frita' })).toBeVisible()
  await expect(preview.locator('img')).toBeVisible()
  await expect.poll(() => preview.locator('img').evaluate((element) => element.complete && element.naturalWidth > 0)).toBe(true)

  await empanadas.tap()
  await expect(preview.getByRole('heading', { name: 'Empanadas de Hongos' })).toBeVisible()
  await page.waitForTimeout(520)
  await page.screenshot({ path: 'C:/Users/sergi/AppData/Local/Temp/casda-house-menu-preview-mobile.png', fullPage: false })

  const box = await preview.boundingBox()
  expect(box).not.toBeNull()
  expect(box.x).toBeGreaterThanOrEqual(8)
  expect(box.x + box.width).toBeLessThanOrEqual(382)
  expect(box.y).toBeGreaterThanOrEqual(8)
  expect(box.y + box.height).toBeLessThanOrEqual(836)

  await page.locator('.menu-intro').tap()
  await expect(preview).toBeHidden()
  await context.close()
})

test('CTA buttons use magnetic GSAP motion and settle cleanly', async ({ page }) => {
  const consoleErrors = []
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(`${message.text()} @ ${message.location().url || 'unknown'}`)
  })

  await page.goto('http://localhost:5174/?motion=full')
  const button = page.locator('.hero-actions .button-primary')
  const label = button.locator('.button-label')
  await expect(button).toHaveAttribute('data-cta-motion', 'ready')
  await page.waitForTimeout(1200)

  const box = await button.boundingBox()
  expect(box).not.toBeNull()
  await page.mouse.move(box.x + box.width * 0.84, box.y + box.height * 0.72)

  await expect.poll(() => button.evaluate((element) => {
    const matrix = new DOMMatrixReadOnly(getComputedStyle(element).transform)
    return Math.abs(matrix.m41) + Math.abs(matrix.m42)
  })).toBeGreaterThan(1)
  await expect.poll(async () => Number(await button.evaluate((element) => getComputedStyle(element).getPropertyValue('--button-sweep-scale')))).toBeGreaterThan(0.65)
  await expect.poll(() => label.evaluate((element) => getComputedStyle(element).transform)).not.toBe('none')
  await page.screenshot({ path: 'C:/Users/sergi/AppData/Local/Temp/casda-cta-motion.png', fullPage: false })

  await page.locator('.hero-body').hover()
  await page.waitForTimeout(650)
  const settled = await button.evaluate((element) => {
    const matrix = new DOMMatrixReadOnly(getComputedStyle(element).transform)
    return { x: matrix.m41, y: matrix.m42, scale: matrix.a, sweep: Number(getComputedStyle(element).getPropertyValue('--button-sweep-scale')) }
  })
  expect(Math.abs(settled.x)).toBeLessThan(0.25)
  expect(Math.abs(settled.y)).toBeLessThan(0.25)
  expect(Math.abs(settled.scale - 1)).toBeLessThan(0.01)
  expect(settled.sweep).toBeLessThan(0.05)

  for (let index = 0; index < 3; index += 1) {
    await button.hover()
    await page.locator('.hero-body').hover()
  }
  await page.waitForTimeout(650)
  await expect.poll(async () => Number(await button.evaluate((element) => getComputedStyle(element).getPropertyValue('--button-sweep-scale')))).toBeLessThan(0.05)

  await button.focus()
  await expect.poll(() => button.evaluate((element) => new DOMMatrixReadOnly(getComputedStyle(element).transform).m42)).toBeLessThan(-0.5)
  await button.blur()

  const barButton = page.locator('.bar-copy .button')
  await barButton.scrollIntoViewIfNeeded()
  await page.waitForTimeout(700)
  await barButton.hover()
  await expect(barButton).toHaveAttribute('data-cta-motion', 'ready')
  await expect.poll(async () => Number(await barButton.evaluate((element) => getComputedStyle(element).getPropertyValue('--button-sweep-scale')))).toBeGreaterThan(0.65)
  await page.screenshot({ path: 'C:/Users/sergi/AppData/Local/Temp/casda-cta-motion-dark.png', fullPage: false })

  const reserveSubmit = page.getByRole('button', { name: /find a table/i })
  await reserveSubmit.scrollIntoViewIfNeeded()
  await reserveSubmit.click()
  await expect(page.locator('#reservation-note')).toBeVisible()
  expect(consoleErrors).toEqual([])
})

test('CTA magnetic motion is disabled for reduced motion and touch', async ({ browser }) => {
  const reducedContext = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' })
  const reducedPage = await reducedContext.newPage()
  await reducedPage.goto('http://localhost:5174/')
  const reducedButton = reducedPage.locator('.hero-actions .button-primary')
  await expect(reducedButton).not.toHaveAttribute('data-cta-motion', 'ready')
  await reducedButton.hover()
  const reducedMatrix = await reducedButton.evaluate((element) => new DOMMatrixReadOnly(getComputedStyle(element).transform))
  expect(Math.abs(reducedMatrix.m41)).toBeLessThan(0.01)
  expect(Math.abs(reducedMatrix.m42)).toBeLessThan(0.01)
  await reducedContext.close()

  const touchContext = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })
  const touchPage = await touchContext.newPage()
  await touchPage.goto('http://localhost:5174/?motion=full')
  const touchButton = touchPage.locator('.hero-actions .button-primary')
  await expect(touchButton).not.toHaveAttribute('data-cta-motion', 'ready')
  await touchContext.close()
})

test('mobile internal navigation stays Lenis-free and lands on the target promptly', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  })
  const page = await context.newPage()
  await page.goto('http://localhost:5174/?motion=full')

  await expect(page.locator('html')).not.toHaveClass(/\blenis\b/)
  await page.getByRole('button', { name: /open menu/i }).click()
  await page.locator('#mobile-menu a[href="#menu"]').click()

  await expect.poll(() => page.locator('#menu').evaluate((element) => Math.round(element.getBoundingClientRect().top))).toBeGreaterThanOrEqual(70)
  await expect.poll(() => page.locator('#menu').evaluate((element) => Math.round(element.getBoundingClientRect().top))).toBeLessThanOrEqual(82)
  await expect(page.locator('html')).not.toHaveClass(/\blenis\b/)
  await context.close()
})

test('language copy morphs out before Spanish replaces English', async ({ page }) => {
  await page.goto('http://localhost:5174/?motion=full')

  const switcher = page.locator('.desktop-actions [data-language-switch]')
  const spanish = switcher.getByRole('button', { name: /switch to spanish/i })
  const heroLine = page.locator('[data-hero-line]').first().locator('span')
  const opacity = () => heroLine.evaluate((element) => Number(getComputedStyle(element).opacity))

  await expect(heroLine).toHaveText('Flavors with roots.')
  await spanish.click()

  await expect(switcher).toHaveAttribute('data-language', 'es')
  await page.waitForTimeout(100)
  await expect(heroLine).toHaveText('Flavors with roots.')
  expect(await opacity()).toBeLessThan(0.95)

  await page.waitForTimeout(340)
  await expect(heroLine).toHaveText('Sabores con raíces.')
  await expect(page.locator('html')).toHaveAttribute('lang', 'es')
  await page.screenshot({ path: 'C:/Users/sergi/AppData/Local/Temp/casda-language-copy-morph.png', fullPage: false })

  await page.waitForTimeout(650)
  await expect.poll(opacity).toBeGreaterThan(0.98)
  await expect(heroLine).toHaveCSS('filter', 'none')
})

test('language toggle thumb moves in deliberate slow motion', async ({ page }) => {
  await page.goto('http://localhost:5174/?motion=full')

  const switcher = page.locator('.desktop-actions [data-language-switch]')
  const thumb = switcher.locator('.language-thumb')
  const spanish = switcher.getByRole('button', { name: /switch to spanish/i })
  const translateX = () => thumb.evaluate((element) => new DOMMatrixReadOnly(getComputedStyle(element).transform).m41)

  await expect(switcher).toHaveAttribute('data-language', 'en')
  await expect.poll(translateX).toBeCloseTo(0, 1)
  await expect(thumb).toHaveCSS('transition-duration', '1.1s, 0.52s, 0.52s')
  await expect(thumb).toHaveCSS('transition-timing-function', 'cubic-bezier(0.45, 0, 0.55, 1), cubic-bezier(0.33, 1, 0.68, 1), cubic-bezier(0.33, 1, 0.68, 1)')

  await spanish.click()
  await expect(switcher).toHaveAttribute('data-language', 'es')

  await page.waitForTimeout(300)
  const earlyX = await translateX()
  expect(earlyX).toBeGreaterThan(1)
  expect(earlyX).toBeLessThan(11)

  await page.waitForTimeout(250)
  const midpointX = await translateX()
  expect(midpointX).toBeGreaterThan(13)
  expect(midpointX).toBeLessThan(22)
  await page.screenshot({ path: 'C:/Users/sergi/AppData/Local/Temp/casda-language-toggle-mid.png', fullPage: false })

  await page.waitForTimeout(650)
  await expect.poll(translateX).toBeGreaterThan(33)
})
