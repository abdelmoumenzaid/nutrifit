import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';


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


  // ✅ CORRECTED: Utilise environment pour les URLs
  private readonly KEYCLOAK_URL = `${environment.keycloak.url}/realms/${environment.keycloak.realm}`;
  private readonly CLIENT_ID = environment.keycloak.clientId;
  private readonly FRONTEND_URL = environment.frontendUrl;  // ✅ FIX: utilise environment
  private readonly BACKEND_URL = `${environment.apiUrl}auth`;  // ✅ FIX: utilise environment


  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // ✅ SIMPLEMENT charger le token
    this.loadTokenFromStorage();
  }


  /**
   * ✅ Load token from localStorage
   * (Keycloak est déjà initialisé par APP_INITIALIZER dans app.config.ts)
   */
  private loadTokenFromStorage(): void {
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
  handleCallback(code: string): Observable<any> {
    console.log(
      '🔄 AuthService.handleCallback() - Échange du code:',
      code.substring(0, 20) + '...'
    );


    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: this.CLIENT_ID,
      code: code,
      redirect_uri: `${this.FRONTEND_URL}/callback`
    });


    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };


    return this.http.post<{
      access_token: string;
      refresh_token?: string;
      id_token?: string;
    }>(`${this.KEYCLOAK_URL}/protocol/openid-connect/token`, body, { headers });
  }


  // ============ SAVE TOKEN ============
  saveToken(
    accessToken: string,
    refreshToken: string = '',
    idToken: string = '',
    user?: User
  ): void {
    console.log('💾 AuthService.saveToken() - Sauvegarde des tokens');


    if (!accessToken) {
      console.error('❌ ERREUR: accessToken est vide!');
      return;
    }


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
  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('access_token');
      if (token) {
        return token;
      }
    }
    return this.tokenSubject.value;
  }


  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      console.log('❌ isAuthenticated(): Pas de token');
      return false;
    }


    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('❌ isAuthenticated(): Token invalide (', parts.length, 'parties)');
      return false;
    }


    console.log('✅ isAuthenticated(): OUI');
    return true;
  }


  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
  }


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


    return this.http.post<{ access_token: string; refresh_token?: string }>(
      `${this.KEYCLOAK_URL}/protocol/openid-connect/token`,
      body,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
  }


  // ============ USER MANAGEMENT ============
  getCurrentUser(): User | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }


    try {
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


      const token = this.getToken();
      if (!token) {
        console.warn('⚠️ getCurrentUser(): No token found');
        return null;
      }


      const parts = token.split('.');
      if (parts.length !== 3) {
        console.error('❌ getCurrentUser(): Invalid token structure');
        return null;
      }


      const payload = this.decodeTokenPayload(parts[1]);
      if (!payload) {
        console.error('❌ getCurrentUser(): Could not decode token payload');
        return null;
      }


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


  private decodeTokenPayload(encodedPayload: string): any {
    try {
      let decoded = encodedPayload;


      const padding = 4 - (decoded.length % 4);
      if (padding !== 4) {
        decoded += '='.repeat(padding);
      }


      const jsonPayload = atob(decoded);
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('❌ Error decoding token payload:', error);
      return null;
    }
  }


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


  getUserEmail(): string | null {
    const user = this.getCurrentUser();
    return user?.email || null;
  }


  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;


    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;


      const payload = this.decodeTokenPayload(parts[1]);
      if (!payload) return false;


      if (payload.exp && payload.exp * 1000 < Date.now()) {
        return false;
      }


      return true;
    } catch {
      return false;
    }
  }
}