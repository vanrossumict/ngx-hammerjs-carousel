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
      <div *ngFor="let slide of slides; index as index;" (click)="goToSlide(index)">
        <div class="slider-page" [ngClass]="{ 'is-active': isActive(index) }"></div>
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

  @ViewChild('sliderWrapper') sliderWrapper: ElementRef;

  sliderTransformStyle: string;
  isAnimating: boolean;
  slideCount: number;
  isTouchDevice: boolean;
  width: number;

  private activeSlide = 0;
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

  previousSlide() {
    const slideIndex = this.activeSlide - 1;
    if (slideIndex < 0) {
      this.goToSlide(this.slideCount - 1);
    } else {
      this.goToSlide(slideIndex);
    }
  }

  nextSlide() {
    const slideIndex = this.activeSlide + 1;
    if (slideIndex === this.slideCount) {
      this.goToSlide(0);
    } else {
      this.goToSlide(slideIndex);
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
