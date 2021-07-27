import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  slides = this.getNumberOfSlides(5);
  empty = [];
  oneSlide = this.getNumberOfSlides(1);
  manySlides = this.getNumberOfSlides(50);

  getNumberOfSlides(howMany: number) {
    const slides = [];
    for (let index = 0; index < howMany; index++) {
      slides.push(this.slideUrlForIndex(index));
    }
    return slides;
  }

  slideUrlForIndex(i: number) {
    return `https://dummyimage.com/${600 + i}x${400 + i}/000/fff`;
  }
}
