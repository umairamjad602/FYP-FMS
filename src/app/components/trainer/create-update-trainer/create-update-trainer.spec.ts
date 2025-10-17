import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateUpdateTrainer } from './create-update-trainer';

describe('CreateUpdateTrainer', () => {
  let component: CreateUpdateTrainer;
  let fixture: ComponentFixture<CreateUpdateTrainer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateUpdateTrainer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateUpdateTrainer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
