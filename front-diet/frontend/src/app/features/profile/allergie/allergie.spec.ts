import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Allergie } from './allergie';

describe('Allergie', () => {
  let component: Allergie;
  let fixture: ComponentFixture<Allergie>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Allergie]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Allergie);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
