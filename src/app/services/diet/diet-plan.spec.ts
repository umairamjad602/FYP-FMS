import { TestBed } from '@angular/core/testing';

import { DietPlan } from './diet-plan';

describe('DietPlan', () => {
  let service: DietPlan;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DietPlan);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
