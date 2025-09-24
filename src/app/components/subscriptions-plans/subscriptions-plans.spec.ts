import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionsPlans } from './subscriptions-plans';

describe('SubscriptionsPlans', () => {
  let component: SubscriptionsPlans;
  let fixture: ComponentFixture<SubscriptionsPlans>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscriptionsPlans]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubscriptionsPlans);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
