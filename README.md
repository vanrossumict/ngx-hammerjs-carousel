# HammerjsCarousel

A photo/image carousel/swiper for Angular that uses Hammer.JS.
Inspired by [a great blog post](https://blog.envylabs.com/build-your-own-touch-slider-with-hammerjs-af99665d2869) by Drew Powers.
Online demo: https://stackblitz.com/edit/ngx-hammerjs-carousel-example

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
    'https://cdn.mijnreservering.info/janvanrossum/37medium.jpg',
    'https://cdn.mijnreservering.info/janvanrossum/38medium.jpg',
    'https://cdn.mijnreservering.info/janvanrossum/39medium.jpg',
    'https://cdn.mijnreservering.info/janvanrossum/40medium.jpg',
    'https://cdn.mijnreservering.info/janvanrossum/41medium.jpg'
  ];
```

In your template:
```html
<hammerjs-carousel [slides]="slides"></hammerjs-carousel>
```

# Library development info

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 9.0.4.

## Development

1. Run `npm run build-watch` to build the library and watch for changes.
2. Run `npm run start` to start a dev server with an example app that uses the library.

## Publish

1. Run `npm run build-publish` to build the project for publishing to npm.
2. Go to the /dist/ngx-hammerjs-carousel folder
3. Run `npm publish`
