import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HammerjsCarouselComponent } from './ngx-hammerjs-carousel.component';

describe('NgxHammerjsCarouselComponent', () => {
  let component: HammerjsCarouselComponent;
  let fixture: ComponentFixture<HammerjsCarouselComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HammerjsCarouselComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HammerjsCarouselComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
