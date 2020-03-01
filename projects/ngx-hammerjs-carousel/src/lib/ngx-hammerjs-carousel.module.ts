import { NgModule, Injectable } from '@angular/core';
import { HammerjsCarouselComponent } from './ngx-hammerjs-carousel.component';
import * as Hammer from 'hammerjs';
import { BrowserModule, HammerGestureConfig, HAMMER_GESTURE_CONFIG, HammerModule } from '@angular/platform-browser';
import { GestureConfigService } from './gesture-config.service';


@NgModule({
  declarations: [HammerjsCarouselComponent],
  imports: [
    BrowserModule, HammerModule
  ],
  exports: [HammerjsCarouselComponent],
  providers: [{
    provide: HAMMER_GESTURE_CONFIG,
    useClass: GestureConfigService
  }]
})
export class HammerjsCarouselModule { }
