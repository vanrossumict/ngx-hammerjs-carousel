import {
  afterNextRender,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  model,
  NgZone,
  numberAttribute,
  signal,
  untracked,
} from '@angular/core';

/** Minimum distance (px) a pointer has to travel before we decide between a horizontal drag and a vertical scroll. */
const DRAG_START_THRESHOLD = 6;
/** Part of the carousel width a slide has to be dragged to switch to the next/previous slide. */
const DRAG_DISTANCE_RATIO = 0.2;
/** Release velocity (px/ms) that counts as a flick, regardless of the dragged distance. */
const FLICK_VELOCITY = 0.4;
/** Time window (ms) used to calculate the release velocity. */
const VELOCITY_WINDOW = 100;
/** Resistance applied when dragging beyond the first or last slide. */
const EDGE_RESISTANCE = 3;

interface PointerSample {
  x: number;
  t: number;
}

/**
 * A lightweight, touch friendly photo/image carousel.
 *
 * Swiping is implemented with native Pointer Events, so Hammer.JS is no longer required.
 * All pointer handling runs outside Angular's zone and only updates signals, which makes the
 * component work in both zone.js based and zoneless applications without triggering global change detection.
 */
@Component({
  // Selector kept for backwards compatibility with v1.
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'hammerjs-carousel',
  templateUrl: './ngx-hammerjs-carousel.component.html',
  styleUrl: './ngx-hammerjs-carousel.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HammerjsCarouselComponent {
  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly zone = inject(NgZone);

  /** The image urls to show. `null`/`undefined` entries are ignored. */
  readonly slides = input<string[], readonly (string | null | undefined)[] | null | undefined>([], {
    transform: normalizeSlides,
  });
  /** Maximum number of pagination dots; with more slides the dots scroll along with the active slide. */
  readonly maxNumberOfVisibileInPagination = input(15, { transform: numberAttribute });
  /** Shows a "3/10" counter in the bottom right corner. */
  readonly showPaginationCount = input(false, { transform: booleanAttribute });
  /** Always show the previous/next buttons, also on touch-only devices. */
  readonly disableTouchdeviceEnhancements = input(false, { transform: booleanAttribute });
  /** Only load the images of the visible slide and its neighbours once the carousel scrolls into view. */
  readonly lazyLoad = input(true, { transform: booleanAttribute });

  /** Accessible label of the carousel. */
  readonly ariaLabel = input('Image carousel');
  /** Accessible label of the previous button. */
  readonly previousLabel = input('Previous slide');
  /** Accessible label of the next button. */
  readonly nextLabel = input('Next slide');
  /** Accessible label prefix of the pagination dots, followed by the slide number. */
  readonly goToSlideLabel = input('Go to slide');

  /** Zero based index of the visible slide. Supports two-way binding: `[(activeIndex)]="index"`. */
  readonly activeIndex = model(0);

  protected readonly slideCount = computed(() => this.slides().length);
  protected readonly currentIndex = computed(() =>
    clamp(this.activeIndex(), 0, Math.max(0, this.slideCount() - 1)),
  );

  private readonly touchOnlyDevice = signal(false);
  protected readonly showButtons = computed(
    () =>
      this.slideCount() > 1 && (!this.touchOnlyDevice() || this.disableTouchdeviceEnhancements()),
  );

  /** Horizontal offset (px) of an ongoing drag, `null` when not dragging. */
  private readonly dragOffset = signal<number | null>(null);
  protected readonly isDragging = computed(() => this.dragOffset() !== null);
  protected readonly trackTransform = computed(() => {
    const count = this.slideCount();
    if (count === 0) {
      return null;
    }
    const percentage = -(100 / count) * this.currentIndex();
    const offset = this.dragOffset();
    return offset === null
      ? `translate3d(${percentage}%, 0, 0)`
      : `translate3d(calc(${percentage}% + ${offset}px), 0, 0)`;
  });

  protected readonly paginationIndexes = computed(() => {
    const count = this.slideCount();
    const max = Math.max(1, Math.floor(this.maxNumberOfVisibileInPagination()) || 1);
    if (count <= max) {
      return range(0, count);
    }
    // Keep one dot ahead of the active slide visible, so it is clear there are more slides.
    const lookAhead = max > 2 ? 1 : 0;
    const start = clamp(this.currentIndex() - (max - 1 - lookAhead), 0, count - max);
    return range(start, max);
  });

  private readonly isVisible = signal(false);
  private readonly loadedSlides = signal<ReadonlySet<string>>(new Set());
  protected readonly backgroundImages = computed(() => {
    const eager = !this.lazyLoad();
    const loaded = this.loadedSlides();
    return this.slides().map((slide) => (eager || loaded.has(slide) ? toCssUrl(slide) : null));
  });

  private pointerId: number | null = null;
  private dragAxis: 'x' | 'y' | null = null;
  private dragStartX = 0;
  private dragStartY = 0;
  private dragWidth = 0;
  private samples: PointerSample[] = [];
  private suppressNextClick = false;

  constructor() {
    // Load the visible slide and both neighbours (including the wrap-around neighbours of the buttons).
    effect(() => {
      if (!this.lazyLoad() || !this.isVisible()) {
        return;
      }
      const slides = this.slides();
      const count = slides.length;
      if (count === 0) {
        return;
      }
      const index = this.currentIndex();
      const wanted = [index, index + 1, index - 1 + count].map((i) => slides[i % count]);
      const loaded = untracked(this.loadedSlides);
      if (wanted.some((slide) => !loaded.has(slide))) {
        this.loadedSlides.set(new Set([...loaded, ...wanted]));
      }
    });

    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const element = this.host.nativeElement;
      this.touchOnlyDevice.set(
        typeof matchMedia === 'function' &&
          matchMedia('(hover: none) and (pointer: coarse)').matches,
      );
      const cleanups = this.zone.runOutsideAngular(() => [
        this.observeVisibility(element),
        listen(element, 'pointerdown', (e) => this.onPointerDown(e), { passive: true }),
        listen(element, 'pointermove', (e) => this.onPointerMove(e), { passive: true }),
        listen(element, 'pointerup', (e) => this.onPointerUp(e), { passive: true }),
        listen(element, 'pointercancel', (e) => this.onPointerCancel(e), { passive: true }),
        listen(element, 'click', (e) => this.onClickCapture(e), { capture: true }),
      ]);
      destroyRef.onDestroy(() => cleanups.forEach((cleanup) => cleanup()));
    });
  }

  /** @deprecated Use `activeIndex()` instead. Kept for backwards compatibility. */
  get activeSlideIndex(): number {
    return this.currentIndex();
  }

  /** Goes to the previous slide, wrapping around to the last slide. */
  previousSlide(): void {
    const index = this.currentIndex() - 1;
    this.goToSlideIndex(index < 0 ? this.slideCount() - 1 : index);
  }

  /** Goes to the next slide, wrapping around to the first slide. */
  nextSlide(): void {
    const index = this.currentIndex() + 1;
    this.goToSlideIndex(index >= this.slideCount() ? 0 : index);
  }

  /** Goes to the (first) slide with the given url. */
  goToSlide(slide: string): void {
    const index = this.slides().indexOf(slide);
    if (index !== -1) {
      this.goToSlideIndex(index);
    }
  }

  /** Goes to the slide with the given index, clamped to the available slides. */
  goToSlideIndex(slideIndex: number): void {
    this.activeIndex.set(clamp(slideIndex, 0, Math.max(0, this.slideCount() - 1)));
  }

  /** Whether the given slide url is the visible slide. */
  isActive(slide: string): boolean {
    return this.slides()[this.currentIndex()] === slide;
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft') {
      this.previousSlide();
    } else if (event.key === 'ArrowRight') {
      this.nextSlide();
    } else if (event.key === 'Home') {
      this.goToSlideIndex(0);
    } else if (event.key === 'End') {
      this.goToSlideIndex(this.slideCount() - 1);
    } else {
      return;
    }
    event.preventDefault();
  }

  private observeVisibility(element: HTMLElement): () => void {
    if (typeof IntersectionObserver !== 'function') {
      this.isVisible.set(true);
      return () => {};
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          this.isVisible.set(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }

  private onPointerDown(event: PointerEvent): void {
    this.suppressNextClick = false;
    if (
      this.pointerId !== null ||
      !event.isPrimary ||
      (event.pointerType === 'mouse' && event.button !== 0) ||
      this.slideCount() < 2
    ) {
      return;
    }
    this.pointerId = event.pointerId;
    this.dragAxis = null;
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;
    this.dragWidth = this.host.nativeElement.clientWidth;
    this.samples = [{ x: event.clientX, t: event.timeStamp }];
  }

  private onPointerMove(event: PointerEvent): void {
    if (event.pointerId !== this.pointerId || this.dragAxis === 'y') {
      return;
    }
    const deltaX = event.clientX - this.dragStartX;
    const deltaY = event.clientY - this.dragStartY;
    if (this.dragAxis === null) {
      if (Math.hypot(deltaX, deltaY) < DRAG_START_THRESHOLD) {
        return;
      }
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        // Vertical movement: leave it to the browser to scroll the page.
        this.dragAxis = 'y';
        return;
      }
      this.dragAxis = 'x';
      this.host.nativeElement.setPointerCapture?.(event.pointerId);
    }
    this.samples.push({ x: event.clientX, t: event.timeStamp });
    this.samples = this.samples.filter((sample) => event.timeStamp - sample.t <= VELOCITY_WINDOW);
    this.dragOffset.set(this.withEdgeResistance(deltaX));
  }

  private onPointerUp(event: PointerEvent): void {
    if (event.pointerId !== this.pointerId) {
      return;
    }
    if (this.dragAxis === 'x') {
      const deltaX = event.clientX - this.dragStartX;
      const velocity = this.releaseVelocity(event);
      const index = this.currentIndex();
      let target = index;
      if (Math.abs(velocity) >= FLICK_VELOCITY && Math.sign(velocity) === Math.sign(deltaX)) {
        target = index - Math.sign(velocity);
      } else if (Math.abs(deltaX) >= this.dragWidth * DRAG_DISTANCE_RATIO) {
        target = index - Math.sign(deltaX);
      }
      // The click that follows a drag must not trigger the previous/next buttons or dots.
      this.suppressNextClick = true;
      this.zone.run(() => {
        this.dragOffset.set(null);
        this.goToSlideIndex(target);
      });
    }
    this.resetPointer();
  }

  private onPointerCancel(event: PointerEvent): void {
    if (event.pointerId !== this.pointerId) {
      return;
    }
    this.dragOffset.set(null);
    this.resetPointer();
  }

  private onClickCapture(event: MouseEvent): void {
    if (this.suppressNextClick) {
      this.suppressNextClick = false;
      event.preventDefault();
      event.stopPropagation();
    }
  }

  private withEdgeResistance(deltaX: number): number {
    const index = this.currentIndex();
    const pastStart = index === 0 && deltaX > 0;
    const pastEnd = index === this.slideCount() - 1 && deltaX < 0;
    return pastStart || pastEnd ? deltaX / EDGE_RESISTANCE : deltaX;
  }

  private releaseVelocity(event: PointerEvent): number {
    const samples = [...this.samples, { x: event.clientX, t: event.timeStamp }].filter(
      (sample) => event.timeStamp - sample.t <= VELOCITY_WINDOW,
    );
    const first = samples[0];
    const last = samples[samples.length - 1];
    const duration = last.t - first.t;
    return duration > 0 ? (last.x - first.x) / duration : 0;
  }

  private resetPointer(): void {
    this.pointerId = null;
    this.dragAxis = null;
    this.samples = [];
  }
}

function normalizeSlides(
  value: readonly (string | null | undefined)[] | null | undefined,
): string[] {
  return (value ?? []).filter(
    (slide): slide is string => typeof slide === 'string' && slide !== '',
  );
}

/** Builds a CSS `url()` value, escaping characters that could break out of the string. */
export function toCssUrl(url: string): string {
  return `url("${url.replace(/["\\]/g, '\\$&').replace(/[\n\r\f]/g, '')}")`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function range(start: number, length: number): number[] {
  return Array.from({ length }, (_, i) => start + i);
}

function listen<K extends keyof HTMLElementEventMap>(
  element: HTMLElement,
  type: K,
  listener: (event: HTMLElementEventMap[K]) => void,
  options: AddEventListenerOptions,
): () => void {
  element.addEventListener(type, listener, options);
  return () => element.removeEventListener(type, listener, options);
}
