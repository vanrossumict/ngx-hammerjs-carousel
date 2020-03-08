import { NgModule } from '@angular/core';
import { HammerjsCarouselComponent } from './ngx-hammerjs-carousel.component';
import { BrowserModule, HAMMER_GESTURE_CONFIG, HammerModule } from '@angular/platform-browser';
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
