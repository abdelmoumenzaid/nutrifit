import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMealComponent } from './add-meal';

describe('AddMeal', () => {
  let component: AddMealComponent;
  let fixture: ComponentFixture<AddMealComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddMealComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddMealComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
