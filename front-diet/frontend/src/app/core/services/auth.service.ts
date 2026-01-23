import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

export interface User {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  name?: string;
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenSubject = new BehaviorSubject<string | null>(null);
  public token$ = this.tokenSubject.asObservable();

  private readonly KEYCLOAK_URL = 'http://localhost:8082/realms/diet-realm';
  private readonly CLIENT_ID = 'angular-frontend';
  private readonly CLIENT_SECRET = 'jQAK320a2V6WRWXsEh6Z84LrNRGhaoR0';
  private readonly FRONTEND_URL = 'http://localhost:4200';
  private readonly BACKEND_URL = 'http://localhost:8081/api/public/auth';

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // ✅ Charger le token depuis localStorage au démarrage
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('access_token');
      if (token) {
        this.tokenSubject.next(token);
        console.log('✅ AuthService init: Token chargé depuis localStorage');
      } else {
        console.log('⚠️ AuthService init: Pas de token');
      }
    }
  }

  // ============ REGISTER ============
  registerCustom(
    email: string,
    firstName: string,
    lastName: string,
    password: string
  ): Observable<any> {
    const body = {
      email,
      firstName,
      lastName,
      password
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    console.log('📤 Sending registration request:', body);
    return this.http.post(`${this.BACKEND_URL}/register`, body, { headers });
  }

  // ============ LOGIN KEYCLOAK ============
  login() {
    const params = new URLSearchParams({
      client_id: this.CLIENT_ID,
      redirect_uri: `${this.FRONTEND_URL}/callback`,
      response_type: 'code',
      scope: 'openid profile email'
    });

    console.log('🔐 Redirection vers Keycloak...');
    window.location.href = `${this.KEYCLOAK_URL}/protocol/openid-connect/auth?${params}`;
  }

  // ============ LOGIN DIRECT ============
  loginDirect(email: string, password: string): Observable<any> {
    const body = { email, password };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    console.log('📤 Sending login request:', body);
    return this.http.post(`${this.BACKEND_URL}/login`, body, { headers });
  }

  // ============ HANDLE CALLBACK ============
  /**
   * ✅ Exchange authorization code for access token
   * Appelé depuis CallbackComponent après redirection Keycloak
   */
  handleCallback(code: string): Observable<any> {
    console.log('🔄 AuthService.handleCallback() - Échange du code:', code.substring(0, 20) + '...');

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: this.CLIENT_ID,
      code: code,
      redirect_uri: `${this.FRONTEND_URL}/callback`
    });

    if (this.CLIENT_SECRET) {
      body.append('client_secret', this.CLIENT_SECRET);
    }

    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };

    return this.http.post<{
      access_token: string;
      refresh_token?: string;
      id_token?: string;
    }>(`${this.KEYCLOAK_URL}/protocol/openid-connect/token`, body, { headers });
  }

  // ============ SAVE TOKEN ============
  /**
   * ✅ Sauvegarder les tokens dans localStorage et BehaviorSubject
   * C'est LA méthode critique qui doit être appelée après handleCallback
   */
  saveToken(
    accessToken: string,
    refreshToken: string = '',
    idToken: string = '',
    user?: User
  ): void {
    console.log('💾 AuthService.saveToken() - Sauvegarde des tokens');

    // ❌ Vérifier que accessToken existe
    if (!accessToken) {
      console.error('❌ ERREUR: accessToken est vide!');
      return;
    }

    // ✅ Sauvegarder dans localStorage SEULEMENT en browser
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.setItem('access_token', accessToken);
        console.log('✅ access_token sauvegardé dans localStorage');

        if (refreshToken) {
          localStorage.setItem('refresh_token', refreshToken);
          console.log('✅ refresh_token sauvegardé dans localStorage');
        }

        if (idToken) {
          localStorage.setItem('id_token', idToken);
          console.log('✅ id_token sauvegardé dans localStorage');
        }

        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
          console.log('✅ user sauvegardé dans localStorage');
        }

        // ✅ Vérification immédiate
        const saved = localStorage.getItem('access_token');
        if (saved) {
          console.log('✅ Vérification localStorage OK');
          console.log('Token length:', saved.length);
          console.log('Token parts:', saved.split('.').length);
        } else {
          console.error('❌ ERREUR: Token pas trouvé après sauvegarde!');
        }

      } catch (error) {
        console.error('❌ ERREUR lors de la sauvegarde dans localStorage:', error);
      }
    }

    // ✅ Mettre à jour le BehaviorSubject (pour les services)
    this.tokenSubject.next(accessToken);
    console.log('✅ tokenSubject mis à jour');
  }

  // ============ LOGOUT ============
  logout() {
    console.log('🚪 AuthService.logout()');

    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('id_token');
      localStorage.removeItem('user');
      console.log('✅ Tokens supprimés de localStorage');
    }

    this.tokenSubject.next(null);
    this.router.navigate(['/auth-landing']);
  }

  // ============ TOKEN MANAGEMENT ============
  /**
   * ✅ Get current access token
   */
  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('access_token');
      if (token) {
        return token;
      }
    }
    return this.tokenSubject.value;
  }

  /**
   * ✅ Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      console.log('❌ isAuthenticated(): Pas de token');
      return false;
    }

    // Vérifier que le token a 3 parties
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('❌ isAuthenticated(): Token invalide (', parts.length, 'parties)');
      return false;
    }

    console.log('✅ isAuthenticated(): OUI');
    return true;
  }

  /**
   * ✅ Get HTTP headers with JWT token
   */
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
  }

  /**
   * ✅ Check if user has specific role (from JWT token)
   */
  hasRole(role: string): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const roles = payload.realm_access?.roles || [];
      return roles.includes(role);
    } catch (e) {
      console.error('❌ Error parsing token roles:', e);
      return false;
    }
  }

  /**
   * ✅ Refresh access token using refresh token
   */
  refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem('refresh_token');

    if (!refreshToken) {
      return new Observable((observer) => {
        observer.error(new Error('No refresh token available'));
      });
    }

    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: this.CLIENT_ID,
      refresh_token: refreshToken
    });

    if (this.CLIENT_SECRET) {
      body.append('client_secret', this.CLIENT_SECRET);
    }

    return this.http.post<{ access_token: string; refresh_token?: string }>(
      `${this.KEYCLOAK_URL}/protocol/openid-connect/token`,
      body,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
  }

  // ============ USER MANAGEMENT ============
  /**
   * ✅ Get current user from localStorage or JWT token
   */
  getCurrentUser(): User | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    try {
      // Option 1: Try to get user from localStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          console.log('👤 User from localStorage:', user);
          return user;
        } catch (e) {
          console.warn('⚠️ Error parsing stored user:', e);
        }
      }

      // Option 2: Decode user from JWT token
      const token = this.getToken();
      if (!token) {
        console.warn('⚠️ getCurrentUser(): No token found');
        return null;
      }

      // Validate token structure
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.error('❌ getCurrentUser(): Invalid token structure');
        return null;
      }

      // Decode payload
      const payload = this.decodeTokenPayload(parts[1]);
      if (!payload) {
        console.error('❌ getCurrentUser(): Could not decode token payload');
        return null;
      }

      // Check if token is expired
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        console.warn('⚠️ getCurrentUser(): Token is expired');
        return null;
      }

      const user: User = {
        id: payload.sub,
        email: payload.email,
        firstName: payload.given_name,
        lastName: payload.family_name,
        name: payload.name || payload.preferred_username,
        preferred_username: payload.preferred_username,
        given_name: payload.given_name,
        family_name: payload.family_name
      };

      console.log('👤 User from JWT token:', user);
      return user;
    } catch (error) {
      console.error('❌ Error getting current user:', error);
      return null;
    }
  }

  /**
   * ✅ Helper: Safely decode JWT payload
   */
  private decodeTokenPayload(encodedPayload: string): any {
    try {
      let decoded = encodedPayload;

      // Add padding if missing
      const padding = 4 - (decoded.length % 4);
      if (padding !== 4) {
        decoded += '='.repeat(padding);
      }

      // Decode from base64
      const jsonPayload = atob(decoded);
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('❌ Error decoding token payload:', error);
      return null;
    }
  }

  /**
   * ✅ Get user's first name (with fallback)
   */
  getUserFirstName(): string {
    const user = this.getCurrentUser();

    return (
      user?.firstName ||
      user?.given_name ||
      user?.name?.split(' ')[0] ||
      user?.preferred_username ||
      'Utilisateur'
    );
  }

  /**
   * ✅ Get user's full name (with fallback)
   */
  getUserFullName(): string {
    const user = this.getCurrentUser();

    if (!user) {
      return 'Utilisateur';
    }

    const firstName = user.firstName || user.given_name || '';
    const lastName = user.lastName || user.family_name || '';

    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }

    return user.name || user.preferred_username || 'Utilisateur';
  }

  /**
   * ✅ Get user's email (with fallback)
   */
  getUserEmail(): string | null {
    const user = this.getCurrentUser();
    return user?.email || null;
  }

  /**
   * ✅ Check if token is valid
   */
  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;

      const payload = this.decodeTokenPayload(parts[1]);
      if (!payload) return false;

      // Check expiration
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }
}
