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