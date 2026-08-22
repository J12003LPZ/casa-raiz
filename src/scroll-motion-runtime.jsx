export function setupScrollMotionRuntime({
  node,
  gsap,
  motion,
  forceMotion,
  ScrollTrigger,
  SplitText,
  Lenis,
  useLenis,
}) {
  let refreshFrame = null
  const motionObservers = []
  const deferredContexts = []
  let headingObservers = []
  let headingAnimations = []
  let headingSplits = []

  const scheduleRefresh = () => {
    if (refreshFrame) return
    refreshFrame = window.requestAnimationFrame(() => {
      refreshFrame = null
      ScrollTrigger.refresh()
    })
  }

  const cancelRefresh = () => {
    if (!refreshFrame) return
    window.cancelAnimationFrame(refreshFrame)
    refreshFrame = null
  }

  const lenis = useLenis && Lenis ? new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    syncTouch: false,
  }) : null

  lenis?.on('scroll', ScrollTrigger.update)
  const raf = (time) => lenis?.raf(time * 1000)
  if (lenis) {
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)
  }

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
      scheduleRefresh()
    }, { rootMargin, threshold: 0.01 })

    observer.observe(target)
    motionObservers.push(observer)
  }

  const scrollContext = gsap.context(() => {
    const header = node.querySelector('#site-header')
    ScrollTrigger.create({
      start: 24,
      end: 'max',
      onUpdate: (self) => header?.classList.toggle('header-scrolled', self.scroll() > 24),
    })

    gsap.to('[data-hero-image]', {
      yPercent: 8,
      scale: 1.055,
      ease: motion.ease.scrub,
      scrollTrigger: { trigger: '#home', start: 'top top', end: 'bottom top', scrub: 0.9 },
    })

    gsap.utils.toArray('[data-motion-reveal]').forEach((element) => {
      observeMotionTarget(element, () => {
        gsap.fromTo(
          element,
          { y: motion.travel.large, filter: 'blur(7px)' },
          {
            y: 0,
            filter: 'blur(0px)',
            ease: motion.ease.scrub,
            scrollTrigger: { trigger: element, start: 'top 92%', end: 'top 46%', scrub: 0.9 },
          },
        )
      })
    })

    const bar = node.querySelector('#bar')
    if (bar) {
      observeMotionTarget(bar, () => {
        gsap.fromTo(
          bar,
          { '--bar-bg': '#e6e9e3', '--bar-ink': '#172019', '--bar-muted': '#5a625c', '--bar-line': 'rgba(23, 32, 25, 0.16)' },
          {
            '--bar-bg': '#26362c',
            '--bar-ink': '#f8f8f3',
            '--bar-muted': 'rgba(248, 248, 243, 0.66)',
            '--bar-line': 'rgba(248, 248, 243, 0.2)',
            ease: motion.ease.scrub,
            scrollTrigger: { trigger: bar, start: 'top 90%', end: 'top 38%', scrub: 0.8 },
          },
        )
      }, '100% 0px')
    }

    const media = gsap.matchMedia()
    const desktopMotionQuery = forceMotion
      ? '(min-width: 900px)'
      : '(min-width: 900px) and (prefers-reduced-motion: no-preference)'

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

      return () => settle.kill()
    })

    return () => media.revert()
  }, node)

  const clearHeadings = () => {
    headingObservers.forEach((observer) => observer.disconnect())
    headingObservers = []
    headingAnimations.forEach((animation) => animation.kill())
    headingAnimations = []
    headingSplits.forEach((split) => {
      split.revert()
      split.kill()
    })
    headingSplits = []
  }

  const refreshHeadings = () => {
    clearHeadings()

    const initializeHeading = (heading) => {
      if (!heading.isConnected || heading.querySelector('.split-line')) return

      const split = SplitText.create(heading, {
        type: 'lines',
        linesClass: 'split-line',
        mask: 'lines',
        aria: 'auto',
      })
      headingSplits.push(split)

      const alreadyEntered = heading.getBoundingClientRect().top <= window.innerHeight * 0.89
      if (alreadyEntered) {
        gsap.set(split.lines, { yPercent: 0, rotate: 0, autoAlpha: 1 })
        return
      }

      headingAnimations.push(gsap.from(split.lines, {
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
        scheduleRefresh()
      }, { rootMargin: '80% 0px', threshold: 0.01 })

      observer.observe(heading)
      headingObservers.push(observer)
    })
  }

  refreshHeadings()
  document.fonts?.ready?.then(scheduleRefresh)
  if (document.readyState === 'complete') scheduleRefresh()
  else window.addEventListener('load', scheduleRefresh, { once: true })

  return {
    lenis,
    refresh: scheduleRefresh,
    refreshHeadings,
    destroy() {
      window.removeEventListener('load', scheduleRefresh)
      cancelRefresh()
      motionObservers.forEach((observer) => observer.disconnect())
      clearHeadings()
      deferredContexts.forEach((deferredContext) => deferredContext.revert())
      scrollContext.revert()
      if (lenis) gsap.ticker.remove(raf)
      lenis?.destroy()
    },
  }
}
