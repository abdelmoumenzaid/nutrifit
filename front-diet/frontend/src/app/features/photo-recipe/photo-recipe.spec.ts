import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhotoRecipe } from './photo-recipe';

describe('PhotoRecipe', () => {
  let component: PhotoRecipe;
  let fixture: ComponentFixture<PhotoRecipe>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhotoRecipe]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhotoRecipe);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
