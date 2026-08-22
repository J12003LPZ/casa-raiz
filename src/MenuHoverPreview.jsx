import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import gsap from 'gsap'

const PREVIEW_ID = 'house-menu-dish-preview'
const VIEWPORT_GUTTER = 14

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), Math.max(min, max))
}

function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    && !document.documentElement.classList.contains('motion-forced')
}

function usesFinePointer() {
  return window.matchMedia?.('(hover: hover) and (pointer: fine)').matches
}

export default function MenuHoverPreview({ groups, labels }) {
  const [displayedItem, setDisplayedItem] = useState(null)
  const [activeName, setActiveName] = useState(null)
  const [visible, setVisible] = useState(false)
  const previewRef = useRef(null)
  const surfaceRef = useRef(null)
  const contentRef = useRef(null)
  const anchorRef = useRef(null)
  const displayedRef = useRef(null)
  const pendingRef = useRef(null)
  const switchingRef = useRef(false)
  const closeTimerRef = useRef(null)
  const positionFrameRef = useRef(null)

  const cancelClose = () => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }

  const updatePosition = (animate = true) => {
    const anchor = anchorRef.current
    const preview = previewRef.current
    if (!anchor || !preview) return

    const anchorBox = anchor.getBoundingClientRect()
    const width = preview.offsetWidth || 288
    const height = preview.offsetHeight || 410
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const mobileLayout = !usesFinePointer() || viewportWidth <= 700
    let x
    let y

    if (mobileLayout) {
      x = clamp((viewportWidth - width) / 2, 12, viewportWidth - width - 12)
      y = clamp(viewportHeight - height - 12, 12, viewportHeight - height - 12)
    } else {
      const rightX = anchorBox.right + 18
      const leftX = anchorBox.left - width - 18
      x = rightX + width <= viewportWidth - VIEWPORT_GUTTER ? rightX : leftX
      if (x < VIEWPORT_GUTTER) {
        x = anchorBox.left + (anchorBox.width - width) / 2
      }
      x = clamp(x, VIEWPORT_GUTTER, viewportWidth - width - VIEWPORT_GUTTER)

      const headerBottom = document.getElementById('site-header')?.getBoundingClientRect().bottom || 0
      const minY = Math.max(VIEWPORT_GUTTER, headerBottom + 14)
      y = anchorBox.top + (anchorBox.height - height) / 2
      y = clamp(y, minY, viewportHeight - height - VIEWPORT_GUTTER)
    }

    gsap.to(preview, {
      x,
      y,
      duration: animate && !prefersReducedMotion() ? 0.46 : 0,
      ease: 'power3.out',
      overwrite: 'auto',
    })
  }

  const requestPosition = (animate = true) => {
    if (positionFrameRef.current) window.cancelAnimationFrame(positionFrameRef.current)
    positionFrameRef.current = window.requestAnimationFrame(() => updatePosition(animate))
  }

  const keepTouchAnchorClear = () => {
    if (usesFinePointer() && window.innerWidth > 700) return
    const anchor = anchorRef.current
    const preview = previewRef.current
    if (!anchor || !preview) return

    const anchorBox = anchor.getBoundingClientRect()
    const headerBottom = document.getElementById('site-header')?.getBoundingClientRect().bottom || 0
    const previewTop = window.innerHeight - preview.offsetHeight - 12
    if (anchorBox.bottom <= previewTop - 14) return

    const targetTop = headerBottom + 24
    const top = Math.max(0, window.scrollY + anchorBox.top - targetTop)
    window.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
  }

  const runPendingSwap = () => {
    const nextItem = pendingRef.current
    const content = contentRef.current
    if (!nextItem || !content || switchingRef.current) return

    pendingRef.current = null
    switchingRef.current = true

    const commitNext = () => {
      const latest = pendingRef.current ?? nextItem
      pendingRef.current = null
      displayedRef.current = latest
      setDisplayedItem(latest)

      window.requestAnimationFrame(() => {
        const nextContent = contentRef.current
        const image = nextContent?.querySelector('.menu-dish-preview-media img')
        if (!nextContent) {
          switchingRef.current = false
          return
        }

        if (prefersReducedMotion()) {
          gsap.set(nextContent, { opacity: 1, y: 0, clearProps: 'transform,opacity' })
          switchingRef.current = false
        } else {
          gsap.fromTo(nextContent,
            { opacity: 0, y: 7 },
            {
              opacity: 1,
              y: 0,
              duration: 0.3,
              ease: 'power3.out',
              overwrite: 'auto',
              clearProps: 'transform,opacity',
              onComplete: () => {
                switchingRef.current = false
                if (pendingRef.current && pendingRef.current.name !== displayedRef.current?.name) runPendingSwap()
              },
            },
          )
          if (image) {
            gsap.fromTo(image, { scale: 1.04 }, { scale: 1, duration: 0.72, ease: 'power3.out', overwrite: 'auto' })
          }
        }
        requestPosition(true)
      })
    }

    if (prefersReducedMotion()) {
      commitNext()
      return
    }

    gsap.to(content, {
      opacity: 0,
      y: -5,
      duration: 0.17,
      ease: 'power2.in',
      overwrite: 'auto',
      onComplete: commitNext,
    })
  }

  const activateItem = (item, element) => {
    cancelClose()
    anchorRef.current = element
    setActiveName(item.name)
    requestPosition(visible)

    if (!displayedRef.current) {
      displayedRef.current = item
      setDisplayedItem(item)
      setVisible(true)
      return
    }

    if (!visible) {
      displayedRef.current = item
      setDisplayedItem(item)
      setVisible(true)
      return
    }

    if (displayedRef.current.name !== item.name) {
      pendingRef.current = item
      runPendingSwap()
    }
  }

  const closePreview = () => {
    cancelClose()
    pendingRef.current = null
    setActiveName(null)
    setVisible(false)
  }

  const scheduleClose = () => {
    cancelClose()
    closeTimerRef.current = window.setTimeout(closePreview, usesFinePointer() ? 150 : 0)
  }

  useLayoutEffect(() => {
    const preview = previewRef.current
    const surface = surfaceRef.current
    if (!preview || !surface || !displayedItem) return undefined

    gsap.killTweensOf(surface)

    if (visible) {
      gsap.set(preview, { autoAlpha: 1 })
      requestPosition(false)
        keepTouchAnchorClear()
      if (prefersReducedMotion()) {
        gsap.fromTo(surface, { opacity: 0 }, { opacity: 1, duration: 0.18, ease: 'none', clearProps: 'opacity' })
      } else {
        gsap.fromTo(surface,
          { opacity: 0, y: 12, scale: 0.975, filter: 'blur(3px)' },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: 'blur(0px)',
            duration: 0.44,
            ease: 'power3.out',
            overwrite: 'auto',
            clearProps: 'transform,opacity,filter',
          },
        )
        const image = surface.querySelector('.menu-dish-preview-media img')
        if (image) gsap.fromTo(image, { scale: 1.04 }, { scale: 1, duration: 0.72, ease: 'power3.out' })
      }
    } else {
      if (prefersReducedMotion()) {
        gsap.to(surface, {
          opacity: 0,
          duration: 0.12,
          ease: 'none',
          onComplete: () => gsap.set(preview, { autoAlpha: 0 }),
        })
      } else {
        gsap.to(surface, {
          opacity: 0,
          y: 7,
          scale: 0.985,
          filter: 'blur(2px)',
          duration: 0.26,
          ease: 'power2.in',
          overwrite: 'auto',
          onComplete: () => {
            gsap.set(preview, { autoAlpha: 0 })
            gsap.set(surface, { clearProps: 'transform,opacity,filter' })
          },
        })
      }
    }

    return undefined
  }, [visible])

  useEffect(() => {
    if (!visible) return undefined

    const onViewportChange = () => requestPosition(true)
    const menuViewport = document.querySelector('[data-menu-viewport]')
    window.addEventListener('scroll', onViewportChange, { passive: true })
    window.addEventListener('resize', onViewportChange, { passive: true })
    menuViewport?.addEventListener('scroll', onViewportChange, { passive: true })

    return () => {
      window.removeEventListener('scroll', onViewportChange)
      window.removeEventListener('resize', onViewportChange)
      menuViewport?.removeEventListener('scroll', onViewportChange)
    }
  }, [visible])

  useEffect(() => {
    if (!visible) return undefined

    const handleOutsidePointer = (event) => {
      if (previewRef.current?.contains(event.target)) return
      if (event.target.closest?.('[data-menu-row]')) return
      closePreview()
    }
    const handleEscape = (event) => {
      if (event.key === 'Escape') closePreview()
    }

    document.addEventListener('pointerdown', handleOutsidePointer, true)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('pointerdown', handleOutsidePointer, true)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [visible])

  useEffect(() => () => {
    cancelClose()
    if (positionFrameRef.current) window.cancelAnimationFrame(positionFrameRef.current)
    gsap.killTweensOf([previewRef.current, surfaceRef.current, contentRef.current])
  }, [])

  const preview = displayedItem && createPortal(
    <aside
      id={PREVIEW_ID}
      ref={previewRef}
      className={`menu-dish-preview ${visible ? 'is-open' : ''}`}
      data-menu-preview
      role="region"
      aria-live="polite"
      aria-label={`${displayedItem.name} preview`}
      onPointerEnter={cancelClose}
      onPointerLeave={scheduleClose}
    >
      <div ref={surfaceRef} className="menu-dish-preview-surface" data-menu-preview-surface>
        <div ref={contentRef} className="menu-dish-preview-content">
          <div className="menu-dish-preview-media">
            {displayedItem.image ? (
              <img src={displayedItem.image} alt={displayedItem.imageAlt || displayedItem.name} />
            ) : (
              <div className="menu-dish-preview-placeholder" aria-label={labels.photoPending}>
                <span>{labels.photoPending}</span>
                <strong>{displayedItem.name}</strong>
              </div>
            )}
          </div>
          <div className="menu-dish-preview-copy">
            <h4>{displayedItem.name}</h4>
            <p>{displayedItem.previewDescription}</p>
            {displayedItem.accompaniments?.length > 0 && (
              <div className="menu-dish-preview-with">
                <span>{labels.withLabel}</span>
                <p>{displayedItem.accompaniments.join(' · ')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>,
    document.body,
  )

  return (
    <>
      <div className="menu-track" data-menu-track>
        {groups.map((group) => (
          <article className="menu-panel" key={group.title}>
            <h3>{group.title}</h3>
            <div className="menu-panel-items">
              {group.items.map((item) => (
                <button
                  type="button"
                  className="menu-row"
                  key={item.name}
                  data-menu-row
                  data-active={activeName === item.name ? 'true' : 'false'}
                  aria-controls={PREVIEW_ID}
                  aria-expanded={visible && activeName === item.name}
                  onPointerEnter={(event) => activateItem(item, event.currentTarget)}
                  onPointerLeave={scheduleClose}
                  onFocus={(event) => activateItem(item, event.currentTarget)}
                  onBlur={scheduleClose}
                  onClick={(event) => activateItem(item, event.currentTarget)}
                >
                  <span className="menu-row-copy"><strong>{item.name}</strong><small>{item.shortDescription}</small></span>
                  <span className="menu-row-price">{item.price}</span>
                </button>
              ))}
            </div>
          </article>
        ))}
      </div>
      {preview}
    </>
  )
}
