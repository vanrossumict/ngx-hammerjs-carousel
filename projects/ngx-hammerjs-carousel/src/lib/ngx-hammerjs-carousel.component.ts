import { Component, OnInit, Input, ElementRef, AfterViewChecked, ViewChild, ChangeDetectorRef } from '@angular/core';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'hammerjs-carousel',
  template: `
  <div class="slider-wrapper" #sliderWrapper>
    <div class="slider" (pan)="onPan($event)" [style.transform]="sliderTransformStyle" [style.width]="slideCount + '00%'"
         [ngClass]="{ 'is-animating': isAnimating }">
      <div class="slider-panel" *ngFor="let slide of slides" [style.background-image]="'url(' + slide + ')'"></div>
    </div>
    <div class="slider-button left" *ngIf="!isTouchDevice && slides?.length > 1" (click)="previousSlide()">
        <svg class="chevron" [style.width]="getWidthStyle()" [style.margin-left]="getMarginStyle()"
        xmlns="http://www.w3.org/2000/svg" viewBox="17 15 13 20" enable-background="new 17 15 13 20" fill="#fff">
          <path d="M27.3 34.7L17.6 25l9.7-9.7 1.4 1.4-8.3 8.3 8.3 8.3z"/>
        </svg>
    </div>
    <div class="slider-button right" *ngIf="!isTouchDevice && slides?.length > 1" (click)="nextSlide()">
      <svg class="chevron right" [style.width]="getWidthStyle()" [style.margin-right]="getMarginStyle()"
      xmlns="http://www.w3.org/2000/svg" viewBox="17 15 13 20" enable-background="new 17 15 13 20" fill="#fff">
          <path d="M27.3 34.7L17.6 25l9.7-9.7 1.4 1.4-8.3 8.3 8.3 8.3z"/>
        </svg>
    </div>
    <div class="slider-pagination" *ngIf="slides?.length > 1">
      <div *ngFor="let slide of slidesForPagination; index as index;" (click)="goToSlide(slide)">
        <div class="slider-page" [ngClass]="{ 'is-active': isActive(slide) }"></div>
      </div>
    </div>
  </div>
  `,
  styleUrls: ['./ngx-hammerjs-carousel.component.css']
})
export class HammerjsCarouselComponent implements OnInit, AfterViewChecked {
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

  @Input() maxNumberOfVisibileInPagination = 15;

  get slidesForPagination() {
    if (this.slides == null) {
      return null;
    }
    if (this.slides.length > this.maxNumberOfVisibileInPagination) {

      if (this.activeSlideIndex === this.slides.length - 1) {
        return this.slides.slice(this.activeSlideIndex - (this.maxNumberOfVisibileInPagination - 1),
          this.activeSlideIndex + 2);
      }
      if (this.activeSlideIndex > this.maxNumberOfVisibileInPagination - 2) {
        return this.slides.slice(this.activeSlideIndex - (this.maxNumberOfVisibileInPagination - 2),
          this.activeSlideIndex + 2);
      }

      return this.slides.slice(0, this.maxNumberOfVisibileInPagination);
    }
    return this.slides;
  }

  @ViewChild('sliderWrapper') sliderWrapper: ElementRef;

  sliderTransformStyle: string;
  isAnimating: boolean;
  slideCount: number;
  isTouchDevice: boolean;
  width: number;

  private activeSlideIndex = 0;
  private sensitivity = 10;
  private animatingTimeout: any;

  constructor(private cdRef: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.isTouchDevice = 'ontouchstart' in window;
  }

  ngAfterViewChecked(): void {
    const sliderWrapperElement = this.sliderWrapper.nativeElement as HTMLElement;
    this.width = sliderWrapperElement.offsetWidth;
    this.sensitivity = this.width / 40;
    this.cdRef.detectChanges();
  }

  onPan(e: any) {
    if (e.velocityX === 0 || Math.abs(e.velocityY) > Math.abs(e.velocityX)) {
      // Vertical scroll
      return;
    }
    const percentage = 100 / this.slideCount * e.deltaX / window.innerWidth;
    const transformPercentage = percentage - 100 / this.slideCount * this.activeSlideIndex;
    this.sliderTransformStyle = 'translateX( ' + transformPercentage + '% )';
    if (e.isFinal) {
      if (e.velocityX > 1) {
        this.goToSlideIndex(this.activeSlideIndex - 1);
      } else if (e.velocityX < -1) {
        this.goToSlideIndex(this.activeSlideIndex + 1);
      } else {
        if (percentage <= -(this.sensitivity / this.slideCount)) {
          this.goToSlideIndex(this.activeSlideIndex + 1);
        } else if (percentage >= (this.sensitivity / this.slideCount)) {
          this.goToSlideIndex(this.activeSlideIndex - 1);
        } else {
          this.goToSlideIndex(this.activeSlideIndex);
        }
      }
    }
  }

  previousSlide() {
    const slideIndex = this.activeSlideIndex - 1;
    if (slideIndex < 0) {
      this.goToSlideIndex(this.slideCount - 1);
    } else {
      this.goToSlideIndex(slideIndex);
    }
  }

  nextSlide() {
    const slideIndex = this.activeSlideIndex + 1;
    if (slideIndex === this.slideCount) {
      this.goToSlideIndex(0);
    } else {
      this.goToSlideIndex(slideIndex);
    }
  }

  goToSlide(slide: string) {
    this.goToSlideIndex(this.slides.indexOf(slide));
  }

  goToSlideIndex(slideIndex: number) {
    if (slideIndex < 0) {
      this.activeSlideIndex = 0;
    } else if (slideIndex > this.slideCount - 1) {
      this.activeSlideIndex = this.slideCount - 1;
    } else {
      this.activeSlideIndex = slideIndex;
    }

    this.isAnimating = true;
    const percentage = -(100 / this.slideCount) * this.activeSlideIndex;
    this.sliderTransformStyle = 'translateX(' + percentage + '%)';
    clearTimeout(this.animatingTimeout);
    this.animatingTimeout = setTimeout(() => this.isAnimating = false, 400);
  }

  isActive(slide: string) {
    return this.slides[this.activeSlideIndex] === slide;
  }

  getWidthStyle() {
    if (this.width == null) {
      return null;
    }
    return (this.width / 13) + 'px';
  }

  getMarginStyle() {
    if (this.width == null) {
      return null;
    }
    return (this.width / 30) + 'px';
  }
}
