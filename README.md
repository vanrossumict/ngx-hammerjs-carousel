# HammerjsCarousel

A photo/image carousel/slider/swiper for Angular that uses Hammer.JS.

Inspired by [a great blog post](https://blog.envylabs.com/build-your-own-touch-slider-with-hammerjs-af99665d2869) from Drew Powers.

Online demo: https://stackblitz.com/edit/ngx-hammerjs-carousel-demo

## Usage

`npm install hammerjs ngx-hammerjs-carousel --save`

In your (app) module:
```typescript
import { HammerjsCarouselModule } from 'ngx-hammerjs-carousel';
...
@NgModule({
  ...
  imports: [
    ...
    HammerjsCarouselModule
    ...
  ],
```

In your TypeScript:
```typescript
  slides = [
    'https://dummyimage.com/600x400x/000/fff',
    'https://dummyimage.com/601x401x/000/fff',
    'https://dummyimage.com/602x402x/000/fff',
    'https://dummyimage.com/603x403x/000/fff',
    'https://dummyimage.com/604x404x/000/fff',
  ];
```

In your template:
```html
<hammerjs-carousel [slides]="slides"></hammerjs-carousel>
```

# Library development info

## Development

1. Run `npm run build-watch` to build the library and watch for changes.
2. Run `npm run start` to start a dev server with an example app that uses the library.

## Publish

1. Up the version in projects/ngx-hammerjs-carousel/package.json
2. Run `npm run build-publish` to build the project for publishing to npm.
3. Go to the /dist/ngx-hammerjs-carousel folder
4. Run `npm publish`
