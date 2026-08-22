import '@testing-library/jest-dom/vitest'

class IntersectionObserverMock {
  constructor(callback) { this.callback = callback }
  observe(target) { this.callback?.([{ isIntersecting: true, target }], this) }
  unobserve() {}
  disconnect() {}
}

globalThis.IntersectionObserver = IntersectionObserverMock

window.matchMedia = window.matchMedia || (() => ({
  matches: false,
  media: '',
  onchange: null,
  addListener() {},
  removeListener() {},
  addEventListener() {},
  removeEventListener() {},
  dispatchEvent() { return false },
}))

window.scrollTo = () => {}
