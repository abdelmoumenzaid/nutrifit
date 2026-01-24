import { Injectable } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * 🔐 HTTP Interceptor pour ajouter le JWT token automatiquement
 * À ajouter dans app.config.ts avec provideHttpClient(withInterceptors([authInterceptor]))
 */
export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  // ✅ SEULEMENT ajouter le token aux requêtes BACKEND
  if (req.url.startsWith(environment.apiUrl)) {
    const token = localStorage.getItem('access_token');

    if (token) {
      const clonedReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(`🔐 Token ajouté à: ${req.url}`);
      return next(clonedReq);
    } else {
      console.log(`⏭️ Pas de token pour: ${req.url}`);
    }
  } else {
    console.log(`⏭️ Requête externe (pas de token): ${req.url}`);
  }

  return next(req);
};
