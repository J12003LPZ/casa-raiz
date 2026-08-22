# Casa Raíz PageSpeed 100 Design

## Goal

Make the deployed Casa Raíz landing page consistently achieve 100/100 in Lighthouse/PageSpeed Insights for Performance, Accessibility, Best Practices, and SEO on both mobile and desktop, while preserving the existing visual design, content, animations, navigation behavior, custom cursor, modal interactions, language transitions, menu previews, and the newly added smooth mobile hamburger-menu animation.

Because Lighthouse performance scores vary between runs, success means engineering enough headroom that repeated matched runs reach 100 rather than relying on a single favorable sample. No claim will be made that Google can never emit a 99 under noisy conditions.

## Baseline

Live URL: https://casa-raiz-kappa.vercel.app/

Actual PageSpeed Insights UI baseline on 2026-08-22:

- Mobile: Performance 89, Accessibility 96, Best Practices 100, SEO 100. FCP 2.7 s, LCP 3.2 s, TBT 10 ms, CLS 0, Speed Index 2.7 s.
- Desktop: Performance 98, Accessibility 96, Best Practices 100, SEO 100. FCP 0.7 s, LCP 0.8 s, TBT 10 ms, CLS 0, Speed Index 1.3 s.
- CrUX/field data: unavailable for this URL (PageSpeed reports No Data).

Three independent Lighthouse cold runs against the live deployment produced a mobile median of Performance 87 / Accessibility 96 / Best Practices 100 / SEO 100, with FCP 2.78 s, LCP 3.41 s, TBT 60 ms, CLS 0. Desktop median was Performance 99 / Accessibility 96 / Best Practices 100 / SEO 100, with FCP 0.72 s, LCP 0.76 s, TBT 0 ms.

## Proven bottlenecks

1. Google Fonts CSS is render-blocking. PageSpeed estimates roughly 1.35 s of mobile savings from render-blocking requests, with the Google Fonts stylesheet dominating that opportunity.
2. Initial JavaScript contains about 63 KiB of Lighthouse-estimated unused code on mobile. The current application statically bundles GSAP plugins, Lenis, and below-fold interaction code even when those features are not needed for first paint.
3. Image delivery is oversized. PageSpeed estimates about 251 KiB mobile savings on the live site; Lighthouse local runs estimate up to about 477 KiB depending on the run. Several images also lack explicit intrinsic width/height attributes.
4. Accessibility is held at 96 by insufficient contrast and accessible-name mismatches. Some reveal animations temporarily fade readable text into low-contrast states. The brand link and language controls have visible labels that do not match their accessible names.
5. Forced reflow is present during startup, with GSAP/ScrollTrigger geometry work contributing measurable layout cost.

## Architecture

### 1. Self-host critical fonts

Replace the render-blocking Google Fonts stylesheet with locally served WOFF2 files for the exact existing Cormorant Garamond and DM Sans families/weights actually needed by the page. Define @font-face locally, preload only the critical first-view font files, and use font-display: swap. Preserve the existing font-family names and visual typography. Remove Google Fonts preconnects and the remote stylesheet once local fonts are verified.

### 2. Split initial JavaScript by need

Keep the critical React shell and hero/header behavior in the initial bundle. Defer or dynamically import code that is not necessary for first paint, especially Lenis, ScrollTrigger, SplitText, CustomEase where possible, and below-fold interaction modules. Mobile must not download desktop-only smooth-scroll code before it is needed. Preserve all existing animation behavior when the relevant section becomes active.

The implementation will prefer dynamic imports and section-near-viewport activation over deleting product features. Any split that produces a visual flash, delayed content, SEO regression, or interaction regression will be rejected.

### 3. Make image delivery audit-clean

Tighten responsive image candidates and quality values based on actual rendered sizes. Add explicit intrinsic width and height to every image Lighthouse flags, preserving CSS-driven responsive sizing. Keep the hero eager/high-priority and discoverable from HTML. Keep below-fold images lazy. Where native lazy-loading still fetches too much during Lighthouse, defer the source assignment until a section approaches the viewport rather than removing imagery.

### 4. Accessibility to 100

Slightly darken only muted text colors that currently fail WCAG AA while preserving the overall Casa Raíz palette. Ensure readable text does not animate through opacity/contrast states that cause Lighthouse contrast failures; decorative surfaces/images may continue to fade. Fix visible-label/accessibility-name mismatches for the brand and language controls. Preserve keyboard behavior, focus states, reduced-motion behavior, and screen-reader semantics.

### 5. Preserve current interaction quality

The following are non-negotiable regressions: desktop Lenis behavior, mobile Lenis-free internal navigation, smooth mobile hamburger open/close animation, custom black-dot cursor including modal behavior, plate deck and nutrition modal, House-menu preview hover/focus/touch behavior, drinks transitions, CTA magnetic motion, language morph/switch timing, and reduced-motion fallbacks.

## Verification

Every material optimization will be tested under the same conditions used for its baseline and kept only if it is neutral-or-better for correctness and meaningfully improves the measured target. Before final commit/push:

- Run all Vitest tests.
- Run all Playwright regressions.
- Run the production Vite build.
- Run repeated mobile and desktop Lighthouse tests against production output.
- Deploy the candidate to Vercel only after local verification.
- Run the actual PageSpeed Insights web UI against the production URL for both Mobile and Desktop.
- If any category is below 100, continue iterating before finalizing unless the remaining point is proven external/non-deterministic and documented.
- Confirm the deployed site visually on representative desktop and 390x844 mobile viewports.

## Git and deployment

The current uncommitted mobile hamburger animation changes must be preserved and included in the final work. No remote push occurs until the optimized site is verified. Once verified, commit the final source on local main and push main to https://github.com/J12003LPZ/casa-raiz.git. The Vercel production deployment must correspond to the pushed main state.

## Constraints

- No redesign.
- No removal of intentional animations solely to improve a benchmark.
- No test weakening to make regressions pass.
- No field-data claims when CrUX remains unavailable.
- No claim of guaranteed permanent 100 performance under all Lighthouse variance; target repeated 100 runs with sufficient performance headroom.
