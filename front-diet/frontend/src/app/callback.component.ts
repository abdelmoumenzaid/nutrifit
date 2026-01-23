import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { CommonModule } from '@angular/common';

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
}

@Component({
  selector: 'app-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="callback-container">
      <div class="spinner"></div>
      <p>{{ message }}</p>
    </div>
  `,
  styles: [`
    .callback-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-family: Arial, sans-serif;
    }

    .spinner {
      border: 4px solid rgba(255, 255, 255, 0.3);
      border-top: 4px solid white;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      animation: spin 1s linear infinite;
      margin-bottom: 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    p {
      font-size: 18px;
      text-align: center;
    }
  `]
})
export class CallbackComponent implements OnInit {
  message = 'Traitement du callback Keycloak...';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // 🔍 ÉTAPE 1 : Récupérer le code et les erreurs
    const code = this.route.snapshot.queryParams['code'];
    const error = this.route.snapshot.queryParams['error'];
    const errorDescription = this.route.snapshot.queryParams['error_description'];

    console.log('✅ CallbackComponent - Traitement du callback...');
    console.log('Code reçu:', code ? 'OUI ✓' : 'NON ✗');

    // ❌ ERREUR KEYCLOAK
    if (error) {
      console.error('❌ Erreur Keycloak:', error, errorDescription);
      this.message = `Erreur: ${error}`;
      
      setTimeout(() => {
        this.router.navigate(['/auth-landing']);
      }, 3000);
      return;
    }

    // ❌ CODE MANQUANT
    if (!code) {
      console.error('❌ Pas de code d\'autorisation reçu');
      this.message = 'Erreur: Code d\'autorisation manquant';
      
      setTimeout(() => {
        this.router.navigate(['/auth-landing']);
      }, 3000);
      return;
    }

    // ✅ ÉTAPE 2 : Échanger le code contre un token
    console.log('✅ Échange du code contre un token...');
    this.authService.handleCallback(code).subscribe({
      next: (response: TokenResponse) => {
        console.log('✅ Token reçu avec succès');
        console.log('Access Token présent:', response.access_token ? '✓' : '✗');
        console.log('Refresh Token présent:', response.refresh_token ? '✓' : '✗');

        // ✅ ÉTAPE 3 : Vérifier que le token existe
        if (!response.access_token) {
          console.error('❌ Pas de access_token dans la réponse');
          this.message = 'Erreur: Token non reçu';
          
          setTimeout(() => {
            this.router.navigate(['/auth-landing']);
          }, 3000);
          return;
        }

        // ✅ ÉTAPE 4 : Sauvegarder TOUS les tokens via authService
        console.log('✅ Sauvegarde des tokens dans localStorage...');
        this.authService.saveToken(
          response.access_token,
          response.refresh_token || '',
          response.id_token || ''
        );

        // ✅ ÉTAPE 5 : Vérifier immédiatement que c'est sauvegardé
        const savedToken = localStorage.getItem('access_token');
        if (savedToken) {
          console.log('✅ Token vérifié dans localStorage');
          console.log('Longueur du token:', savedToken.length);
          console.log('Parties du token:', savedToken.split('.').length);
        } else {
          console.error('❌ ERREUR: Token pas sauvegardé!');
          this.message = 'Erreur: Sauvegarde du token échouée';
          
          setTimeout(() => {
            this.router.navigate(['/auth-landing']);
          }, 3000);
          return;
        }

        // ✅ ÉTAPE 6 : Redirection vers dashboard
        this.message = 'Authentification réussie! Redirection...';
        console.log('🚀 Redirection vers /dashboard');
        
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 500);
      },
      error: (err) => {
        console.error('❌ Erreur lors de l\'échange du code:', err);
        console.error('Détails:', err.error || err.message);
        this.message = `Erreur d'authentification: ${err.error?.error || err.message || 'Erreur inconnue'}`;
        
        setTimeout(() => {
          this.router.navigate(['/auth-landing']);
        }, 3000);
      }
    });
  }
}
