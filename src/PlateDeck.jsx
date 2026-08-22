import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { unsplashSrcSet } from './image-performance.jsx'

const wrap = (value, length) => ((value % length) + length) % length

const PLATE_NUTRITION = [
  { calories: '640', protein: '46g', carbs: '38g', fat: '32g', sodium: '980mg' },
  { calories: '360', protein: '32g', carbs: '34g', fat: '10g', sodium: '820mg' },
  { calories: '610', protein: '41g', carbs: '52g', fat: '25g', sodium: '1050mg' },
  { calories: '520', protein: '22g', carbs: '48g', fat: '27g', sodium: '760mg' },
  { calories: '490', protein: '29g', carbs: '46g', fat: '22g', sodium: '880mg' },
  { calories: '430', protein: '36g', carbs: '24g', fat: '21g', sodium: '940mg' },
  { calories: '510', protein: '39g', carbs: '31g', fat: '25g', sodium: '720mg' },
  { calories: '390', protein: '7g', carbs: '48g', fat: '19g', sodium: '230mg' },
]

function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    && !document.documentElement.classList.contains('motion-forced')
}

function PlateDetailsModal({ dish, nutrition, labels, onClose }) {
  const dialogRef = useRef(null)
  const panelRef = useRef(null)
  const closeRef = useRef(null)
  const modalCursorRef = useRef(null)
  const closingRef = useRef(false)
  const previousFocusRef = useRef(null)
  const entranceTimelineRef = useRef(null)

  const finishClose = () => {
    const dialog = dialogRef.current
    if (dialog?.open && typeof dialog.close === 'function') dialog.close()
    onClose()
  }

  const close = () => {
    if (closingRef.current) return
    closingRef.current = true

    if (prefersReducedMotion()) {
      finishClose()
      return
    }

    entranceTimelineRef.current?.kill()
    gsap.to(panelRef.current, {
      y: 20,
      scale: 0.985,
      opacity: 0,
      duration: 0.28,
      ease: 'power2.in',
      onComplete: finishClose,
    })
  }

  useLayoutEffect(() => {
    const dialog = dialogRef.current
    const panel = panelRef.current
    if (!dialog || !panel) return undefined

    previousFocusRef.current = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    if (typeof dialog.showModal === 'function') {
      if (!dialog.open) dialog.showModal()
    } else {
      dialog.setAttribute('open', '')
    }

    const modalCursor = modalCursorRef.current
    const customCursorActive = Boolean(modalCursor && dialog.closest('.cursor-ready'))
    let modalCursorVisible = false
    let xTo
    let yTo

    const moveModalCursor = (event) => {
      if (!customCursorActive) return
      xTo(event.clientX)
      yTo(event.clientY)
      if (!modalCursorVisible) {
        modalCursorVisible = true
        gsap.to(modalCursor, { autoAlpha: 1, duration: 0.18, overwrite: 'auto' })
      }
    }
    const hideModalCursor = () => {
      if (!customCursorActive) return
      modalCursorVisible = false
      gsap.to(modalCursor, { autoAlpha: 0, duration: 0.18, overwrite: 'auto' })
    }

    if (customCursorActive) {
      xTo = gsap.quickTo(modalCursor, 'x', { duration: 0.45, ease: 'power4.out' })
      yTo = gsap.quickTo(modalCursor, 'y', { duration: 0.45, ease: 'power4.out' })
      dialog.addEventListener('pointermove', moveModalCursor, { passive: true })
      document.documentElement.addEventListener('mouseleave', hideModalCursor)
    }

    const mediaImage = panel.querySelector('.plate-modal-media img')
    const copyElements = [...panel.querySelectorAll('.plate-modal-copy > *')]
    const modalTimeline = gsap.timeline({ paused: true, defaults: { overwrite: 'auto' } })
    entranceTimelineRef.current = modalTimeline

    if (!prefersReducedMotion()) {
      modalTimeline
        .fromTo(dialog,
          { backgroundColor: 'rgba(10, 15, 12, 0)' },
          {
            backgroundColor: 'rgba(10, 15, 12, .72)',
            duration: 0.52,
            ease: 'power2.out',
          },
          0,
        )
        .fromTo(panel,
          { y: 44, scale: 0.97, opacity: 0 },
          {
            y: 0,
            scale: 1,
            opacity: 1,
            duration: 0.78,
            ease: 'power4.out',
            clearProps: 'transform,opacity',
          },
          0.04,
        )
        .fromTo(mediaImage,
          { scale: 1.055 },
          {
            scale: 1,
            duration: 1.05,
            ease: 'power3.out',
            clearProps: 'transform',
          },
          0.08,
        )
        .fromTo(copyElements,
          { y: 16, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.56,
            stagger: 0.055,
            ease: 'power3.out',
            clearProps: 'transform,opacity',
          },
          0.2,
        )
        .fromTo(closeRef.current,
          { scale: 0.86, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.42,
            ease: 'back.out(1.35)',
            clearProps: 'transform,opacity',
          },
          0.3,
        )

      modalTimeline.play(0)
    }

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        close()
      }
    }
    const onCancel = (event) => {
      event.preventDefault()
      close()
    }

    document.addEventListener('keydown', onKeyDown)
    dialog.addEventListener('cancel', onCancel)
    requestAnimationFrame(() => closeRef.current?.focus())

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      dialog.removeEventListener('cancel', onCancel)
      dialog.removeEventListener('pointermove', moveModalCursor)
      document.documentElement.removeEventListener('mouseleave', hideModalCursor)
      document.body.style.overflow = previousOverflow
      modalTimeline.kill()
      entranceTimelineRef.current = null
      gsap.killTweensOf([dialog, panel, mediaImage, ...copyElements, closeRef.current, modalCursor].filter(Boolean))
      if (dialog.open && typeof dialog.close === 'function') dialog.close()
      previousFocusRef.current?.focus?.()
    }
  }, [])

  return (
    <dialog
      ref={dialogRef}
      className="plate-modal-shell"
      aria-modal="true"
      aria-labelledby="plate-modal-title"
      data-plate-modal
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) close()
      }}
    >
      <section ref={panelRef} className="plate-modal" role="document">
        <button
          ref={closeRef}
          type="button"
          className="plate-modal-close"
          aria-label={labels.close}
          onClick={close}
        >
          <span aria-hidden="true">×</span>
        </button>

        <div className="plate-modal-media">
          <img width="1200" height="800" src={dish.image} srcSet={unsplashSrcSet(dish.image)} sizes="(min-width: 900px) 42vw, calc(100vw - 40px)" loading="eager" decoding="async" alt={dish.alt} />
          <span>{labels.estimateBadge}</span>
        </div>

        <div className="plate-modal-copy">
          <p className="plate-modal-kicker">{labels.detailsKicker}</p>
          <h2 id="plate-modal-title">{dish.name}</h2>
          <p className="plate-modal-description">{dish.detail}</p>

          <div className="plate-nutrition-grid" aria-label={labels.nutritionLabel}>
            <div><span>{labels.calories}</span><strong>{nutrition.calories}</strong><small>kcal</small></div>
            <div><span>{labels.protein}</span><strong>{nutrition.protein}</strong></div>
            <div><span>{labels.carbs}</span><strong>{nutrition.carbs}</strong></div>
            <div><span>{labels.fat}</span><strong>{nutrition.fat}</strong></div>
            <div><span>{labels.sodium}</span><strong>{nutrition.sodium}</strong></div>
          </div>

          <p className="plate-modal-note">{labels.estimatedNote}</p>
        </div>
      </section>
      <div ref={modalCursorRef} className="plate-modal-cursor" data-plate-modal-cursor aria-hidden="true" />
    </dialog>
  )
}

export default function PlateDeck({ dishes, labels, language }) {
  const deckRef = useRef(null)
  const dragRef = useRef({ pointerId: null, startX: 0, deltaX: 0, didDrag: false, locked: false })
  const [activeIndex, setActiveIndex] = useState(0)
  const [selectedIndex, setSelectedIndex] = useState(null)

  const visibleDishes = useMemo(
    () => [0, 1, 2].map((offset) => {
      const index = wrap(activeIndex + offset, dishes.length)
      return { dish: dishes[index], index }
    }),
    [activeIndex, dishes],
  )

  const selectedDish = selectedIndex === null ? null : dishes[selectedIndex]

  useLayoutEffect(() => {
    const deck = deckRef.current
    if (!deck) return undefined

    const cards = [...deck.querySelectorAll('[data-plate-card]')]
    if (cards.length < 3) return undefined

    gsap.killTweensOf(cards)
    gsap.set(cards[0], { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1, zIndex: 3 })
    gsap.set(cards[1], { x: 0, y: 20, rotation: 1.25, scale: 0.965, opacity: 0.94, zIndex: 2 })
    gsap.set(cards[2], { x: 0, y: 40, rotation: -1.1, scale: 0.93, opacity: 0.72, zIndex: 1 })

    return () => gsap.killTweensOf(cards)
  }, [activeIndex, language])

  const resetStack = () => {
    const cards = [...(deckRef.current?.querySelectorAll('[data-plate-card]') || [])]
    if (cards.length < 3) return

    gsap.to(cards[0], { x: 0, y: 0, rotation: 0, scale: 1, duration: 0.58, ease: 'power4.out' })
    gsap.to(cards[1], { y: 20, rotation: 1.25, scale: 0.965, opacity: 0.94, duration: 0.58, ease: 'power4.out' })
    gsap.to(cards[2], { y: 40, rotation: -1.1, scale: 0.93, opacity: 0.72, duration: 0.58, ease: 'power4.out' })
  }

  const advance = (step, exitDirection = step > 0 ? 1 : -1) => {
    const state = dragRef.current
    if (state.locked || dishes.length < 2) return

    const deck = deckRef.current
    const cards = [...(deck?.querySelectorAll('[data-plate-card]') || [])]
    if (cards.length < 3) return

    state.locked = true
    const duration = prefersReducedMotion() ? 0 : 0.62
    const distance = Math.max(deck?.clientWidth || 0, 520) * 1.08

    gsap.timeline({
      defaults: { overwrite: 'auto' },
      onComplete: () => {
        state.pointerId = null
        state.deltaX = 0
        state.locked = false
        setActiveIndex((current) => wrap(current + step, dishes.length))
      },
    })
      .to(cards[0], {
        x: exitDirection * distance,
        y: -18,
        rotation: exitDirection * 11,
        opacity: 0,
        duration: duration * 0.88,
        ease: 'power3.in',
      }, 0)
      .to(cards[1], {
        y: 0,
        rotation: 0,
        scale: 1,
        opacity: 1,
        duration,
        ease: 'power4.out',
      }, 0.04)
      .to(cards[2], {
        y: 20,
        rotation: 1.25,
        scale: 0.965,
        opacity: 0.94,
        duration,
        ease: 'power4.out',
      }, 0.04)
  }

  const handlePointerDown = (event) => {
    if (dragRef.current.locked) return
    dragRef.current.pointerId = event.pointerId
    dragRef.current.startX = event.clientX
    dragRef.current.deltaX = 0
    dragRef.current.didDrag = false
  }

  const handlePointerMove = (event) => {
    const state = dragRef.current
    if (state.pointerId !== event.pointerId || state.locked) return

    const cards = [...(deckRef.current?.querySelectorAll('[data-plate-card]') || [])]
    if (cards.length < 3) return

    const deltaX = event.clientX - state.startX
    state.deltaX = deltaX
    if (Math.abs(deltaX) > 6 && !state.didDrag) {
      state.didDrag = true
      event.currentTarget.setPointerCapture?.(event.pointerId)
      event.currentTarget.classList.add('is-dragging')
    }
    const progress = Math.min(Math.abs(deltaX) / 150, 1)

    gsap.set(cards[0], { x: deltaX, rotation: deltaX / 24, cursor: 'grabbing' })
    gsap.set(cards[1], {
      y: 20 * (1 - progress),
      rotation: 1.25 * (1 - progress),
      scale: 0.965 + (0.035 * progress),
      opacity: 0.94 + (0.06 * progress),
    })
    gsap.set(cards[2], {
      y: 40 - (20 * progress),
      rotation: -1.1 + (2.35 * progress),
      scale: 0.93 + (0.035 * progress),
      opacity: 0.72 + (0.22 * progress),
    })
  }

  const handlePointerEnd = (event) => {
    const state = dragRef.current
    if (state.pointerId !== event.pointerId || state.locked) return

    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture?.(event.pointerId)
    }
    event.currentTarget.classList.remove('is-dragging')

    const deltaX = state.deltaX
    state.pointerId = null
    state.deltaX = 0

    if (Math.abs(deltaX) >= 86) {
      const step = deltaX < 0 ? 1 : -1
      const exitDirection = deltaX < 0 ? -1 : 1
      advance(step, exitDirection)
      return
    }

    resetStack()
  }

  const handleImageClick = (event, index) => {
    if (dragRef.current.didDrag || dragRef.current.locked) {
      event.preventDefault()
      return
    }
    setSelectedIndex(index)
  }

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      advance(1, 1)
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      advance(-1, -1)
    }
  }

  return (
    <>
      <div
        ref={deckRef}
        className="plate-deck"
        data-plate-deck
        data-loop="true"
        role="region"
        aria-label={labels.carouselLabel}
        tabIndex="0"
        onKeyDown={handleKeyDown}
      >
        <div className="plate-deck-stage">
          {visibleDishes.map(({ dish, index }, position) => (
            <article
              className={`plate-card plate-card-${position}`}
              data-plate-card={position === 0 ? 'active' : 'queued'}
              aria-hidden={position === 0 ? undefined : 'true'}
              key={`${language}-${activeIndex}-${position}-${dish.name}`}
              onPointerDown={position === 0 ? handlePointerDown : undefined}
              onPointerMove={position === 0 ? handlePointerMove : undefined}
              onPointerUp={position === 0 ? handlePointerEnd : undefined}
              onPointerCancel={position === 0 ? handlePointerEnd : undefined}
            >
              {position === 0 ? (
                <button
                  type="button"
                  className="plate-card-media plate-card-media-button"
                  aria-label={`${labels.viewDetails} ${dish.name}`}
                  onClick={(event) => handleImageClick(event, index)}
                >
                  <img width="1200" height="800" src={dish.image} srcSet={unsplashSrcSet(dish.image)} sizes="(min-width: 900px) 42vw, calc(100vw - 40px)" loading="lazy" decoding="async" alt={dish.alt} draggable="false" />
                  <span className="plate-card-media-cue" aria-hidden="true">{labels.detailsCue}</span>
                </button>
              ) : (
                <div className="plate-card-media">
                  <img width="1200" height="800" src={dish.image} srcSet={unsplashSrcSet(dish.image)} sizes="(min-width: 900px) 42vw, calc(100vw - 40px)" loading="lazy" decoding="async" alt="" draggable="false" />
                </div>
              )}
              <div className="plate-card-copy">
                <div className="plate-card-topline">
                  <span>{String(index + 1).padStart(2, '0')} / {String(dishes.length).padStart(2, '0')}</span>
                  <strong>{dish.price}</strong>
                </div>
                <h3>{dish.name}</h3>
                <p>{dish.detail}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="plate-deck-footer">
          <p>{labels.swipeHint}</p>
          <div className="plate-deck-controls">
            <button
              type="button"
              className="plate-deck-arrow"
              aria-label={labels.previous}
              data-exit-direction="left"
              onClick={() => advance(-1, -1)}
            >←</button>
            <button
              type="button"
              className="plate-deck-arrow"
              aria-label={labels.next}
              data-exit-direction="right"
              onClick={() => advance(1, 1)}
            >→</button>
          </div>
        </div>
      </div>

      {selectedDish && (
        <PlateDetailsModal
          dish={selectedDish}
          nutrition={PLATE_NUTRITION[selectedIndex]}
          labels={labels}
          onClose={() => setSelectedIndex(null)}
        />
      )}
    </>
  )
}
