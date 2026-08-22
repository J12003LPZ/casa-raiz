export const motion = {
  ease: {
    expoOut: 'raiz-expo-out',
    quintOut: 'raiz-quint-out',
    cubicOut: 'raiz-cubic-out',
    inOut: 'raiz-in-out',
    scrub: 'none',
  },
  duration: {
    fast: 0.24,
    base: 0.45,
    slow: 0.8,
    reveal: 1.1,
    epic: 1.6,
  },
  stagger: {
    tight: 0.04,
    text: 0.07,
    base: 0.09,
    loose: 0.14,
  },
  travel: {
    small: 24,
    medium: 48,
    large: 64,
  },
}

export function registerMotionEases(gsap, CustomEase) {
  gsap.registerPlugin(CustomEase)
  CustomEase.create(motion.ease.expoOut, '0.16, 1, 0.3, 1')
  CustomEase.create(motion.ease.quintOut, '0.22, 1, 0.36, 1')
  CustomEase.create(motion.ease.cubicOut, '0.33, 1, 0.68, 1')
  CustomEase.create(motion.ease.inOut, '0.65, 0, 0.35, 1')
}
