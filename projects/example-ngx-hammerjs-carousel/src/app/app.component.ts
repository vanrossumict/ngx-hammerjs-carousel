import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  slides = [
    'https://cdn.mijnreservering.info/janvanrossum/37medium.jpg',
    'https://cdn.mijnreservering.info/janvanrossum/38medium.jpg',
    'https://cdn.mijnreservering.info/janvanrossum/39medium.jpg',
    'https://cdn.mijnreservering.info/janvanrossum/40medium.jpg',
    'https://cdn.mijnreservering.info/janvanrossum/41medium.jpg'
  ];
  empty = [];
  oneSlide = [
    'https://cdn.mijnreservering.info/janvanrossum/41medium.jpg'
  ];
  manySlides = [...this.slides, ...this.slides, ...this.slides, ...this.slides];
}
