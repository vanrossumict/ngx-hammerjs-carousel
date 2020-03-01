import { TestBed } from '@angular/core/testing';

import { GestureConfigService } from './gesture-config.service';

describe('GestureConfigService', () => {
  let service: GestureConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GestureConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
