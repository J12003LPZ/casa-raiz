import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CustomEase } from 'gsap/CustomEase'
import { SplitText } from 'gsap/SplitText'
import Lenis from 'lenis'
import { motion, registerMotionEases } from './motion.js'
import { getInitialLanguage, LANGUAGE_STORAGE_KEY, translations } from './i18n.jsx'
import PlateDeck from './PlateDeck.jsx'
import DrinksShowcase from './DrinksShowcase.jsx'
import MenuHoverPreview from './MenuHoverPreview.jsx'
import { unsplashSrcSet } from './image-performance.jsx'

gsap.registerPlugin(ScrollTrigger, SplitText)
registerMotionEases(gsap, CustomEase)

function LanguageSwitch({ language, labels, onChange, disabled = false, className = '' }) {
  return (
    <div className={`language-switch ${className}`} data-language-switch data-language={language} role="group" aria-label={labels.label}>
      <span className="language-thumb" aria-hidden="true" />
      <button type="button" className="language-option" aria-label={labels.english} aria-pressed={language === 'en'} disabled={disabled} onClick={() => onChange('en')}>EN</button>
      <button type="button" className="language-option" aria-label={labels.spanish} aria-pressed={language === 'es'} disabled={disabled} onClick={() => onChange('es')}>ES</button>
    </div>
  )
}

function getLanguageCopyTargets(node) {
  if (!node) return []

  return [...node.querySelectorAll('a, button, p, h1, h2, h3, span, strong, small, label, blockquote')]
    .filter((element) => !element.closest('[data-language-switch]'))
    .filter((element) => !element.closest('[aria-hidden="true"]'))
    .filter((element) => [...element.childNodes].some((child) => child.nodeType === 3 && child.textContent?.trim()))
}

function createScrollRefreshScheduler() {
  let frame = null

  const schedule = () => {
    if (frame) return
    frame = window.requestAnimationFrame(() => {
      frame = null
      ScrollTrigger.refresh()
    })
  }

  const cancel = () => {
    if (!frame) return
    window.cancelAnimationFrame(frame)
    frame = null
  }

  return { schedule, cancel }
}

function createNativeScroller(reduceMotion) {
  let nativeScrollFrame = null
  let restoreNativeScrollBehavior = null

  const stopNativeScroll = () => {
    if (nativeScrollFrame) window.cancelAnimationFrame(nativeScrollFrame)
    nativeScrollFrame = null
    restoreNativeScrollBehavior?.()
    restoreNativeScrollBehavior = null
  }

  const scrollNativeTo = (element) => {
    stopNativeScroll()
    const rootElement = document.documentElement
    const previousScrollBehavior = rootElement.style.scrollBehavior
    rootElement.classList.add('native-scroll-active')
      rootElement.style.scrollBehavior = 'auto'
    restoreNativeScrollBehavior = () => {
      rootElement.classList.remove('native-scroll-active')
        rootElement.style.scrollBehavior = previousScrollBehavior
    }

    const targetTop = Math.max(0, element.getBoundingClientRect().top + window.scrollY - 76)
    if (reduceMotion) {
      window.scrollTo(0, targetTop)
      stopNativeScroll()
      return
    }

    const startTop = window.scrollY
    const distance = targetTop - startTop
    const startedAt = performance.now()
    const duration = 1000
    const step = (now) => {
      const progress = Math.min(1, (now - startedAt) / duration)
      const eased = 1 - Math.pow(1 - progress, 4)
      window.scrollTo(0, startTop + distance * eased)
      if (progress < 1) {
        nativeScrollFrame = window.requestAnimationFrame(step)
      } else {
        nativeScrollFrame = null
        restoreNativeScrollBehavior?.()
        restoreNativeScrollBehavior = null
      }
    }
    nativeScrollFrame = window.requestAnimationFrame(step)
  }

  return { scrollNativeTo, stopNativeScroll }
}

function setupResponsiveMotion(node, forceMotion) {
  const media = gsap.matchMedia()
  const desktopMotionQuery = forceMotion
    ? '(min-width: 900px)'
    : '(min-width: 900px) and (prefers-reduced-motion: no-preference)'
  const cursorMotionQuery = forceMotion
    ? '(hover: hover) and (pointer: fine)'
    : '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)'

  media.add(desktopMotionQuery, () => {
    gsap.utils.toArray('[data-parallax-media]').forEach((frame) => {
      const image = frame.querySelector('img')
      if (!image) return
      gsap.fromTo(
        image,
        { yPercent: -5, scale: 1.065 },
        {
          yPercent: 5,
          scale: 1.065,
          ease: motion.ease.scrub,
          scrollTrigger: {
            trigger: frame,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        },
      )
    })

    const menu = node.querySelector('#menu')
    const viewport = node.querySelector('[data-menu-viewport]')
    const track = node.querySelector('[data-menu-track]')
    if (menu && viewport && track) {
      const distance = () => Math.max(0, track.scrollWidth - viewport.clientWidth)
      gsap.to(track, {
        x: () => -distance(),
        ease: motion.ease.scrub,
        scrollTrigger: {
          trigger: menu,
          start: 'top top',
          end: () => `+=${Math.max(distance() * 1.3, window.innerHeight * 1.45)}`,
          pin: true,
          scrub: 0.9,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })
    }

    const galleryCells = gsap.utils.toArray('.gallery-cell')
    if (galleryCells.length) {
      gsap.fromTo(
        galleryCells,
        {
          y: (index) => index % 2 === 0 ? 96 : 142,
          clipPath: 'inset(0 0 100% 0)',
          scale: 0.96,
        },
        {
          y: 0,
          clipPath: 'inset(0 0 0% 0)',
          scale: 1,
          stagger: motion.stagger.text,
          ease: motion.ease.scrub,
          scrollTrigger: {
            trigger: '.gallery-section',
            start: 'top 92%',
            end: 'top 28%',
            scrub: 0.9,
          },
        },
      )
    }

    const velocityTargets = gsap.utils.toArray('.experience-media, .gallery-cell')
    const skewTo = velocityTargets.map((target) => gsap.quickTo(target, 'skewY', {
      duration: motion.duration.base,
      ease: motion.ease.cubicOut,
    }))
    const settle = gsap.delayedCall(0.08, () => skewTo.forEach((set) => set(0))).pause()
    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        const skew = gsap.utils.clamp(-3.5, 3.5, -self.getVelocity() / 850)
        skewTo.forEach((set) => set(skew))
        settle.restart(true)
      },
    })
  })

  media.add(cursorMotionQuery, () => {
    const cursor = node.querySelector('[data-cursor]')
    if (!cursor) return undefined

    const xTo = gsap.quickTo(cursor, 'x', { duration: motion.duration.base, ease: motion.ease.quintOut })
    const yTo = gsap.quickTo(cursor, 'y', { duration: motion.duration.base, ease: motion.ease.quintOut })
    let visible = false

    const moveCursor = (event) => {
      xTo(event.clientX)
      yTo(event.clientY)
      if (!visible) {
        visible = true
        gsap.to(cursor, { autoAlpha: 1, duration: motion.duration.fast })
      }
    }
    const hideCursor = () => {
      visible = false
      gsap.to(cursor, { autoAlpha: 0, duration: motion.duration.fast })
    }

    const buttonCleanups = gsap.utils.toArray('.button').map((button) => {
      const label = button.querySelector('.button-label')
      if (!label) return () => {}

      button.dataset.ctaMotion = 'ready'
      gsap.set(button, { '--button-sweep-scale': 0, transformOrigin: 'center center' })

      const buttonXTo = gsap.quickTo(button, 'x', { duration: 0.46, ease: 'power3.out' })
      const buttonYTo = gsap.quickTo(button, 'y', { duration: 0.46, ease: 'power3.out' })
      const labelXTo = gsap.quickTo(label, 'x', { duration: 0.52, ease: 'power3.out' })
      const labelYTo = gsap.quickTo(label, 'y', { duration: 0.52, ease: 'power3.out' })
      let hovering = false

      const animateSurface = (scale, sweepScale) => {
        gsap.to(button, {
          scale,
          '--button-sweep-scale': sweepScale,
          duration: 0.46,
          ease: 'power3.out',
          overwrite: 'auto',
        })
      }
      const enterButton = () => {
        hovering = true
        animateSurface(1.025, 1)
      }
      const moveButton = (event) => {
        const bounds = button.getBoundingClientRect()
        const centerX = bounds.left + bounds.width / 2
        const centerY = bounds.top + bounds.height / 2
        const offsetX = gsap.utils.clamp(-6, 6, (event.clientX - centerX) * 0.12)
        const offsetY = gsap.utils.clamp(-4, 4, (event.clientY - centerY) * 0.12)

        buttonXTo(offsetX)
        buttonYTo(offsetY - 1.5)
        labelXTo(offsetX * 0.36)
        labelYTo(offsetY * 0.28)
      }
      const leaveButton = () => {
        hovering = false
        buttonXTo(0)
        buttonYTo(0)
        labelXTo(0)
        labelYTo(0)
        animateSurface(1, 0)
      }
      const focusButton = () => {
        buttonYTo(-2)
        gsap.to(button, {
          scale: 1.02,
          '--button-sweep-scale': 1,
          duration: 0.4,
          ease: 'power3.out',
          overwrite: 'auto',
        })
      }
      const blurButton = () => {
        if (!hovering) leaveButton()
      }
      const pressButton = () => {
        gsap.to(button, { scale: 0.975, duration: 0.12, ease: 'power2.out', overwrite: 'auto' })
      }
      const releaseButton = () => {
        gsap.to(button, {
          scale: hovering ? 1.025 : 1,
          duration: 0.32,
          ease: 'power3.out',
          overwrite: 'auto',
        })
      }

      button.addEventListener('pointerenter', enterButton)
      button.addEventListener('pointermove', moveButton)
      button.addEventListener('pointerleave', leaveButton)
      button.addEventListener('focus', focusButton)
      button.addEventListener('blur', blurButton)
      button.addEventListener('pointerdown', pressButton)
      button.addEventListener('pointerup', releaseButton)
      button.addEventListener('pointercancel', releaseButton)

      return () => {
        button.removeEventListener('pointerenter', enterButton)
        button.removeEventListener('pointermove', moveButton)
        button.removeEventListener('pointerleave', leaveButton)
        button.removeEventListener('focus', focusButton)
        button.removeEventListener('blur', blurButton)
        button.removeEventListener('pointerdown', pressButton)
        button.removeEventListener('pointerup', releaseButton)
        button.removeEventListener('pointercancel', releaseButton)
        gsap.killTweensOf([button, label])
        delete button.dataset.ctaMotion
      }
    })

    node.classList.add('cursor-ready')
    window.addEventListener('pointermove', moveCursor, { passive: true })
    document.documentElement.addEventListener('mouseleave', hideCursor)

    return () => {
      node.classList.remove('cursor-ready')
      window.removeEventListener('pointermove', moveCursor)
      document.documentElement.removeEventListener('mouseleave', hideCursor)
      buttonCleanups.forEach((cleanup) => cleanup())
    }
  })

  return () => media.revert()
}

export default function App() {
  const root = useRef(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [reservationShown, setReservationShown] = useState(false)
  const [newsletterShown, setNewsletterShown] = useState(false)
  const [language, setLanguage] = useState(getInitialLanguage)
  const [languageIntent, setLanguageIntent] = useState(null)
  const [languageTransitioning, setLanguageTransitioning] = useState(false)
  const languageTransitioningRef = useRef(false)
  const c = translations[language]
  const visualLanguage = languageIntent ?? language

  const changeLanguage = (nextLanguage) => {
    if (nextLanguage === language || languageTransitioningRef.current) return

    const node = root.current
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      && !document.documentElement.classList.contains('motion-forced')

    if (!node || reduceMotion) {
      setLanguage(nextLanguage)
      return
    }

    languageTransitioningRef.current = true
    setLanguageTransitioning(true)
    setLanguageIntent(nextLanguage)
    node.dataset.languageTransition = 'out'

    const outgoing = getLanguageCopyTargets(node)
    gsap.killTweensOf(outgoing)
    gsap.to(outgoing, {
      y: -8,
      opacity: 0,
      filter: 'blur(3px)',
      duration: 0.34,
      ease: 'power2.in',
      overwrite: 'auto',
      onComplete: () => {
        setLanguage(nextLanguage)
        window.requestAnimationFrame(() => {
          const incoming = getLanguageCopyTargets(node)
          gsap.set(incoming, { y: 8, opacity: 0, filter: 'blur(3px)' })
          node.dataset.languageTransition = 'in'
          gsap.to(incoming, {
            y: 0,
            opacity: 1,
            filter: 'blur(0px)',
            duration: 0.52,
            stagger: { each: 0.0015, from: 'start' },
            ease: 'power3.out',
            overwrite: 'auto',
            clearProps: 'transform,opacity,visibility,filter',
            onComplete: () => {
              delete node.dataset.languageTransition
              languageTransitioningRef.current = false
              setLanguageIntent(null)
              setLanguageTransitioning(false)
              ScrollTrigger.refresh()
            },
          })
        })
      },
    })
  }

  useLayoutEffect(() => {
    document.documentElement.lang = language
    window.localStorage?.setItem(LANGUAGE_STORAGE_KEY, language)
    root.current?.setAttribute('data-language', language)
    const refreshFrame = window.requestAnimationFrame?.(() => ScrollTrigger.refresh())
    return () => {
      if (refreshFrame) window.cancelAnimationFrame?.(refreshFrame)
    }
  }, [language])

  useLayoutEffect(() => {
    const node = root.current
    if (!node) return undefined

    const motionSupported = typeof window.matchMedia === 'function' && typeof window.ResizeObserver !== 'undefined'
    const systemReduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const forceMotion = new URLSearchParams(window.location.search).get('motion') === 'full'
    const reduceMotion = systemReduceMotion && !forceMotion
    const desktopViewport = window.matchMedia('(min-width: 900px)').matches
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const useLenis = desktopViewport && finePointer
    const { schedule: scheduleScrollRefresh, cancel: cancelScrollRefresh } = createScrollRefreshScheduler()

    if (forceMotion) document.documentElement.classList.add('motion-forced')
    if (!motionSupported || reduceMotion) {
      node.dataset.motionStatus = reduceMotion ? 'reduced' : 'unsupported'
      node.classList.toggle('reduce-motion', Boolean(reduceMotion))
      return () => document.documentElement.classList.remove('motion-forced')
    }

    node.dataset.motionStatus = 'booting'
    node.dataset.motionPreference = forceMotion ? 'full' : 'system'

    const lenis = useLenis ? new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false,
    })
    : null
    lenis?.on('scroll', ScrollTrigger.update)
    const raf = (time) => lenis?.raf(time * 1000)
    if (lenis) gsap.ticker.add(raf)
    if (lenis) gsap.ticker.lagSmoothing(0)

    const { scrollNativeTo, stopNativeScroll } = createNativeScroller(reduceMotion)
    const motionObservers = []
    const deferredContexts = []
    const observeMotionTarget = (target, setup, rootMargin = '80% 0px') => {
      if (!target) return
      let activated = false
      const activate = () => {
        if (activated) return
        activated = true
        deferredContexts.push(gsap.context(setup, node))
      }
      if (typeof window.IntersectionObserver === 'undefined') {
        activate()
        return
      }
      const observer = new IntersectionObserver((entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        observer.disconnect()
        activate()
        scheduleScrollRefresh()
      }, { rootMargin, threshold: 0.01 })
      observer.observe(target)
      motionObservers.push(observer)
    }

    const context = gsap.context(() => {
      gsap.set('.desktop-actions > *', { clearProps: 'transform,translate,rotate,scale' })
      const heroTimeline = gsap.timeline({ defaults: { ease: motion.ease.quintOut } })
      heroTimeline
        .from('.brand', { y: -18, autoAlpha: 0, duration: motion.duration.slow }, 0)
        .from('.desktop-nav a, .desktop-actions', { y: -14, autoAlpha: 0, duration: motion.duration.slow, stagger: motion.stagger.tight }, 0.08)
        .from('[data-hero-clip]', { clipPath: 'inset(0 100% 0 0)', duration: motion.duration.epic, ease: motion.ease.inOut }, 0)
        .from('[data-hero-image]', { scale: 1.18, duration: 2, ease: motion.ease.quintOut }, 0)
        .from('[data-hero-line] > span', { yPercent: 116, rotate: 2, transformOrigin: 'left bottom', duration: 1.25, stagger: motion.stagger.text, ease: motion.ease.expoOut }, 0.18)
        .from('[data-hero-detail]', { y: motion.travel.small, autoAlpha: 0, duration: motion.duration.reveal, stagger: motion.stagger.base, ease: motion.ease.cubicOut }, 0.48)

      const header = node.querySelector('#site-header')
      ScrollTrigger.create({ start: 24, end: 'max', onUpdate: (self) => header?.classList.toggle('header-scrolled', self.scroll() > 24) })
      gsap.to('[data-hero-image]', {
        yPercent: 8,
        scale: 1.055,
        ease: motion.ease.scrub,
        scrollTrigger: { trigger: '#home', start: 'top top', end: 'bottom top', scrub: 0.9 },
      })

      gsap.utils.toArray('[data-motion-reveal]').forEach((element) => {
        observeMotionTarget(element, () => {
          gsap.fromTo(element,
            { y: motion.travel.large, autoAlpha: 0.16, filter: 'blur(7px)' },
            { y: 0, autoAlpha: 1, filter: 'blur(0px)', ease: motion.ease.scrub, scrollTrigger: { trigger: element, start: 'top 92%', end: 'top 46%', scrub: 0.9 } },
          )
        })
      })

      const bar = node.querySelector('#bar')
      if (bar) {
        observeMotionTarget(bar, () => {
          gsap.fromTo(bar,
            { '--bar-bg': '#e6e9e3', '--bar-ink': '#172019', '--bar-muted': '#626b64', '--bar-line': 'rgba(23, 32, 25, 0.16)' },
            { '--bar-bg': '#26362c', '--bar-ink': '#f8f8f3', '--bar-muted': 'rgba(248, 248, 243, 0.66)', '--bar-line': 'rgba(248, 248, 243, 0.2)', ease: motion.ease.scrub, scrollTrigger: { trigger: bar, start: 'top 90%', end: 'top 38%', scrub: 0.8 } },
          )
        }, '100% 0px')
      }

      return setupResponsiveMotion(node, forceMotion)
    }, node)
    node.dataset.motionDeferred = 'ready'

    const internalLinks = [...node.querySelectorAll('a[href^="#"]')]
    const clickHandlers = internalLinks.map((link) => {
      const handler = (event) => {
        const target = link.getAttribute('href')
        if (!target || target === '#') return
        const element = document.querySelector(target)
        if (!element) return
        event.preventDefault()
        setMenuOpen(false)
        if (lenis) {
          lenis.scrollTo(element, { offset: -76, duration: 1.35, easing: (t) => 1 - Math.pow(1 - t, 4), lock: true })
        } else {
          scrollNativeTo(element)
        }
      }
      link.addEventListener('click', handler)
      return [link, handler]
    })

    const refresh = scheduleScrollRefresh
    document.fonts?.ready?.then(refresh)
    window.addEventListener('load', refresh, { once: true })
    node.dataset.motionStatus = 'ready'

    return () => {
      window.removeEventListener('load', refresh)
      cancelScrollRefresh()
      stopNativeScroll()
      clickHandlers.forEach(([link, handler]) => link.removeEventListener('click', handler))
      motionObservers.forEach((observer) => observer.disconnect())
      deferredContexts.forEach((deferredContext) => deferredContext.revert())
      context.revert()
      gsap.ticker.remove(raf)
      lenis?.destroy()
      document.documentElement.classList.remove('motion-forced')
      delete node.dataset.motionStatus
      delete node.dataset.motionPreference
      delete node.dataset.motionDeferred
    }
  }, [])



      useLayoutEffect(() => {
      const node = root.current
      if (!node || node.dataset.motionStatus !== 'ready') return undefined

      const refreshedSplits = []
      const animations = []
      const observers = []

      const initializeHeading = (heading) => {
        if (heading.querySelector('.split-line')) return

        const split = SplitText.create(heading, {
          type: 'lines',
          linesClass: 'split-line',
          mask: 'lines',
          aria: 'auto',
        })
        refreshedSplits.push(split)

        const alreadyEntered = heading.getBoundingClientRect().top <= window.innerHeight * 0.89
        if (alreadyEntered) {
          gsap.set(split.lines, { yPercent: 0, rotate: 0, autoAlpha: 1 })
          return
        }

        animations.push(gsap.from(split.lines, {
          yPercent: 116,
          rotate: 2,
          transformOrigin: 'left bottom',
          duration: 1.25,
          stagger: motion.stagger.text,
          ease: motion.ease.expoOut,
          scrollTrigger: {
            trigger: heading,
            start: 'top 89%',
            once: true,
          },
        }))
      }

      node.querySelectorAll('main h2').forEach((heading) => {
        if (typeof window.IntersectionObserver === 'undefined') {
          initializeHeading(heading)
          return
        }

        const observer = new IntersectionObserver((entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return
          observer.disconnect()
          initializeHeading(heading)
          ScrollTrigger.refresh()
        }, { rootMargin: '80% 0px', threshold: 0.01 })

        observer.observe(heading)
        observers.push(observer)
      })

      return () => {
        observers.forEach((observer) => observer.disconnect())
        animations.forEach((animation) => animation.kill())
        refreshedSplits.forEach((split) => {
          split.revert()
          split.kill()
        })
      }
    }, [language])

  return (
    <div ref={root} className="site-root" data-motion-root>
      <div className="grain" aria-hidden="true" />
      <div className="motion-cursor" data-cursor aria-hidden="true" />

      <header id="site-header" className="site-header">
        <div className="shell nav-wrap">
          <a href="#home" className="brand" aria-label={c.nav.homeLabel}>
            <span className="brand-main">Casa Raíz</span>
            <span className="brand-sub">{c.brandSubtitle}</span>
          </a>

          <nav className="desktop-nav" aria-label={c.nav.primaryLabel}>
            <a href="#menu">{c.nav.menu}</a>
            <a href="#story">{c.nav.story}</a>
            <a href="#events">{c.nav.events}</a>
            <a href="#visit">{c.nav.contact}</a>
          </nav>

          <div className="desktop-actions">
            <LanguageSwitch language={visualLanguage} labels={c.language} onChange={changeLanguage} disabled={languageTransitioning} />
            <a href="#reservations" className="button button-primary nav-reserve" data-nav-reserve><span className="button-label">{c.nav.reserve}</span></a>
          </div>

          <button
            className="mobile-toggle"
            aria-label={c.nav.mobileOpen}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
          </button>
        </div>

        <div id="mobile-menu" className={`mobile-menu ${menuOpen ? 'is-open' : 'hidden'}`}>
          <a href="#menu">{c.nav.menu}</a>
          <a href="#story">{c.nav.story}</a>
          <a href="#events">{c.nav.events}</a>
          <a href="#visit">{c.nav.contact}</a>
            <div className="mobile-language"><LanguageSwitch language={visualLanguage} labels={c.language} onChange={changeLanguage} disabled={languageTransitioning} /></div>
          <a href="#reservations" className="button button-primary"><span className="button-label">{c.nav.reserve}</span></a>
        </div>
      </header>

      <main>
        <section id="home" className="hero">
          <div className="hero-media" data-hero-media data-hero-panel="media" data-hero-clip>
            <img
              data-hero-image
              src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1600&q=90"
              srcSet={unsplashSrcSet('https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1600&q=90')}
              sizes="(min-width: 900px) 54vw, calc(100vw - 32px)"
              fetchPriority="high"
              loading="eager"
              decoding="async"
              alt={c.hero.imageAlt}
            />
            <div className="hero-scrim" />
          </div>

          <div className="shell hero-layout">
            <div className="hero-copy" data-hero-panel="copy">
              <p className="hero-kicker" data-hero-detail>{c.hero.kicker}</p>
              <h1 className="hero-title" aria-label={`${c.hero.line1} ${c.hero.line2}`}>
                <span className="line-mask" data-hero-line><span>{c.hero.line1}</span></span>
                <span className="line-mask" data-hero-line><span>{c.hero.line2}</span></span>
              </h1>
              <p className="hero-body" data-hero-detail>
                {c.hero.body}
              </p>
              <div className="hero-actions" data-hero-detail>
                <a href="#reservations" className="button button-primary"><span className="button-label">{c.nav.reserve}</span></a>
                <a href="#menu" className="button button-quiet"><span className="button-label">{c.hero.explore}</span></a>
              </div>
            </div>

            <div className="hero-note" data-hero-detail>
              <p>{c.hero.location}</p>
              <p>{c.hero.hours}</p>
            </div>
          </div>
        </section>

        <section id="dishes" className="section surface-main plates-section">
          <div className="shell plates-layout">
            <div className="section-heading compact-heading plates-heading" data-motion-reveal>
              <h2 key={language}>{c.dishes.title}</h2>
              <p>{c.dishes.intro}</p>
              <a href="#menu" className="text-link">{c.dishes.fullMenu}</a>
            </div>

            <div data-motion-reveal>
              <PlateDeck dishes={c.dishes.items} labels={c.dishes.carousel} language={language} />
            </div>
          </div>
        </section>

        <section id="story" className="section surface-deep">
          <div className="shell story-grid">
            <div className="story-copy" data-motion-reveal>
              <p className="section-kicker">{c.story.kicker}</p>
              <h2 key={language}>{c.story.title}</h2>
              <p>
                {c.story.body}
              </p>
              <blockquote>{c.story.quote}</blockquote>
            </div>

            <div className="story-media-stack">
              <div className="media-frame story-main-media" data-parallax-media data-motion-reveal>
                <img src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1200&q=88" srcSet={unsplashSrcSet('https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1200&q=88')} sizes="(min-width: 900px) 42vw, calc(100vw - 32px)" loading="lazy" decoding="async" alt={c.story.mainAlt} />
              </div>
              <div className="media-frame story-detail-media" data-parallax-media data-motion-reveal>
                <img src="https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=960&q=88" srcSet={unsplashSrcSet('https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=960&q=88')} sizes="(min-width: 900px) 24vw, calc(100vw - 32px)" loading="lazy" decoding="async" alt={c.story.detailAlt} />
              </div>
            </div>
          </div>
        </section>

        <section className="section experience-section surface-deep">
          <div className="shell experience-grid">
            <div className="experience-copy" data-motion-reveal>
              <h2 key={language}>{c.experience.title}</h2>
              <p>{c.experience.body}</p>
            </div>
            <div className="experience-media large" data-parallax-media data-motion-reveal><img src="https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=88" srcSet={unsplashSrcSet('https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=88')} sizes="(min-width: 900px) 45vw, calc(100vw - 32px)" loading="lazy" decoding="async" alt={c.experience.diningAlt} /></div>
            <div className="experience-media tall" data-parallax-media data-motion-reveal><img src="https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=960&q=88" srcSet={unsplashSrcSet('https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=960&q=88')} sizes="(min-width: 900px) 24vw, calc(100vw - 32px)" loading="lazy" decoding="async" alt={c.experience.cocktailAlt} /></div>
            <div className="experience-media wide" data-parallax-media data-motion-reveal><img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=88" srcSet={unsplashSrcSet('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=88')} sizes="(min-width: 900px) 34vw, calc(100vw - 32px)" loading="lazy" decoding="async" alt={c.experience.guestsAlt} /></div>
          </div>
        </section>

        <section id="chef" className="section surface-main">
          <div className="shell chef-grid">
            <div className="chef-portrait media-frame" data-parallax-media data-motion-reveal>
              <img src="https://images.unsplash.com/photo-1583394293214-28ded15ee548?auto=format&fit=crop&w=1200&q=88" srcSet={unsplashSrcSet('https://images.unsplash.com/photo-1583394293214-28ded15ee548?auto=format&fit=crop&w=1200&q=88')} sizes="(min-width: 900px) 45vw, calc(100vw - 32px)" loading="lazy" decoding="async" alt={c.chef.alt} />
            </div>
            <div className="chef-copy" data-motion-reveal>
              <p className="section-kicker">{c.chef.kicker}</p>
              <h2 key={language}>{c.chef.title}</h2>
              <p className="role">{c.chef.role}</p>
              <p>
                {c.chef.body}
              </p>
              <div className="philosophy-list">
                <span>{c.chef.values[0]}</span>
                <span>{c.chef.values[1]}</span>
                <span>{c.chef.values[2]}</span>
                <span>{c.chef.values[3]}</span>
              </div>
            </div>
          </div>
        </section>

        <section id="menu" className="menu-section surface-menu" data-menu-pin>
          <div className="shell menu-stage">
            <div className="menu-intro" data-motion-reveal>
              <p className="section-kicker">{c.menu.kicker}</p>
              <h2 key={language}>{c.menu.title}</h2>
              <p>{c.menu.body}</p>
            </div>
            <div className="menu-viewport" data-menu-viewport>
              <MenuHoverPreview groups={c.menu.groups} labels={c.menu.preview} />
            </div>
          </div>
        </section>

        <section id="bar" className="section bar-section">
            <div className="shell bar-grid">
              <div className="bar-copy" data-motion-reveal>
                <p className="section-kicker">{c.bar.kicker}</p>
                <h2 key={language}>{c.bar.title}</h2>
                <p>{c.bar.body}</p>
                <a href="#reservations" className="button button-quiet"><span className="button-label">{c.bar.cta}</span></a>
              </div>
              <div data-motion-reveal>
                <DrinksShowcase drinks={c.bar.drinks} label={c.bar.selectorLabel} />
              </div>
            </div>
          </section>

        <section id="reservations" className="section reservation-section surface-main">
          <div className="shell reservation-layout">
            <div className="reservation-copy" data-motion-reveal>
              <h2 key={language}>{c.reservations.title}</h2>
              <p>{c.reservations.body}</p>
              <span>123 Atlantic Ave, Brooklyn, NY</span>
            </div>
            <div className="reservation-form" data-motion-reveal>
              <label className="form-field"><span>{c.reservations.date}</span><input type="date" defaultValue="2026-08-21" /></label>
              <label className="form-field"><span>{c.reservations.time}</span><select defaultValue="7:30 PM"><option>7:00 PM</option><option>7:30 PM</option><option>8:00 PM</option><option>8:30 PM</option></select></label>
              <label className="form-field"><span>{c.reservations.guests}</span><select defaultValue={c.reservations.people[0]}>{c.reservations.people.map((people) => <option key={people}>{people}</option>)}</select></label>
              <button id="reserve-submit" className="button button-primary" onClick={() => setReservationShown(true)}><span className="button-label">{c.reservations.find}</span></button>
            </div>
            <p id="reservation-note" className={`status-note ${reservationShown ? '' : 'hidden'}`} role="status">{c.reservations.note}</p>
          </div>
        </section>

        <section id="events" className="section surface-deep">
          <div className="shell events-grid">
            <div className="events-media media-frame" data-parallax-media data-motion-reveal>
              <img src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=88" srcSet={unsplashSrcSet('https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=88')} sizes="(min-width: 900px) 48vw, calc(100vw - 32px)" loading="lazy" decoding="async" alt={c.events.alt} />
            </div>
            <div className="events-copy" data-motion-reveal>
              <h2 key={language}>{c.events.title}</h2>
              <p>{c.events.body}</p>
              <div className="event-facts">{c.events.facts.map((fact) => <span key={fact}>{fact}</span>)}</div>
              <a href="#visit" className="button button-primary"><span className="button-label">{c.events.cta}</span></a>
            </div>
          </div>
        </section>

        <section className="section surface-main reviews-section">
          <div className="shell reviews-grid">
            <blockquote className="review-feature" data-motion-reveal>
              <p>{c.reviews.feature}</p>
              <footer>Ana B. <span>{c.reviews.featureMeta}</span></footer>
            </blockquote>
            <div className="review-secondary" data-motion-reveal>
              <blockquote><p>{c.reviews.second}</p><footer>Javier R.</footer></blockquote>
              <blockquote><p>{c.reviews.third}</p><footer>María G.</footer></blockquote>
            </div>
          </div>
        </section>

        <section className="gallery-section surface-deep" aria-label={c.gallery.label}>
          <div className="gallery-grid">
            {[
              ['photo-1414235077428-338989a2e8c0', 'Plated food'],
              ['photo-1551024709-8f23befc6f87', 'Cocktail'],
              ['photo-1514933651103-005eec06c04b', 'Restaurant interior'],
              ['photo-1556910103-1c02745aae4d', 'Chef at work'],
              ['photo-1547592180-85f173990554', 'Main dish'],
            ].map(([photo, alt], index) => (
              <div className={`gallery-cell gallery-cell-${index + 1}`} data-parallax-media key={photo}>
                <img src={`https://images.unsplash.com/${photo}?auto=format&fit=crop&w=960&q=84`} srcSet={unsplashSrcSet(`https://images.unsplash.com/${photo}?auto=format&fit=crop&w=960&q=84`)} sizes="(min-width: 900px) 25vw, 50vw" loading="lazy" decoding="async" alt={c.gallery.alts[index]} />
              </div>
            ))}
          </div>
        </section>

        <section id="visit" className="section surface-main">
          <div className="shell visit-grid">
            <div className="visit-copy" data-motion-reveal>
              <h2 key={language}>{c.visit.title}</h2>
              <p>123 Atlantic Ave<br />Brooklyn, NY 11201</p>
              <p>(718) 555-1234<br />hola@casaraizbk.com</p>
              <p>{c.visit.schedule[0]}<br />{c.visit.schedule[1]}</p>
              <a className="text-link" href="https://maps.google.com/?q=123+Atlantic+Ave+Brooklyn+NY" target="_blank" rel="noreferrer">{c.visit.directions}</a>
            </div>
            <div className="visit-media media-frame" data-parallax-media data-motion-reveal>
              <img src="https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=88" srcSet={unsplashSrcSet('https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=88')} sizes="(min-width: 900px) 48vw, calc(100vw - 32px)" loading="lazy" decoding="async" alt={c.visit.alt} />
            </div>
          </div>
        </section>

        <section className="newsletter surface-menu">
          <div className="shell newsletter-layout">
            <div data-motion-reveal>
              <h2 key={language}>{c.newsletter.title}</h2>
              <p>{c.newsletter.body}</p>
            </div>
            <form id="newsletter-form" className="newsletter-form" data-motion-reveal onSubmit={(event) => { event.preventDefault(); setNewsletterShown(true); event.currentTarget.reset() }}>
              <label htmlFor="newsletter-email">{c.newsletter.label}</label>
              <div><input id="newsletter-email" type="email" required placeholder={c.newsletter.placeholder} /><button className="button button-primary"><span className="button-label">{c.newsletter.cta}</span></button></div>
            </form>
          </div>
          <p id="newsletter-note" className={`shell status-note newsletter-note ${newsletterShown ? '' : 'hidden'}`} role="status">{c.newsletter.note}</p>
        </section>
      </main>

      <footer className="footer surface-deep">
        <div className="shell footer-top">
          <div className="footer-brand"><span className="brand-main">Casa Raíz</span><p>{c.footer.brandBody}</p></div>
          <div><h3>{c.footer.navigation}</h3><a href="#menu">{c.nav.menu}</a><a href="#story">{c.nav.story}</a><a href="#reservations">{c.nav.reserve}</a><a href="#events">{c.nav.events}</a></div>
          <div><h3>{c.footer.information}</h3><p>123 Atlantic Ave<br />Brooklyn, NY 11201</p><p>(718) 555-1234<br />hola@casaraizbk.com</p></div>
          <div><h3>{c.footer.hours}</h3><p>{c.visit.schedule[0]}<br />{c.visit.schedule[1]}</p><LanguageSwitch language={visualLanguage} labels={c.language} onChange={changeLanguage} disabled={languageTransitioning} className="footer-language-switch" /></div>
        </div>
        <div className="shell footer-bottom"><p>{c.footer.rights}</p><div><a href="#">{c.footer.accessibility}</a><a href="#">{c.footer.privacy}</a><a href="#">{c.footer.terms}</a></div></div>
      </footer>
    </div>
  )
}
