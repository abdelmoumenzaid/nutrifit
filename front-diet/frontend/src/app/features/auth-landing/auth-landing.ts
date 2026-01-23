import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-auth-landing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth-landing.html',
  styleUrls: ['./auth-landing.css']
})
export class AuthLandingComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Si déjà connecté, aller au dashboard
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  /**
   * ✅ Aller vers la page d'inscription
   */
  goToRegister(): void {
    this.router.navigate(['/auth-register']);
  }

  /**
   * ✅ Aller vers la page de connexion
   */
  goToConnexion(): void {
    this.router.navigate(['/auth-connexion']);
  }

  /**
   * ✅ Changer la langue
   */
  setLanguage(lang: string): void {
    console.log('Langue changée en:', lang);
    // TODO: Implémenter le changement de langue
    // this.translateService.use(lang);
  }
}
