# ngx-hammerjs-carousel

A lightweight, touch friendly photo/image carousel/slider/swiper for Angular.

- Smooth swiping with touch, pen and mouse (native Pointer Events, follows your finger, flick support)
- Lazy loads images: only the visible slide and its neighbours, and only once the carousel scrolls into view
- Standalone component, signal based, `OnPush`, works in **zoneless** and zone.js applications
- Keyboard accessible (arrow keys, Home/End) with ARIA labels you can translate
- Themeable with CSS custom properties
- No runtime dependencies (Hammer.JS is no longer required since v2)

Inspired by [a great blog post](https://blog.envylabs.com/build-your-own-touch-slider-with-hammerjs-af99665d2869) from Drew Powers.

## Compatibility

| ngx-hammerjs-carousel | Angular       |
| --------------------- | ------------- |
| 2.x                   | 19 and higher |
| 1.x                   | older versions (built with Angular 12) |

## Installation

```bash
npm install ngx-hammerjs-carousel
```

## Usage

Import the standalone component:

```typescript
import { Component } from '@angular/core';
import { HammerjsCarouselComponent } from 'ngx-hammerjs-carousel';

@Component({
  selector: 'app-gallery',
  imports: [HammerjsCarouselComponent],
  template: `
    <div style="width: 500px; height: 375px">
      <hammerjs-carousel [slides]="slides" />
    </div>
  `,
})
export class GalleryComponent {
  slides = [
    'https://picsum.photos/id/10/800/600',
    'https://picsum.photos/id/11/800/600',
    'https://picsum.photos/id/12/800/600',
  ];
}
```

The carousel fills its parent element, so give the parent a size (for example a width and an `aspect-ratio`).

### NgModule based applications

`HammerjsCarouselModule` is still available:

```typescript
import { HammerjsCarouselModule } from 'ngx-hammerjs-carousel';

@NgModule({
  imports: [HammerjsCarouselModule],
})
export class AppModule {}
```

## API

### Inputs

| Input                              | Type       | Default              | Description                                                                                   |
| ---------------------------------- | ---------- | -------------------- | --------------------------------------------------------------------------------------------- |
| `slides`                           | `string[]` | `[]`                 | Image urls. `null`/`undefined` entries are ignored. Nothing is rendered without slides.       |
| `activeIndex`                      | `number`   | `0`                  | Zero based index of the visible slide. Supports two-way binding: `[(activeIndex)]="index"`.   |
| `maxNumberOfVisibileInPagination`  | `number`   | `15`                 | Maximum number of pagination dots. With more slides the dots scroll along.                     |
| `showPaginationCount`              | `boolean`  | `false`              | Shows a `3/10` counter.                                                                        |
| `lazyLoad`                         | `boolean`  | `true`               | Only load the visible slide and its neighbours, once the carousel is (almost) in view.         |
| `disableTouchdeviceEnhancements`   | `boolean`  | `false`              | Also show the previous/next buttons on touch-only devices.                                     |
| `ariaLabel`                        | `string`   | `'Image carousel'`   | Accessible label of the carousel.                                                              |
| `previousLabel`                    | `string`   | `'Previous slide'`   | Accessible label of the previous button.                                                       |
| `nextLabel`                        | `string`   | `'Next slide'`       | Accessible label of the next button.                                                           |
| `goToSlideLabel`                   | `string`   | `'Go to slide'`      | Accessible label of the pagination dots, followed by the slide number.                         |

Boolean inputs can be used as plain attributes: `<hammerjs-carousel [slides]="slides" showPaginationCount />`.

### Outputs

| Output              | Type     | Description                                    |
| ------------------- | -------- | ---------------------------------------------- |
| `activeIndexChange` | `number` | Emits when the user navigates to another slide. |

### Methods

Get a reference with `viewChild(HammerjsCarouselComponent)`:

| Method                     | Description                                         |
| -------------------------- | --------------------------------------------------- |
| `nextSlide()`              | Next slide, wraps around to the first slide.        |
| `previousSlide()`          | Previous slide, wraps around to the last slide.     |
| `goToSlideIndex(index)`    | Goes to the given index (clamped).                  |
| `goToSlide(url)`           | Goes to the first slide with the given url.         |
| `isActive(url)`            | Whether the given url is the visible slide.         |

### Theming

Set these CSS custom properties on the carousel or any parent element:

| Property                               | Default                                  |
| -------------------------------------- | ---------------------------------------- |
| `--hammerjs-carousel-background`       | `lightgray` (shown while an image loads) |
| `--hammerjs-carousel-background-size`  | `cover` (use `contain` to show the whole image) |
| `--hammerjs-carousel-dot-color`        | `rgba(255, 255, 255, 0.75)`              |
| `--hammerjs-carousel-transition`       | `400ms cubic-bezier(0.5, 0, 0.5, 1)`     |
| `--hammerjs-carousel-focus-color`      | `#fff`                                   |

```css
.my-gallery {
  --hammerjs-carousel-background: #222;
  --hammerjs-carousel-background-size: contain;
}
```

Animations are disabled automatically when the user prefers reduced motion.

## Upgrading from 1.x

- Requires Angular 19 or higher.
- Hammer.JS is no longer needed. You can remove `hammerjs`, `HammerModule` and any `HAMMER_GESTURE_CONFIG` provider if nothing else in your application uses them. Keeping them does no harm.
- `HammerjsCarouselModule` no longer imports `BrowserModule`, so it can be used in lazy loaded modules.
- The previous/next buttons and pagination dots are now real `<button>` elements. If you styled `.slider-pagination > div`, use `.slider-pagination > button` instead.
- The component is a standalone component; inputs are signal inputs. If you read `slides` from a component reference, call it: `carousel.slides()`.
- The previous/next buttons are now hidden only on touch-only devices (`(hover: none) and (pointer: coarse)`), so laptops with a touchscreen keep their buttons.

## Library development

Requires Node.js `^22.22.3 || ^24.15.0 || >=26`.

```bash
npm install
npm run build        # build the library to dist/ngx-hammerjs-carousel
npm test             # run the unit tests (Vitest)
npm start            # start the example app on http://localhost:4206 (build the library first)
npm run build-watch  # rebuild the library on changes while the example app is running
```

### Publish

1. Update the version in `projects/ngx-hammerjs-carousel/package.json` and add an entry to `CHANGELOG.md`.
2. Run `npm run prepublish-check` (tests, library build and example build).
3. Run `npm publish ./dist/ngx-hammerjs-carousel`.

## License

MIT
