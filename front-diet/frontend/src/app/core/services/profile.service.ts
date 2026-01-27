import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';  // 👈 ajoute ça


export interface UserProfile {
  email: string;
  firstName: string;
  lastName: string;
  username: string;
}


@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  // private apiUrl = 'http://localhost:8081/api/public/auth';
  private apiUrl = environment.apiUrl + 'auth';

  private profileSubject = new BehaviorSubject<UserProfile | null>(null);
  public profile$ = this.profileSubject.asObservable();
  
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  public isLoading$ = this.isLoadingSubject.asObservable();

  private errorSubject = new BehaviorSubject<string | null>(null);
  public error$ = this.errorSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  /**
   * 📥 Charger le profil (essaie d'abord l'API, puis fallback JWT)
   */
  loadProfile(): void {
    if (!isPlatformBrowser(this.platformId)) {
      console.warn('⚠️ Not in browser environment');
      return;
    }

    const token = localStorage.getItem('access_token');
    
    if (!token) {
      console.warn('⚠️ No token found');
      this.profileSubject.next(null);
      this.errorSubject.next('No authentication token');
      return;
    }

    this.isLoadingSubject.next(true);
    this.errorSubject.next(null);

    // 🎯 Essayer de charger depuis l'API d'abord
    this.loadProfileFromAPI(token);
  }

  /**
   * 🌐 Charger le profil depuis le backend API
   */
  private loadProfileFromAPI(token: string): void {
    this.http.get<UserProfile>(`${this.apiUrl}/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).subscribe({
      next: (profile) => {
        console.log('✅ Profile chargé depuis l\'API:', profile);
        this.profileSubject.next(profile);
        this.isLoadingSubject.next(false);
        this.errorSubject.next(null);
      },
      error: (error: HttpErrorResponse) => {
        console.warn('⚠️ Erreur API, fallback au JWT:', error.status);

        // Fallback: Charger depuis le JWT local si l'API échoue
        this.loadProfileFromToken(token);

        this.isLoadingSubject.next(false);

        // Ne mettre le message "Token invalide ou expiré"
        // que si on est vraiment dans ce cas
        if (error.status !== 401 && error.status !== 403) {
          this.errorSubject.next('Erreur lors du chargement du profil');
        }
      }

    });
  }

  /**
   * 📌 Parser le JWT pour extraire les données utilisateur (Fallback)
   */
  private loadProfileFromToken(token: string): void {
    try {
      // Validate token structure
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.error('❌ Invalid token structure');
        this.profileSubject.next(null);
        this.errorSubject.next('Token invalide');
        return;
      }

      // Decode payload safely
      const payload = this.decodeTokenPayload(parts[1]);
      if (!payload) {
        console.error('❌ Could not decode token payload');
        this.profileSubject.next(null);
        this.errorSubject.next('Impossible de décoder le token');
        return;
      }

      // Check token expiration
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        console.warn('⚠️ Token expiré');
        this.profileSubject.next(null);
        this.errorSubject.next('Token expiré');
        return;
      }

      const profile: UserProfile = {
        email: payload.email || payload.preferred_username || 'N/A',
        firstName: payload.given_name || 'User',
        lastName: payload.family_name || '',
        username: payload.preferred_username || payload.sub || 'N/A'
      };
      
      console.log('✅ Profile extrait du JWT:', profile);
      this.profileSubject.next(profile);
      this.errorSubject.next(null);

    } catch (err) {
      console.error('❌ Erreur lors du parsing du token:', err);
      this.profileSubject.next(null);
      this.errorSubject.next('Erreur lors du chargement du profil');
    }
  }

  /**
   * ✅ Helper: Safely decode JWT payload
   */
  private decodeTokenPayload(encodedPayload: string): any {
    try {
      // Fix base64 padding
      let decoded = encodedPayload;
      const padding = 4 - (decoded.length % 4);
      if (padding !== 4) {
        decoded += '='.repeat(padding);
      }

      // Decode
      const jsonPayload = atob(decoded);
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('❌ Error decoding token payload:', error);
      return null;
    }
  }

  /**
   * 🚪 LOGOUT LOCAL
   * ✅ Nettoie les tokens SANS appel API
   */
  logoutLocal(): void {
    if (isPlatformBrowser(this.platformId)) {
      console.log('🚪 Nettoyage des tokens...');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('id_token');
      localStorage.removeItem('user');
    }
    
    this.profileSubject.next(null);
    this.errorSubject.next(null);
    console.log('✅ Tokens supprimés - Déconnexion réussie');
  }

  /**
   * 🎯 Obtenir le profil actuel (synchrone)
   */
  getProfile(): UserProfile | null {
    return this.profileSubject.value;
  }

  /**
   * ✅ Check if profile is loaded
   */
  hasProfile(): boolean {
    const profile = this.getProfile();
    return !!profile && profile.firstName !== 'User';
  }

  /**
   * 📊 Get error message
   */
  getError(): string | null {
    return this.errorSubject.value;
  }

  /**
   * ✅ Check if loading
   */
  isLoading(): boolean {
    return this.isLoadingSubject.value;
  }
}