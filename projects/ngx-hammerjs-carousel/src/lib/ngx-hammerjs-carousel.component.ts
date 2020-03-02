import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'hammerjs-carousel',
  template: `
  <div class="has-slider">
    <div class="slider" (pan)="onPan($event)" [style.transform]="sliderTransformStyle" [style.width]="slideCount + '00%'"
         [ngClass]="{ 'is-animating': isAnimating }">
      <div class="slider-panel" *ngFor="let slide of slides" [style.background-image]="'url(' + slide + ')'"></div>
    </div>
    <div class="slider-pagination">
      <div *ngFor="let slide of slides; index as index;" [ngClass]="{ 'is-active': isActive(index) }"></div>
    </div>
  </div>
  `,
  styles: [`
    .has-slider {
      overflow: hidden;
      width: 100%;
      height: 100%;
      position: relative;
    }
    .slider {
      display: flex;
      height: 100%;
    }
    .slider.is-animating {
      transition: transform 400ms cubic-bezier( 0.5, 0, 0.5, 1);
    }
    .slider-panel {
      padding-top: 10%;
      width: 100%;
      background-position: center center;
      background-repeat: no-repeat;
      background-size: cover;
    }
    .slider-pagination {
      bottom: 6.25%;
      left: 0;
      pointer-events: none;
      position: absolute;
      text-align: center;
      width: 100%;
    }
    .slider-pagination > div {
      border-radius: 50%;
      box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.75);
      display: inline-block;
      height: 6px;
      margin-left: 4px;
      margin-right: 4px;
      transition: background-color 250ms;
      width: 6px;
    }
    .slider-pagination > div.is-active {
      background-color: rgba(255, 255, 255, 0.75);
    }
  `]
})
export class HammerjsCarouselComponent implements OnInit {
  private slidesInternal: string[];
  get slides(): string[] {
    return this.slidesInternal;
  }
  @Input() set slides(value: string[]) {
    this.slidesInternal = value;
    if (this.slides != null) {
      this.slideCount = this.slides.length;
    } else {
      this.slideCount = 0;
    }
  }

  sliderTransformStyle: string;
  isAnimating: boolean;
  slideCount: number;

  private activeSlide = 0;
  private sensitivity = 10;
  private animatingTimeout: any;

  constructor() { }

  ngOnInit(): void {
  }

  onPan(e: any) {
    const percentage = 100 / this.slideCount * e.deltaX / window.innerWidth;
    const transformPercentage = percentage - 100 / this.slideCount * this.activeSlide;
    this.sliderTransformStyle = 'translateX( ' + transformPercentage + '% )';
    if (e.isFinal) {
      if (e.velocityX > 1) {
        this.goToSlide(this.activeSlide - 1);
      } else if (e.velocityX < -1) {
        this.goToSlide(this.activeSlide + 1);
      } else {
        if (percentage <= -(this.sensitivity / this.slideCount)) {
          this.goToSlide(this.activeSlide + 1);
        } else if (percentage >= (this.sensitivity / this.slideCount)) {
          this.goToSlide(this.activeSlide - 1);
        } else {
          this.goToSlide(this.activeSlide);
        }
      }
    }
  }

  goToSlide(slideNumber: number) {
    if (slideNumber < 0) {
      this.activeSlide = 0;
    } else if (slideNumber > this.slideCount - 1) {
      this.activeSlide = this.slideCount - 1;
    } else {
      this.activeSlide = slideNumber;
    }

    this.isAnimating = true;
    const percentage = -(100 / this.slideCount) * this.activeSlide;
    this.sliderTransformStyle = 'translateX(' + percentage + '%)';
    clearTimeout(this.animatingTimeout);
    this.animatingTimeout = setTimeout(() => this.isAnimating = false, 400);
  }

  isActive(index: number) {
    return this.activeSlide === index;
  }
}
