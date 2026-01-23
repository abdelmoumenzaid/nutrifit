import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthConnexion } from './auth-connexion';

describe('AuthConnexion', () => {
  let component: AuthConnexion;
  let fixture: ComponentFixture<AuthConnexion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthConnexion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthConnexion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
