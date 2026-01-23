import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthLandingComponent } from './auth-landing';

describe('AuthLandingComponent', () => {
  let component: AuthLandingComponent;
  let fixture: ComponentFixture<AuthLandingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthLandingComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AuthLandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
