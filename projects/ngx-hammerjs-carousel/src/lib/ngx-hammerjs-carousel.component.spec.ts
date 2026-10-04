import { Component, NgModule, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HammerjsCarouselComponent, toCssUrl } from './ngx-hammerjs-carousel.component';
import { HammerjsCarouselModule } from './ngx-hammerjs-carousel.module';

const SLIDES = ['a.jpg', 'b.jpg', 'c.jpg', 'd.jpg', 'e.jpg'];

@Component({
  imports: [HammerjsCarouselComponent],
  template: `
    <hammerjs-carousel
      [slides]="slides()"
      [(activeIndex)]="index"
      [maxNumberOfVisibileInPagination]="maxDots()"
      [showPaginationCount]="showCount()"
      [lazyLoad]="lazy()"
      [disableTouchdeviceEnhancements]="disableTouch()"
    />
  `,
})
class HostComponent {
  readonly slides = signal<(string | null)[] | null | undefined>(SLIDES);
  readonly index = signal(0);
  readonly maxDots = signal(15);
  readonly showCount = signal(false);
  readonly lazy = signal(true);
  readonly disableTouch = signal(false);
}

describe('HammerjsCarouselComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let element: HTMLElement;
  let carousel: HammerjsCarouselComponent;

  async function setup(configure?: (host: HostComponent) => void) {
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideZonelessChangeDetection()],
    });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    configure?.(host);
    await fixture.whenStable();
    element = fixture.nativeElement.querySelector('hammerjs-carousel');
    carousel = fixture.debugElement.children[0].componentInstance;
  }

  const query = (selector: string) => element.querySelector<HTMLElement>(selector);
  const queryAll = (selector: string) =>
    Array.from(element.querySelectorAll<HTMLElement>(selector));
  const track = () => query('.slider')!;
  const dots = () => queryAll('.slider-page-button');
  const activeDotLabel = () =>
    dots()
      .find((dot) => dot.getAttribute('aria-current') === 'true')
      ?.getAttribute('aria-label');

  afterEach(() => vi.unstubAllGlobals());

  describe('rendering', () => {
    it('renders a panel per slide and sizes the track accordingly', async () => {
      await setup();
      expect(queryAll('.slider-panel').length).toBe(5);
      expect(track().style.width).toBe('500%');
      expect(track().style.transform).toBe('translate3d(0%, 0, 0)');
    });

    it.each([
      ['undefined', undefined],
      ['null', null],
      ['an empty array', []],
      ['only null entries', [null]],
    ])('renders nothing for %s', async (_, slides) => {
      await setup((h) => h.slides.set(slides));
      expect(query('.slider-wrapper')).toBeNull();
    });

    it('ignores null entries', async () => {
      await setup((h) => h.slides.set(['a.jpg', null, 'b.jpg']));
      expect(queryAll('.slider-panel').length).toBe(2);
    });

    it('hides buttons and pagination for a single slide', async () => {
      await setup((h) => h.slides.set(['a.jpg']));
      expect(queryAll('.slider-panel').length).toBe(1);
      expect(query('.slider-button')).toBeNull();
      expect(query('.slider-pagination')).toBeNull();
    });

    it('shows the pagination count when enabled', async () => {
      await setup((h) => h.showCount.set(true));
      expect(query('.slider-pagination-count')?.textContent).toBe('1/5');
      host.index.set(3);
      await fixture.whenStable();
      expect(query('.slider-pagination-count')?.textContent).toBe('4/5');
    });

    it('marks only the active slide as visible for assistive technology', async () => {
      await setup((h) => h.index.set(1));
      const hidden = queryAll('.slider-panel').map((panel) => panel.getAttribute('aria-hidden'));
      expect(hidden).toEqual(['true', null, 'true', 'true', 'true']);
    });
  });

  describe('navigation', () => {
    it('goes to the next and previous slide with the buttons, wrapping around', async () => {
      await setup();
      const [previous, next] = queryAll('.slider-button');

      previous.click();
      await fixture.whenStable();
      expect(host.index()).toBe(4);
      expect(track().style.transform).toBe('translate3d(-80%, 0, 0)');

      next.click();
      await fixture.whenStable();
      expect(host.index()).toBe(0);

      next.click();
      await fixture.whenStable();
      expect(host.index()).toBe(1);
    });

    it('goes to a slide with the pagination dots', async () => {
      await setup();
      dots()[3].click();
      await fixture.whenStable();
      expect(host.index()).toBe(3);
      expect(activeDotLabel()).toBe('Go to slide 4');
    });

    it('follows the two-way bound index', async () => {
      await setup((h) => h.index.set(2));
      expect(track().style.transform).toBe('translate3d(-40%, 0, 0)');
      expect(carousel.activeSlideIndex).toBe(2);
    });

    it('clamps the index when there are fewer slides than the index', async () => {
      await setup((h) => h.index.set(4));
      host.slides.set(['a.jpg', 'b.jpg']);
      await fixture.whenStable();
      expect(track().style.transform).toBe('translate3d(-50%, 0, 0)');
      expect(carousel.isActive('b.jpg')).toBe(true);
    });

    it('supports the public api', async () => {
      await setup();
      carousel.goToSlide('c.jpg');
      expect(host.index()).toBe(2);
      carousel.goToSlideIndex(99);
      expect(host.index()).toBe(4);
      carousel.goToSlideIndex(-5);
      expect(host.index()).toBe(0);
      carousel.goToSlide('unknown.jpg');
      expect(host.index()).toBe(0);
    });

    it('supports keyboard navigation', async () => {
      await setup();
      const wrapper = query('.slider-wrapper')!;
      const press = async (key: string) => {
        wrapper.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
        await fixture.whenStable();
      };
      await press('ArrowRight');
      expect(host.index()).toBe(1);
      await press('End');
      expect(host.index()).toBe(4);
      await press('ArrowLeft');
      expect(host.index()).toBe(3);
      await press('Home');
      expect(host.index()).toBe(0);
    });
  });

  describe('pagination window', () => {
    const visibleDots = () =>
      dots().map((dot) => Number(dot.getAttribute('aria-label')!.split(' ').pop()));

    it('limits the number of dots and keeps one dot ahead of the active slide', async () => {
      const slides = Array.from({ length: 20 }, (_, i) => `${i}.jpg`);
      await setup((h) => {
        h.slides.set(slides);
        h.maxDots.set(5);
      });
      expect(visibleDots()).toEqual([1, 2, 3, 4, 5]);

      host.index.set(4);
      await fixture.whenStable();
      expect(visibleDots()).toEqual([2, 3, 4, 5, 6]);

      host.index.set(19);
      await fixture.whenStable();
      expect(visibleDots()).toEqual([16, 17, 18, 19, 20]);
      expect(activeDotLabel()).toBe('Go to slide 20');
    });

    it('handles duplicate slide urls by index', async () => {
      await setup((h) => h.slides.set(['same.jpg', 'same.jpg', 'same.jpg']));
      dots()[2].click();
      await fixture.whenStable();
      expect(activeDotLabel()).toBe('Go to slide 3');
    });
  });

  describe('lazy loading', () => {
    const backgrounds = () =>
      queryAll('.slider-panel').map((panel) => panel.style.backgroundImage || null);

    it('loads the active slide and its neighbours', async () => {
      await setup();
      expect(backgrounds()).toEqual(['url("a.jpg")', 'url("b.jpg")', null, null, 'url("e.jpg")']);

      host.index.set(2);
      await fixture.whenStable();
      expect(backgrounds()).toEqual([
        'url("a.jpg")',
        'url("b.jpg")',
        'url("c.jpg")',
        'url("d.jpg")',
        'url("e.jpg")',
      ]);
    });

    it('waits until the carousel scrolls into view', async () => {
      let callback!: IntersectionObserverCallback;
      vi.stubGlobal(
        'IntersectionObserver',
        class {
          constructor(cb: IntersectionObserverCallback) {
            callback = cb;
          }
          observe() {}
          disconnect() {}
        },
      );
      await setup();
      expect(backgrounds().every((background) => background === null)).toBe(true);

      callback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
      await fixture.whenStable();
      expect(backgrounds()[0]).toBe('url("a.jpg")');
    });

    it('loads everything when lazy loading is disabled', async () => {
      await setup((h) => h.lazy.set(false));
      expect(backgrounds().every((background) => background !== null)).toBe(true);
    });
  });

  describe('touch devices', () => {
    function stubTouchOnly() {
      vi.stubGlobal('matchMedia', (query: string) => ({ matches: query.includes('hover: none') }));
    }

    it('hides the buttons on touch-only devices', async () => {
      stubTouchOnly();
      await setup();
      expect(query('.slider-button')).toBeNull();
      expect(query('.slider-pagination')).not.toBeNull();
    });

    it('shows the buttons when touch enhancements are disabled', async () => {
      stubTouchOnly();
      await setup((h) => h.disableTouch.set(true));
      expect(queryAll('.slider-button').length).toBe(2);
    });
  });

  describe('swiping', () => {
    const WIDTH = 500;

    function pointer(type: string, clientX: number, clientY = 0, timeStamp?: number) {
      const event = new PointerEvent(type, {
        clientX,
        clientY,
        pointerId: 1,
        isPrimary: true,
        pointerType: 'touch',
        bubbles: true,
        cancelable: true,
      });
      if (timeStamp !== undefined) {
        Object.defineProperty(event, 'timeStamp', { value: timeStamp });
      }
      element.dispatchEvent(event);
    }

    async function swipe(points: [x: number, t: number][], y = 0) {
      const [[startX, startT], ...rest] = points;
      pointer('pointerdown', startX, 0, startT);
      for (const [x, t] of rest.slice(0, -1)) {
        pointer('pointermove', x, y, t);
      }
      const [endX, endT] = rest[rest.length - 1];
      pointer('pointermove', endX, y, endT);
      pointer('pointerup', endX, y, endT);
      await fixture.whenStable();
    }

    beforeEach(async () => {
      await setup((h) => h.index.set(2));
      Object.defineProperty(element, 'clientWidth', { value: WIDTH });
    });

    it('follows the finger while dragging', async () => {
      pointer('pointerdown', 300);
      pointer('pointermove', 250);
      await fixture.whenStable();
      expect(track().style.transform).toBe('translate3d(calc(-40% + -50px), 0, 0)');
      expect(track().classList).toContain('is-dragging');
      expect(track().classList).not.toContain('is-animating');
    });

    it('goes to the next slide after a long drag to the left', async () => {
      await swipe([
        [400, 0],
        [300, 500],
        [250, 1000],
      ]);
      expect(host.index()).toBe(3);
      expect(track().style.transform).toBe('translate3d(-60%, 0, 0)');
      expect(track().classList).toContain('is-animating');
    });

    it('goes to the previous slide after a long drag to the right', async () => {
      await swipe([
        [100, 0],
        [200, 500],
        [250, 1000],
      ]);
      expect(host.index()).toBe(1);
    });

    it('snaps back after a short, slow drag', async () => {
      await swipe([
        [300, 0],
        [280, 500],
        [260, 1000],
      ]);
      expect(host.index()).toBe(2);
      expect(track().style.transform).toBe('translate3d(-40%, 0, 0)');
    });

    it('goes to the next slide after a short flick', async () => {
      await swipe([
        [300, 0],
        [280, 20],
        [260, 40],
      ]);
      expect(host.index()).toBe(3);
    });

    it('ignores vertical scrolling', async () => {
      pointer('pointerdown', 300, 0);
      pointer('pointermove', 290, 80);
      pointer('pointermove', 100, 120);
      pointer('pointerup', 100, 120);
      await fixture.whenStable();
      expect(host.index()).toBe(2);
      expect(track().style.transform).toBe('translate3d(-40%, 0, 0)');
    });

    it('applies resistance when dragging past the first slide', async () => {
      host.index.set(0);
      await fixture.whenStable();
      pointer('pointerdown', 100);
      pointer('pointermove', 400);
      await fixture.whenStable();
      expect(track().style.transform).toBe('translate3d(calc(0% + 100px), 0, 0)');
      pointer('pointerup', 400);
      await fixture.whenStable();
      expect(host.index()).toBe(0);
    });

    it('restores the position when the pointer is cancelled', async () => {
      pointer('pointerdown', 300);
      pointer('pointermove', 100);
      pointer('pointercancel', 100);
      await fixture.whenStable();
      expect(host.index()).toBe(2);
      expect(track().style.transform).toBe('translate3d(-40%, 0, 0)');
    });

    it('does not trigger the buttons with the click that ends a drag', async () => {
      await swipe([
        [400, 0],
        [300, 500],
        [250, 1000],
      ]);
      query('.slider-button.right')!.click();
      await fixture.whenStable();
      expect(host.index()).toBe(3);

      // The next click works again.
      query('.slider-button.right')!.click();
      await fixture.whenStable();
      expect(host.index()).toBe(4);
    });

    it('does not swipe with a single slide', async () => {
      host.slides.set(['a.jpg']);
      await fixture.whenStable();
      pointer('pointerdown', 300);
      pointer('pointermove', 100);
      await fixture.whenStable();
      expect(track().style.transform).toBe('translate3d(0%, 0, 0)');
    });
  });

  it('escapes urls so they cannot break out of the CSS string', () => {
    expect(toCssUrl('https://example.com/a b.jpg')).toBe('url("https://example.com/a b.jpg")');
    expect(toCssUrl('x.jpg"); background: red; ("')).toBe(
      'url("x.jpg\\"); background: red; (\\"")',
    );
    expect(toCssUrl('a\\b\nc')).toBe('url("a\\\\bc")');
  });
});

describe('HammerjsCarouselModule (backwards compatibility)', () => {
  @Component({
    selector: 'test-module-host',
    template: '<hammerjs-carousel [slides]="slides" />',
    standalone: false,
  })
  class ModuleHostComponent {
    slides = ['a.jpg', 'b.jpg'];
  }

  @NgModule({
    declarations: [ModuleHostComponent],
    imports: [HammerjsCarouselModule],
  })
  class TestModule {}

  it('can be used from an NgModule', async () => {
    TestBed.configureTestingModule({
      imports: [TestModule],
      providers: [provideZonelessChangeDetection()],
    });
    const fixture = TestBed.createComponent(ModuleHostComponent);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('.slider-panel').length).toBe(2);
  });
});
