import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DietPlans } from './diet-plans';

describe('DietPlans', () => {
  let component: DietPlans;
  let fixture: ComponentFixture<DietPlans>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DietPlans]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DietPlans);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
