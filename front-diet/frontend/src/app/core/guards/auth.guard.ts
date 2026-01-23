import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * 🔐 AuthGuard - Protège les routes authentifiées
 * ✅ Exclut /auth-landing de la protection
 * ✅ Exclut /callback de la protection (Keycloak callback)
 * ✅ Exclut /login de la protection
 * ✅ Laisse les routes publiques ouvertes
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 🟢 Routes publiques (pas besoin d'authentification)
  const publicRoutes = ['/auth-landing', '/callback', '/login'];
  
  // ✅ Si on accède à une route publique, laisser passer
  if (publicRoutes.some(publicRoute => state.url.startsWith(publicRoute))) {
    console.log(`✅ Route publique autorisée: ${state.url}`);
    return true;
  }

  // 🔐 Si on accède à une route protégée, vérifier l'authentification
  if (authService.isAuthenticated()) {
    console.log(`✅ Utilisateur authentifié - accès autorisé: ${state.url}`);
    return true;
  }

  // ❌ Pas authentifié + route protégée → rediriger vers login Keycloak
  console.warn(`⚠️ Accès refusé - redirection vers Keycloak: ${state.url}`);
  authService.login();
  return false;
};



// import { inject } from '@angular/core';
// import { CanActivateFn, Router } from '@angular/router';
// import { AuthService } from '../services/auth.service';

// export const authGuard: CanActivateFn = () => {
//   const authService = inject(AuthService);
//   const router = inject(Router);

//   if (authService.isAuthenticated()) {
//     return true; // ✅ Accès autorisé
//   } else {
//     console.log('🔒 Non authentifié - Redirection login');
//     authService.login(); // Redirige vers Keycloak
//     return false;
//   }
// };
