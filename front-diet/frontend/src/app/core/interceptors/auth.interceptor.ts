import { Injectable } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { inject } from '@angular/core';

/**
 * 🔐 HTTP Interceptor pour ajouter le JWT token automatiquement
 * À ajouter dans app.config.ts avec provideHttpClient(withInterceptors([authInterceptor]))
 */
export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  // Ne pas ajouter le token si c'est une requête à Keycloak lui-même
  if (
    req.url.includes('/auth/') ||
    req.url.includes('/login') ||
    req.url.includes('keycloak') ||
    req.url.includes('/public/auth') ||
    req.url.includes('/realms/')
  ) {
    console.log(`⏭️ Keycloak request - pas de token ajouté: ${req.url}`);
    return next(req);
  }

  // Récupérer le token du localStorage
  const token = localStorage.getItem('access_token');

  // Ajouter le JWT à toutes les autres requêtes
  if (token) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(`✅ Token ajouté à la requête: ${req.url}`);
    return next(clonedReq);
  }

  console.warn(`⚠️ Pas de token trouvé pour: ${req.url}`);
  return next(req);
};
