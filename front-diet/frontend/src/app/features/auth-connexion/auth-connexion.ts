import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';


@Component({
  selector: 'app-auth-connexion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth-connexion.html',
  styleUrls: ['./auth-connexion.css']
})
export class AuthConnexionComponent implements OnInit, OnDestroy {
  // Form state
  email: string = '';
  password: string = '';
  rememberMe: boolean = false;
  
  // UI state
  loading: boolean = false;
  error: string = '';
  success: string = '';

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Si l'utilisateur est déjà connecté, rediriger
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  /**
   * ✅ Login avec Keycloak OAuth2
   */
  loginWithKeycloak(): void {
    console.log('🔐 Initiating Keycloak login...');
    this.authService.login();
  }

  /**
   * ✅ Login direct avec email/mot de passe
   */
  loginDirect(): void {
    if (!this.email || !this.password) {
      this.error = 'Veuillez entrer votre email et mot de passe';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    this.authService
      .loginDirect(this.email, this.password)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          console.log('✅ Login successful', response);
          
          // Sauvegarder les tokens
          this.authService.saveToken(
            response.access_token,
            response.refresh_token,
            response.id_token
          );

          // Sauvegarder l'option "Se souvenir de moi"
          if (this.rememberMe) {
            localStorage.setItem('rememberMe', 'true');
            localStorage.setItem('rememberedEmail', this.email);
          } else {
            localStorage.removeItem('rememberMe');
            localStorage.removeItem('rememberedEmail');
          }

          this.success = 'Connexion réussie!';
          this.loading = false;

          // Rediriger après 1s
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 1000);
        },
        error: (error: any) => {
          console.error('❌ Login failed:', error);
          this.error = 
            error?.error?.message || 
            'Email ou mot de passe incorrect. Veuillez réessayer.';
          this.loading = false;
        }
      });
  }

  /**
   * ✅ Récupérer l'email sauvegardé (si "Se souvenir de moi" était coché)
   */
  loadRememberedEmail(): void {
    const remembered = localStorage.getItem('rememberMe');
    const email = localStorage.getItem('rememberedEmail');
    
    if (remembered && email) {
      this.email = email;
      this.rememberMe = true;
    }
  }

  /**
   * ✅ Mot de passe oublié
   */
  /**
 * ✅ Mot de passe oublié
 */
forgotPassword(): void {
  if (!this.email) {
    this.error = 'Veuillez entrer votre email';
    return;
  }

  // TODO: Implémenter après
  this.error = 'Fonctionnalité à venir. Contactez le support.';
  
  // Ou simplement afficher un message:
  // this.success = 'Un lien de réinitialisation a été envoyé à ' + this.email;
}


  /**
   * ✅ Aller vers créer un compte
   */
  goToRegister(): void {
    this.router.navigate(['/auth-register']);
  }

  /**
   * ✅ Retour à l'accueil
   */
  goBackToLanding(): void {
    this.router.navigate(['/auth-landing']);
  }

  /**
   * ✅ Changer la langue
   */
  setLanguage(lang: string): void {
    console.log('Langue changée en:', lang);
    // TODO: Implémenter le changement de langue
    // this.translateService.use(lang);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
