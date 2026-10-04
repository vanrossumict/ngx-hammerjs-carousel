import { Component, signal } from '@angular/core';
import { HammerjsCarouselComponent } from 'ngx-hammerjs-carousel';

@Component({
  selector: 'app-root',
  imports: [HammerjsCarouselComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly slides = getSlides(5);
  protected readonly oneSlide = getSlides(1);
  protected readonly manySlides = getSlides(50);
  protected readonly empty: string[] = [];
  protected readonly activeIndex = signal(2);
}

function getSlides(howMany: number): string[] {
  return Array.from(
    { length: howMany },
    (_, i) => `https://picsum.photos/id/${10 + i}/${800}/${600}`,
  );
}
