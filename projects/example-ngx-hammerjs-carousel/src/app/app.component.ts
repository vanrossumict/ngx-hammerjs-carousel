import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  slides = [
    'https://cdn.mijnreservering.info/janvanrossum/5medium.jpg',
    'https://cdn.mijnreservering.info/janvanrossum/3medium.jpg',
    'https://cdn.mijnreservering.info/janvanrossum/8medium.jpg'
  ];
}
