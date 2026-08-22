import { readFileSync } from 'node:fs'
import { afterEach, expect, test, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import './test/setup.jsx'
import Lenis from 'lenis'
import App from './App.jsx'

afterEach(() => {
  cleanup()
  localStorage.clear()
  document.documentElement.lang = 'en'
})

test('mobile menu button toggles navigation visibility', () => {
  render(<App />)

  const button = screen.getByRole('button', { name: /open menu/i })
  const menu = document.getElementById('mobile-menu')

  expect(menu).toHaveClass('hidden')
  fireEvent.click(button)
  expect(button).toHaveAttribute('aria-expanded', 'true')
  expect(menu).not.toHaveClass('hidden')
})

test('reservation button shows status note', () => {
  render(<App />)

  const note = document.getElementById('reservation-note')
  expect(note).toHaveClass('hidden')

  fireEvent.click(screen.getByRole('button', { name: /find a table/i }))

  expect(note).not.toHaveClass('hidden')
})

test('newsletter submission shows confirmation note', () => {
  render(<App />)

  const note = document.getElementById('newsletter-note')
  expect(note).toHaveClass('hidden')

  fireEvent.submit(document.getElementById('newsletter-form'))

  expect(note).not.toHaveClass('hidden')
})

test('landing page exposes GSAP motion structure without a decorative scroll cue', () => {
  render(<App />)

  expect(document.querySelector('[data-motion-root]')).toBeInTheDocument()
  expect(document.querySelector('[data-hero-media]')).toBeInTheDocument()
  expect(document.querySelector('[data-menu-pin]')).toBeInTheDocument()
  expect(document.querySelectorAll('[data-motion-reveal]').length).toBeGreaterThanOrEqual(6)
  expect(screen.queryByText(/^scroll$/i)).not.toBeInTheDocument()
})

test('menu signature moment keeps the full menu accessible in document order', () => {
  render(<App />)

  const menu = document.getElementById('menu')
  expect(menu).toHaveAttribute('data-menu-pin')
  expect(menu).toHaveTextContent('To Share')
  expect(menu).toHaveTextContent('Mains')
  expect(menu).toHaveTextContent('Desserts')
})

test('house menu rows expose one persistent dish preview on hover and keyboard focus', async () => {
  render(<App />)

  const empanadas = screen.getByRole('button', { name: /empanadas de hongos/i })
  const ceviche = screen.getByRole('button', { name: /ceviche de mercado/i })

  fireEvent.pointerEnter(empanadas)
  const preview = await screen.findByRole('region', { name: /empanadas de hongos preview/i })
  expect(preview).toHaveTextContent('Wild mushrooms folded with fresh cheese')
  expect(preview).toHaveTextContent('Chimichurri')
  expect(document.querySelectorAll('[data-menu-preview]').length).toBe(1)
  expect(preview.querySelector('button')).toBeNull()

  fireEvent.focus(ceviche)
  await waitFor(() => {
    expect(screen.getByRole('region', { name: /ceviche de mercado preview/i })).toHaveTextContent('Daily catch brightened with leche de tigre')
  })
  expect(document.querySelectorAll('[data-menu-preview]').length).toBe(1)
})

test('house menu preview data is structured instead of duplicated in the card component', () => {
  const data = readFileSync(`${process.cwd()}/src/i18n.jsx`, 'utf8')
  const source = readFileSync(`${process.cwd()}/src/MenuHoverPreview.jsx`, 'utf8')

  expect(data).toContain("previewDescription:")
  expect(data).toContain("accompaniments:")
  expect(data).toContain("image:")
  expect(source).not.toContain('Empanadas de Hongos')
  expect(source).not.toContain('Ceviche de Mercado')
})

test('every house menu dish has a real preview image', () => {
  const data = readFileSync(`${process.cwd()}/src/i18n.jsx`, 'utf8')

  expect(data).not.toContain('image: null')
})

test('shared CTA buttons use GSAP magnetic motion instead of basic CSS lift', () => {
  const source = readFileSync(`${process.cwd()}/src/App.jsx`, 'utf8')
  const css = readFileSync(`${process.cwd()}/styles.css`, 'utf8')

  expect(source).toContain("gsap.utils.toArray('.button')")
  expect(source).toContain("button.dataset.ctaMotion = 'ready'")
  expect(source).toContain("'--button-sweep-scale'")
  expect(source).toContain("button.addEventListener('pointermove', moveButton)")
  expect(source).toContain("button.addEventListener('focus', focusButton)")
  expect(css).toContain('.button::before')
  expect(css).toContain('transform: scaleX(var(--button-sweep-scale, 0))')
  expect(css).not.toContain('.button:hover { transform: translateY(-2px); }')
})

test('mobile critical bundle defers desktop and below-fold scroll libraries', () => {
  const source = readFileSync(`${process.cwd()}/src/App.jsx`, 'utf8')

  expect(source).not.toContain("import { ScrollTrigger } from 'gsap/ScrollTrigger'")
  expect(source).not.toContain("import { SplitText } from 'gsap/SplitText'")
  expect(source).not.toContain("import Lenis from 'lenis'")
  expect(source).toContain("import('gsap/ScrollTrigger')")
  expect(source).toContain("import('gsap/SplitText')")
  expect(source).toContain("import('lenis')")
})

test('PageSpeed-critical fonts are self-hosted instead of render-blocking through Google Fonts', () => {
  const html = readFileSync(`${process.cwd()}/index.html`, 'utf8')
  const css = readFileSync(`${process.cwd()}/styles.css`, 'utf8')

  expect(html).not.toContain('fonts.googleapis.com')
  expect(html).not.toContain('fonts.gstatic.com')
  expect(css).toContain('@font-face')
  expect(css).toContain("url('/fonts/")
})

test('visible brand and language labels are included in their accessible names', () => {
  render(<App />)

  expect(screen.getByRole('link', { name: /Casa Raíz Latin American Cuisine/i })).toBeInTheDocument()
  expect(screen.getAllByRole('button', { name: /^EN\b/i }).length).toBeGreaterThan(0)
  expect(screen.getAllByRole('button', { name: /^ES\b/i }).length).toBeGreaterThan(0)
})

test('initially rendered images expose positive intrinsic dimensions', () => {
  render(<App />)

  const images = [...document.querySelectorAll('img')]
  expect(images.length).toBeGreaterThan(10)
  images.forEach((image) => {
    expect(Number(image.getAttribute('width'))).toBeGreaterThan(0)
    expect(Number(image.getAttribute('height'))).toBeGreaterThan(0)
  })
})

test('critical hero media is responsive and high priority while secondary media is lazy', () => {
  const app = readFileSync(`${process.cwd()}/src/App.jsx`, 'utf8')
  const plates = readFileSync(`${process.cwd()}/src/PlateDeck.jsx`, 'utf8')
  const drinks = readFileSync(`${process.cwd()}/src/DrinksShowcase.jsx`, 'utf8')
  const html = readFileSync(`${process.cwd()}/index.html`, 'utf8')

  expect(app).toContain('fetchPriority="high"')
  expect(app).toContain('loading="eager"')
  expect(app).toContain('data-hero-image')
  expect(app).toContain('srcSet={unsplashSrcSet(')
  expect(app.match(/loading="lazy"/g)?.length || 0).toBeGreaterThanOrEqual(8)
  expect(app.match(/decoding="async"/g)?.length || 0).toBeGreaterThanOrEqual(9)
  expect(plates).toContain('loading="lazy"')
  expect(plates).toContain('decoding="async"')
  expect(drinks).toContain("loading=" + "'lazy'")
  expect(drinks).toContain('decoding="async"')
  expect(html).toContain('rel="preconnect" href="https://images.unsplash.com"')
  expect(html).toContain('rel="preload" as="image"')
  expect(html).toContain('imagesrcset=')
})

test('below-fold GSAP setup is deferred until sections approach the viewport', () => {
  const source = readFileSync(`${process.cwd()}/src/App.jsx`, 'utf8')
  const runtime = readFileSync(`${process.cwd()}/src/scroll-motion-runtime.jsx`, 'utf8')

  expect(runtime).toContain('new IntersectionObserver')
  expect(runtime).toContain('observeMotionTarget')
  expect(runtime).toContain("rootMargin = '80% 0px'")
  expect(source).toContain("node.dataset.motionDeferred = 'ready'")
})

test('Lenis only runs on desktop fine-pointer sessions and mobile anchors use native scrolling', () => {
  const source = readFileSync(`${process.cwd()}/src/App.jsx`, 'utf8')
  const runtime = readFileSync(`${process.cwd()}/src/scroll-motion-runtime.jsx`, 'utf8')

  expect(source).toContain("const desktopViewport = window.matchMedia('(min-width: 900px)').matches")
  expect(source).toContain("const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches")
  expect(source).toContain('const useLenis = desktopViewport && finePointer')
  expect(source).toContain("useLenis ? import('lenis') : Promise.resolve(null)")
  expect(runtime).toContain('const lenis = useLenis && Lenis ? new Lenis({')
  expect(source).toContain('const scrollNativeTo = (element) => {')
  expect(source).toContain('window.requestAnimationFrame(step)')
  expect(source).toContain('nativeScrollFrame = window.requestAnimationFrame(step)')
})

test('plates section renders an infinite swipe deck with more dishes', () => {
  render(<App />)

  const deck = document.querySelector('[data-plate-deck]')
  expect(deck).toBeInTheDocument()
  expect(deck).toHaveAttribute('data-loop', 'true')
  expect(document.querySelectorAll('[data-plate-card]').length).toBe(3)
  expect(document.querySelector('[data-plate-card="active"]')).toHaveTextContent('Carne Asada con Chimichurri')
  expect(screen.getByRole('button', { name: /previous plate/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /next plate/i })).toBeInTheDocument()

  const source = readFileSync(`${process.cwd()}/src/i18n.jsx`, 'utf8')
  expect((source.match(/price: '\$/g) || []).length).toBeGreaterThanOrEqual(16)
})

test('plate deck arrows animate in the same direction they point', async () => {
  render(<App />)

  const active = () => document.querySelector('[data-plate-card="active"]')
  const right = screen.getByRole('button', { name: /next plate/i })
  const left = screen.getByRole('button', { name: /previous plate/i })

  expect(right).toHaveAttribute('data-exit-direction', 'right')
  expect(left).toHaveAttribute('data-exit-direction', 'left')

  fireEvent.click(right)
  await waitFor(() => {
    expect(active()).toHaveTextContent('Ceviche del Mercado')
  }, { timeout: 1500 })

  fireEvent.click(left)
  await waitFor(() => {
    expect(active()).toHaveTextContent('Carne Asada con Chimichurri')
  }, { timeout: 1500 })
})

test('clicking the active plate image opens bilingual nutrition details and escape closes them', async () => {
  render(<App />)

  fireEvent.click(screen.getByRole('button', { name: /view details for carne asada/i }))

  const dialog = await screen.findByRole('dialog', { name: /carne asada con chimichurri/i })
  expect(dialog.tagName).toBe('DIALOG')
  expect(dialog).toHaveTextContent(/calories/i)
  expect(dialog).toHaveTextContent(/protein/i)
  expect(dialog).toHaveTextContent(/carbs/i)
  expect(dialog).toHaveTextContent(/fat/i)
  expect(dialog).toHaveTextContent(/estimated nutrition/i)

  fireEvent.keyDown(document, { key: 'Escape' })
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
})

test('plate modal uses a slow staged entrance instead of popping in', () => {
  const source = readFileSync(`${process.cwd()}/src/PlateDeck.jsx`, 'utf8')

  expect(source).toContain('const modalTimeline = gsap.timeline')
  expect(source).toContain('duration: 0.78')
  expect(source).toContain("panel.querySelector('.plate-modal-media img')")
  expect(source).toContain("panel.querySelectorAll('.plate-modal-copy > *')")
})

test('plate image does not capture the pointer until a real drag starts', () => {
  render(<App />)

  const imageButton = screen.getByRole('button', { name: /view details for carne asada/i })
  const activeCard = document.querySelector('[data-plate-card="active"]')
  activeCard.setPointerCapture = vi.fn()

  const dispatchPointer = (type, clientX) => {
    const event = new Event(type, { bubbles: true })
    Object.defineProperties(event, {
      pointerId: { value: 7 },
      clientX: { value: clientX },
    })
    fireEvent(imageButton, event)
  }

  dispatchPointer('pointerdown', 100)
  expect(activeCard.setPointerCapture).not.toHaveBeenCalled()

  dispatchPointer('pointermove', 112)
  expect(activeCard.setPointerCapture).toHaveBeenCalledTimes(1)
})

test('drinks with soul exposes four interactive drink choices that switch the featured image', () => {
  render(<App />)

  const showcase = document.querySelector('[data-drinks-showcase]')
  expect(showcase).toBeInTheDocument()

  const signature = screen.getByRole('button', { name: /signature cocktails/i })
  const agave = screen.getByRole('button', { name: /mezcal & tequila/i })
  const wine = screen.getByRole('button', { name: /wine/i })
  const zeroProof = screen.getByRole('button', { name: /zero proof/i })

  expect(signature).toHaveAttribute('aria-pressed', 'true')
  expect(agave).toHaveAttribute('aria-pressed', 'false')
  expect(wine).toHaveAttribute('aria-pressed', 'false')
  expect(zeroProof).toHaveAttribute('aria-pressed', 'false')
  expect(document.querySelector('[data-drink-image="active"]')).toHaveAttribute('alt', expect.stringMatching(/signature cocktail/i))

  fireEvent.mouseEnter(wine)
  expect(wine).toHaveAttribute('aria-pressed', 'true')
  expect(document.querySelector('[data-drink-image="active"]')).toHaveAttribute('alt', expect.stringMatching(/wine/i))

  fireEvent.focus(zeroProof)
  expect(zeroProof).toHaveAttribute('aria-pressed', 'true')
  expect(document.querySelector('[data-drink-image="active"]')).toHaveAttribute('alt', expect.stringMatching(/zero-proof/i))
})

test('drink selector fill expands from the center for the active hover state', () => {
  const css = readFileSync(`${process.cwd()}/styles.css`, 'utf8')

  expect(css).toContain('.drink-option::before')
  expect(css).toContain('transform-origin: center')
  expect(css).toContain('transform: scaleX(0)')
  expect(css).toContain('.drink-option[data-active="true"]::before')
  expect(css).toContain('transform: scaleX(1)')
})

test('drink image reveal expands symmetrically from the center', () => {
  const source = readFileSync(`${process.cwd()}/src/DrinksShowcase.jsx`, 'utf8')

  expect(source).toContain("clipPath: 'polygon(50% 0%, 50% 0%, 50% 100%, 50% 100%)'")
  expect(source).toContain("clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'")
})

test('document body does not reintroduce the retired warm Tailwind color classes', () => {
  const html = readFileSync(`${process.cwd()}/index.html`, 'utf8')

  expect(html).not.toContain('bg-paper')
  expect(html).not.toContain('text-charcoal')
})

test('hero uses separate copy and media panels with explicit motion hooks', () => {
  render(<App />)

  const hero = document.getElementById('home')
  expect(hero.querySelector('[data-hero-panel="copy"]')).toBeInTheDocument()
  expect(hero.querySelector('[data-hero-panel="media"]')).toBeInTheDocument()
  expect(hero.querySelector('[data-hero-clip]')).toBeInTheDocument()
  expect(hero.querySelectorAll('[data-hero-line]').length).toBe(2)
})

test('GSAP runtime initializes and creates masked heading lines', async () => {
  const originalResizeObserver = globalThis.ResizeObserver
  globalThis.ResizeObserver = class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  const view = render(<App />)

  try {
    await waitFor(() => {
      expect(view.container.querySelector('[data-motion-root]')).toHaveAttribute('data-motion-status', 'ready')
    })
    expect(view.container.querySelectorAll('.split-line').length).toBeGreaterThan(0)
  } finally {
    view.unmount()
    if (originalResizeObserver) globalThis.ResizeObserver = originalResizeObserver
    else delete globalThis.ResizeObserver
  }
})

test('full-motion URL explicitly overrides the system reduced-motion preference', async () => {
  const originalResizeObserver = globalThis.ResizeObserver
  const originalMatchMedia = window.matchMedia
  const originalScrollTo = window.scrollTo
  const originalUrl = window.location.href

  globalThis.ResizeObserver = class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  window.matchMedia = (query) => ({
    matches: query === '(prefers-reduced-motion: reduce)' || query.includes('min-width') || query.includes('hover: hover'),
    media: query,
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() { return false },
  })
  window.scrollTo = () => {}
  window.history.replaceState({}, '', '/?motion=full')

  const view = render(<App />)

  try {
    await waitFor(() => {
      expect(view.container.querySelector('[data-motion-root]')).toHaveAttribute('data-motion-status', 'ready')
    })
    expect(view.container.querySelector('[data-motion-root]')).toHaveAttribute('data-motion-preference', 'full')
    expect(document.documentElement).toHaveClass('motion-forced')
    expect(view.container.querySelectorAll('.split-line').length).toBeGreaterThan(0)
  } finally {
    view.unmount()
    window.matchMedia = originalMatchMedia
    window.scrollTo = originalScrollTo
    window.history.replaceState({}, '', originalUrl)
    if (originalResizeObserver) globalThis.ResizeObserver = originalResizeObserver
    else delete globalThis.ResizeObserver
  }

  expect(document.documentElement).not.toHaveClass('motion-forced')
})

test('language changes keep SplitText heading structure intact when motion is active', async () => {
  const originalResizeObserver = globalThis.ResizeObserver
  globalThis.ResizeObserver = class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  const view = render(<App />)

  try {
    await waitFor(() => {
      expect(view.container.querySelector('[data-motion-root]')).toHaveAttribute('data-motion-status', 'ready')
    })
    expect(view.container.querySelector('#dishes h2 .split-line')).toBeInTheDocument()

    fireEvent.click(screen.getAllByRole('button', { name: /switch to spanish/i })[0])

    await waitFor(() => {
      expect(view.container.querySelector('#dishes h2')).toHaveTextContent('Platos hechos con intención')
    })
    expect(view.container.querySelector('#dishes h2 .split-line')).toBeInTheDocument()
  } finally {
    view.unmount()
    if (originalResizeObserver) globalThis.ResizeObserver = originalResizeObserver
    else delete globalThis.ResizeObserver
  }
})

test('language selector translates visible copy and persists Spanish after the morph transition', async () => {
  render(<App />)

  expect(document.documentElement.lang).toBe('en')
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Flavors with roots')

  fireEvent.click(screen.getAllByRole('button', { name: /switch to spanish/i })[0])

  await waitFor(() => {
    expect(document.documentElement.lang).toBe('es')
    expect(localStorage.getItem('casa-raiz-language')).toBe('es')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Sabores con raíces')
  }, { timeout: 1500 })
  expect(screen.getAllByRole('link', { name: /nuestra historia/i })[0]).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /cócteles de autor/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /vinos/i })).toBeInTheDocument()
})

test('language selector exposes a sliding segmented control in the desktop navbar', () => {
  render(<App />)

  const actions = document.querySelector('.desktop-actions')
  const switcher = actions.querySelector('[data-language-switch]')
  const reserve = actions.querySelector('[data-nav-reserve]')

  expect(switcher).toBeInTheDocument()
  expect(switcher.querySelector('.language-thumb')).toBeInTheDocument()
  expect(reserve).toBeInTheDocument()
  expect(switcher.compareDocumentPosition(reserve) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
})

test('navbar entrance animates the actions group instead of transforming its reserve button directly', () => {
  const source = readFileSync(`${process.cwd()}/src/App.jsx`, 'utf8')

  expect(source).toContain(".from('.desktop-nav a, .desktop-actions', {")
  expect(source).not.toContain(".desktop-nav a, .desktop-actions > *")
})

test('language toggle uses a deliberate slow-motion thumb transition', () => {
  const css = readFileSync(`${process.cwd()}/styles.css`, 'utf8')

  expect(css).toContain('transition: transform 1100ms cubic-bezier(.45, 0, .55, 1)')
  expect(css).toContain('transition: color 780ms cubic-bezier(.45, 0, .55, 1)')
})

test('page does not use the broken Unsplash restaurant-interior asset', () => {
  const source = readFileSync(`${process.cwd()}/src/App.jsx`, 'utf8')

  expect(source).not.toContain('photo-1517248135467-4c7edcad34c5')
  expect(source).toContain('photo-1514933651103-005eec06c04b')
})

test('custom cursor stays as a plain point and never shows a View label', () => {
  const source = readFileSync(`${process.cwd()}/src/App.jsx`, 'utf8')

  expect(source).not.toContain("cursorLabel.textContent = viewTarget ? 'View' : ''")
  expect(source).not.toContain("cursor.dataset.state = viewTarget ? 'view' : actionTarget ? 'link' : 'default'")
})

test('plate modal keeps the black custom cursor inside the dialog top layer', () => {
  const css = readFileSync(`${process.cwd()}/styles.css`, 'utf8')
  const source = readFileSync(`${process.cwd()}/src/PlateDeck.jsx`, 'utf8')

  expect(css).toContain('.plate-modal-cursor')
  expect(css).toContain('.cursor-ready .plate-modal-shell { cursor: none; }')
  expect(source).toContain('data-plate-modal-cursor')
  expect(source).toContain("dialog.addEventListener('pointermove', moveModalCursor")
})

test('desktop internal navigation keeps the explicit animated Lenis scroll', async () => {
  const originalResizeObserver = globalThis.ResizeObserver
  const originalMatchMedia = window.matchMedia
  globalThis.ResizeObserver = class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  window.matchMedia = (query) => ({
    matches: query === '(min-width: 900px)' || query.includes('(hover: hover) and (pointer: fine)'),
    media: query,
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() { return false },
  })
  const scrollSpy = vi.spyOn(Lenis.prototype, 'scrollTo').mockImplementation(() => {})
  const view = render(<App />)

  try {
    await waitFor(() => {
      expect(view.container.querySelector('[data-motion-root]')).toHaveAttribute('data-motion-status', 'ready')
    })

    fireEvent.click(document.querySelector('.desktop-nav a[href="#story"]'))

    expect(scrollSpy).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      expect.objectContaining({
        offset: -76,
        duration: expect.any(Number),
        easing: expect.any(Function),
      }),
    )
    expect(scrollSpy.mock.calls.at(-1)[1].duration).toBeGreaterThan(1)
  } finally {
    view.unmount()
    scrollSpy.mockRestore()
    window.matchMedia = originalMatchMedia
    if (originalResizeObserver) globalThis.ResizeObserver = originalResizeObserver
    else delete globalThis.ResizeObserver
  }
})
