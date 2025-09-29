import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateUpdateMember } from './create-update-member';

describe('CreateUpdateMember', () => {
  let component: CreateUpdateMember;
  let fixture: ComponentFixture<CreateUpdateMember>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateUpdateMember]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateUpdateMember);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
