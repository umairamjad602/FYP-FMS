import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkoutPlans } from './workout-plans';

describe('WorkoutPlans', () => {
  let component: WorkoutPlans;
  let fixture: ComponentFixture<WorkoutPlans>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkoutPlans]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkoutPlans);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
