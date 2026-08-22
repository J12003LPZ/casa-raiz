import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { unsplashSrcSet } from './image-performance.jsx'

function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    && !document.documentElement.classList.contains('motion-forced')
}

export default function DrinksShowcase({ drinks, label }) {
  const stageRef = useRef(null)
  const imageRefs = useRef([])
  const previousIndexRef = useRef(0)
  const initializedRef = useRef(false)
  const [activeIndex, setActiveIndex] = useState(0)

  useLayoutEffect(() => {
    const images = imageRefs.current.filter(Boolean)
    if (!images.length) return undefined

    const active = images[activeIndex]
    const previous = images[previousIndexRef.current]
    if (!active) return undefined

    gsap.killTweensOf(images)

    if (!initializedRef.current || prefersReducedMotion()) {
      images.forEach((image, index) => {
        gsap.set(image, {
          autoAlpha: index === activeIndex ? 1 : 0,
          scale: 1,
          clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
          zIndex: index === activeIndex ? 2 : 1,
        })
      })
      initializedRef.current = true
      previousIndexRef.current = activeIndex
      return () => gsap.killTweensOf(images)
    }

    gsap.set(active, {
      autoAlpha: 1,
      scale: 1.055,
      clipPath: 'polygon(50% 0%, 50% 0%, 50% 100%, 50% 100%)',
      zIndex: 3,
    })

    if (previous && previous !== active) {
      gsap.set(previous, { autoAlpha: 1, zIndex: 2 })
    }

    const timeline = gsap.timeline({ defaults: { overwrite: 'auto' } })
      .to(active, {
        clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
        scale: 1,
        duration: 0.86,
        ease: 'power4.out',
      }, 0)

    if (previous && previous !== active) {
      timeline.to(previous, {
        autoAlpha: 0,
        scale: 1.025,
        duration: 0.58,
        ease: 'power2.out',
      }, 0.08)
    }

    timeline.add(() => {
      images.forEach((image, index) => {
        if (index !== activeIndex) gsap.set(image, { autoAlpha: 0, zIndex: 1, scale: 1 })
      })
      gsap.set(active, { zIndex: 2, clearProps: 'clipPath,transform' })
    })

    previousIndexRef.current = activeIndex

    return () => timeline.kill()
  }, [activeIndex, drinks])

  const selectDrink = (index) => {
    if (index === activeIndex) return
    previousIndexRef.current = activeIndex
    setActiveIndex(index)
  }

  return (
    <div className="drinks-showcase" data-drinks-showcase>
      <div className="drink-selector" role="group" aria-label={label}>
        {drinks.map((drink, index) => {
          const active = index === activeIndex
          return (
            <button
              type="button"
              className="drink-option"
              key={drink.name}
              data-active={active ? 'true' : 'false'}
              aria-pressed={active}
              onMouseEnter={() => selectDrink(index)}
              onFocus={() => selectDrink(index)}
              onClick={() => selectDrink(index)}
            >
              <span className="drink-option-number">{String(index + 1).padStart(2, '0')}</span>
              <span className="drink-option-copy">
                <strong>{drink.name}</strong>
                <small>{drink.detail}</small>
              </span>
              <span className="drink-option-arrow" aria-hidden="true">↗</span>
            </button>
          )
        })}
      </div>

      <div className="drink-stage" ref={stageRef} aria-live="polite">
        {drinks.map((drink, index) => (
          <figure className="drink-image-layer" key={`${drink.name}-${drink.image}`}>
            <img
              ref={(node) => { imageRefs.current[index] = node }}
              src={drink.image}
              alt={drink.alt}
              data-drink-image={index === activeIndex ? 'active' : 'inactive'}
              srcSet={unsplashSrcSet(drink.image)}
              sizes="(min-width: 900px) 40vw, calc(100vw - 32px)"
              loading='lazy'
              decoding="async"
            />
          </figure>
        ))}
        <div className="drink-stage-meta" aria-hidden="true">
          <span>{String(activeIndex + 1).padStart(2, '0')}</span>
          <span>{drinks[activeIndex].name}</span>
        </div>
      </div>
    </div>
  )
}
