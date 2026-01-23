import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanJour } from './plan-jour';

describe('PlanJour', () => {
  let component: PlanJour;
  let fixture: ComponentFixture<PlanJour>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanJour]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanJour);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
