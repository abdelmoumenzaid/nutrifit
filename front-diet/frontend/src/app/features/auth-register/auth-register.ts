import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-auth-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth-register.html',
  styleUrls: ['./auth-register.css']
})
export class AuthRegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  formData = {
    email: '',
    password: '',
    passwordConfirm: '',
    firstName: '',
    lastName: ''
  };

  loading = false;
  error = '';
  success = '';

  register() {
    console.log('✅ register() clicked');

    // 1. Validation
    if (!this.formData.email || !this.formData.password) {
      this.error = 'Email et mot de passe requis';
      return;
    }

    if (this.formData.password !== this.formData.passwordConfirm) {
      this.error = 'Les mots de passe ne correspondent pas';
      return;
    }

    if (this.formData.password.length < 8) {
      this.error = 'Le mot de passe doit contenir au moins 8 caractères';
      return;
    }

    // 2. Clear previous errors
    this.error = '';
    this.success = '';
    this.loading = true;

    // 3. Call backend
    this.authService.registerCustom(
      this.formData.email,
      this.formData.firstName,
      this.formData.lastName,
      this.formData.password
    ).subscribe({
      next: (response) => {
        console.log('✅ Registration successful:', response);
        this.success = 'Inscription réussie! Connexion automatique...';
        this.loading = false;

        // ✅ AUTO-LOGIN après enregistrement
        this.authService.loginDirect(
          this.formData.email,
          this.formData.password
        ).subscribe({
          next: (loginResponse) => {
            console.log('✅ Auto-login successful:', loginResponse);
            
            // Sauvegarder les tokens
            this.authService.saveToken(
              loginResponse.access_token,
              loginResponse.refresh_token,
              loginResponse.id_token
            );

            // ✅ Rediriger vers DASHBOARD après 1 seconde
            setTimeout(() => {
              this.router.navigate(['/dashboard']);
            }, 1000);
          },
          error: (loginError) => {
            console.error('❌ Auto-login failed:', loginError);
            // Même si le login échoue, rediriger vers dashboard
            // (l'utilisateur peut se reconnecter)
            setTimeout(() => {
              this.router.navigate(['/auth-connexion']);
            }, 2000);
          }
        });
      },
      error: (error) => {
        console.error('❌ Registration error:', error);
        this.error = error.error?.message || 'Erreur lors de l\'inscription';
        this.loading = false;
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/auth-connexion']);
  }
}
