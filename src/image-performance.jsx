const RESPONSIVE_WIDTHS = [480, 768, 960, 1200, 1600, 1920]

function withImageWidth(src, width) {
  if (!src?.includes('images.unsplash.com')) return src
  return src.replace(/([?&])w=\d+/, `$1w=${width}`)
}

export function unsplashSrcSet(src, widths = RESPONSIVE_WIDTHS) {
  if (!src?.includes('images.unsplash.com')) return undefined
  return widths.map((width) => `${withImageWidth(src, width)} ${width}w`).join(', ')
}
