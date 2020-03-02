# HammerjsCarousel

## Usage

`npm install hammerjs ngx-hammerjs-carousel --save`

In your (app) module:
```typescript
import { HammerjsCarouselModule } from 'ngx-hammerjs-carousel';

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
    'https://cdn.mijnreservering.info/janvanrossum/5medium.jpg',
    'https://cdn.mijnreservering.info/janvanrossum/3medium.jpg',
    'https://cdn.mijnreservering.info/janvanrossum/8medium.jpg'
  ];
```

In your template:
```html
<hammerjs-carousel [slides]="slides"></hammerjs-carousel>
```

# Library development info

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 9.0.4.

## Development

Run `npm run build-watch` to build the library and watch for changes.
Run `npm run start` to start a dev server with an example app that uses the library.

## Publish

Run `npm run build-publish` to build the project for publishing to npm.
Go to the /dist/ngx-hammerjs-carousel folder
Run `npm publish`
