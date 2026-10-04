# Changelog

## 2.0.0

Rewritten for modern Angular.

### Breaking changes

- Requires Angular 19 or higher.
- Hammer.JS is no longer used; swiping is implemented with native Pointer Events. `hammerjs` is no longer a peer dependency.
- The component is standalone and uses signal inputs.
- Previous/next buttons and pagination dots are `<button>` elements (`.slider-pagination > button`).
- Previous/next buttons are only hidden on touch-only devices, instead of on every device that supports touch.

### Features

- Two-way bindable `activeIndex` (`[(activeIndex)]`).
- Lazy loading of slide images (`lazyLoad`, enabled by default).
- `showPaginationCount` shows a `3/10` counter.
- `disableTouchdeviceEnhancements` always shows the previous/next buttons.
- Keyboard navigation (arrow keys, Home, End) and ARIA labels (`ariaLabel`, `previousLabel`, `nextLabel`, `goToSlideLabel`).
- Theming with CSS custom properties; respects `prefers-reduced-motion`.
- Mouse dragging on desktop; the slide follows the pointer and supports flicks; rubber band effect at the first and last slide.

### Fixes and performance

- Works in zoneless applications. Pointer handling runs outside Angular's zone, so swiping no longer triggers application wide change detection.
- No more `ngAfterViewChecked` + `detectChanges()` on every change detection cycle; chevron sizes use CSS container query units.
- Duplicate image urls are handled correctly.
- Image urls are escaped before they are used in CSS.
- `HammerjsCarouselModule` no longer imports `BrowserModule`, so it can be used in lazy loaded modules.
- Browser APIs are only used after rendering, which keeps the component safe for server side rendering.

## 1.0.5

- Prevent hanging slider when releasing touch without moving.
- Prevent sliding when there is only one image.
