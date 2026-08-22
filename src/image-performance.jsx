const RESPONSIVE_WIDTHS = [320, 480, 640, 720, 800, 960, 1200, 1600]

function optimizedQuality(src) {
  const match = src?.match(/[?&]q=(\d+)/)
  const requested = match ? Number(match[1]) : 72
  if (requested >= 90) return 72
  return Math.min(requested, 64)
}

function withImageWidth(src, width) {
  if (!src?.includes('images.unsplash.com')) return src

  const quality = optimizedQuality(src)
  let next = src.replace(/([?&])w=\d+/, `$1w=${width}`)
  if (/([?&])q=\d+/.test(next)) {
    next = next.replace(/([?&])q=\d+/, `$1q=${quality}`)
  } else {
    next += `${next.includes('?') ? '&' : '?'}q=${quality}`
  }
  return next
}

export function unsplashSrcSet(src, widths = RESPONSIVE_WIDTHS) {
  if (!src?.includes('images.unsplash.com')) return undefined
  return widths.map((width) => `${withImageWidth(src, width)} ${width}w`).join(', ')
}
