import { TestBed } from '@angular/core/testing';

import { NgxHammerjsCarouselService } from './ngx-hammerjs-carousel.service';

describe('NgxHammerjsCarouselService', () => {
  let service: NgxHammerjsCarouselService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxHammerjsCarouselService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
