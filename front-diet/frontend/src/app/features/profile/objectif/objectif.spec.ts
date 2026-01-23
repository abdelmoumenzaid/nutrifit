import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Objectif } from './objectif';

describe('Objectif', () => {
  let component: Objectif;
  let fixture: ComponentFixture<Objectif>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Objectif]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Objectif);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
