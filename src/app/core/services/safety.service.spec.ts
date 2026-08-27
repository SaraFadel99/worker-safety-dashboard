import { TestBed } from '@angular/core/testing';

import { SafetyService } from './safety.service';

describe('SafetyService', () => {
  let service: SafetyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SafetyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
