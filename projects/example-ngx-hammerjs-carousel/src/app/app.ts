import { Component, computed, signal, viewChild } from '@angular/core';
import { HammerjsCarouselComponent } from 'ngx-hammerjs-carousel';
import libraryPackage from '../../../ngx-hammerjs-carousel/package.json';

type BackgroundSize = 'cover' | 'contain';

@Component({
  selector: 'app-root',
  imports: [HammerjsCarouselComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly version = libraryPackage.version;
  protected readonly installCommand = 'npm install ngx-hammerjs-carousel';
  protected readonly copied = signal<string | null>(null);

  // Hero
  protected readonly heroSlides = getSlides(8, 1600, 900, 10);
  protected readonly heroIndex = signal(0);
  private readonly heroCarousel = viewChild.required<HammerjsCarouselComponent>('hero');

  // Playground
  protected readonly slideCount = signal(12);
  protected readonly maxDots = signal(7);
  protected readonly showPaginationCount = signal(true);
  protected readonly lazyLoad = signal(true);
  protected readonly alwaysShowButtons = signal(false);
  protected readonly backgroundSize = signal<BackgroundSize>('cover');
  protected readonly dotColor = signal('#ffffff');
  protected readonly transitionMs = signal(400);
  protected readonly playgroundIndex = signal(0);
  protected readonly playgroundSlides = computed(() => getSlides(this.slideCount(), 1200, 800, 18));

  protected readonly playgroundTemplate = computed(() => {
    const attributes = ['[slides]="slides"', '[(activeIndex)]="index"'];
    if (this.maxDots() !== 15) {
      attributes.push(`[maxNumberOfVisibileInPagination]="${this.maxDots()}"`);
    }
    if (this.showPaginationCount()) {
      attributes.push('showPaginationCount');
    }
    if (!this.lazyLoad()) {
      attributes.push('[lazyLoad]="false"');
    }
    if (this.alwaysShowButtons()) {
      attributes.push('disableTouchdeviceEnhancements');
    }
    return `<hammerjs-carousel\n  ${attributes.join('\n  ')}\n/>`;
  });

  protected readonly playgroundStyles = computed(() => {
    const properties: string[] = [];
    if (this.backgroundSize() !== 'cover') {
      properties.push(`--hammerjs-carousel-background-size: ${this.backgroundSize()};`);
      properties.push('--hammerjs-carousel-background: #1d1d1f;');
    }
    if (this.dotColor() !== '#ffffff') {
      properties.push(`--hammerjs-carousel-dot-color: ${this.dotColor()};`);
    }
    if (this.transitionMs() !== 400) {
      properties.push(`--hammerjs-carousel-transition: ${this.transitionMs()}ms ease-out;`);
    }
    return properties.length ? `hammerjs-carousel {\n  ${properties.join('\n  ')}\n}` : null;
  });

  protected readonly playgroundStyleVars = computed(() => ({
    '--hammerjs-carousel-background-size': this.backgroundSize(),
    '--hammerjs-carousel-background': this.backgroundSize() === 'contain' ? '#1d1d1f' : null,
    '--hammerjs-carousel-dot-color': this.dotColor(),
    '--hammerjs-carousel-transition': `${this.transitionMs()}ms ease-out`,
  }));

  // Examples
  protected readonly smallSlides = getSlides(5, 600, 400, 28);
  protected readonly manySlides = getSlides(50, 800, 600, 10);
  protected readonly oneSlide = getSlides(1, 800, 600, 42);

  protected readonly standaloneSnippet = `import { Component } from '@angular/core';
import { HammerjsCarouselComponent } from 'ngx-hammerjs-carousel';

@Component({
  selector: 'app-gallery',
  imports: [HammerjsCarouselComponent],
  template: \`
    <div class="gallery">
      <hammerjs-carousel [slides]="slides" />
    </div>
  \`,
  styles: \`.gallery { aspect-ratio: 3 / 2; }\`,
})
export class GalleryComponent {
  slides = ['/images/1.jpg', '/images/2.jpg', '/images/3.jpg'];
}`;

  protected readonly moduleSnippet = `import { HammerjsCarouselModule } from 'ngx-hammerjs-carousel';

@NgModule({
  imports: [HammerjsCarouselModule],
})
export class AppModule {}`;

  protected previous(): void {
    this.heroCarousel().previousSlide();
  }

  protected next(): void {
    this.heroCarousel().nextSlide();
  }

  protected async copy(id: string, text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      this.copied.set(id);
      setTimeout(() => this.copied.update((current) => (current === id ? null : current)), 1500);
    } catch {
      // Clipboard not available (e.g. insecure context): ignore.
    }
  }

  protected numberValue(event: Event): number {
    return (event.target as HTMLInputElement).valueAsNumber;
  }

  protected checked(event: Event): boolean {
    return (event.target as HTMLInputElement).checked;
  }

  protected value(event: Event): string {
    return (event.target as HTMLInputElement | HTMLSelectElement).value;
  }
}

/** Photos from picsum.photos (Unsplash), ids 10-59 all exist. */
function getSlides(howMany: number, width: number, height: number, firstId: number): string[] {
  return Array.from(
    { length: howMany },
    (_, i) => `https://picsum.photos/id/${10 + ((firstId - 10 + i) % 50)}/${width}/${height}`,
  );
}
