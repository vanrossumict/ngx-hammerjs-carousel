import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HammerjsCarouselModule } from 'ngx-hammerjs-carousel';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HammerjsCarouselModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
