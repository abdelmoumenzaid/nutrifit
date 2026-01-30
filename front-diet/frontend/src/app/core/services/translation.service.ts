import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError, timeout } from 'rxjs/operators';

export interface Language {
  id: number;
  code: string;
  name: string;
  nativeName: string;
  active: boolean;
  sortOrder: number;
}

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private baseUrl = 'http://localhost:8080/api/v1/translations';
  private currentLanguageSubject = new BehaviorSubject<string>('fr');
  public currentLanguage$ = this.currentLanguageSubject.asObservable();

  private translationsCache: Map<string, Record<string, string>> = new Map();
  private backendAvailable = false;

  // ✅ MOCK DATA - Données de fallback si le backend est indisponible
  private mockLanguages: Language[] = [
    { id: 1, code: 'fr', name: 'Français', nativeName: 'Français', active: true, sortOrder: 1 },
    { id: 2, code: 'en', name: 'English', nativeName: 'English', active: true, sortOrder: 2 },
    { id: 3, code: 'es', name: 'Español', nativeName: 'Español', active: true, sortOrder: 3 },
    { id: 4, code: 'ar', name: 'العربية', nativeName: 'العربية', active: true, sortOrder: 4 }
  ];

  constructor(private http: HttpClient) {
    console.log('🌐 TranslationService initialized');
    console.log('📍 Backend URL:', this.baseUrl);
  }

  /**
   * Récupère toutes les langues disponibles
   * Avec fallback sur les données mockées si l'API est indisponible
   */
  getLanguages(): Observable<Language[]> {
    console.log('📥 Fetching languages from:', `${this.baseUrl}/languages`);
    
    return this.http.get<Language[]>(`${this.baseUrl}/languages`)
      .pipe(
        timeout(5000), // 5 secondes timeout
        tap(languages => {
          console.log('✓ Languages loaded from backend:', languages.length);
          this.backendAvailable = true;
        }),
        catchError(error => {
          console.error('❌ Error fetching languages from backend:', error);
          
          // Si c'est une erreur de connexion ou timeout
          if (error.status === 0 || error.name === 'TimeoutError') {
            console.warn('⚠️ Backend unavailable - using mock data');
          }
          
          console.warn('✅ Using mock languages as fallback');
          this.backendAvailable = false;
          
          // Retourner les données mockées
          return of(this.mockLanguages);
        })
      );
  }

  /**
   * Récupère toutes les traductions pour une langue + namespace
   */
  getNamespace(lang: string, ns: string): Observable<Record<string, string>> {
    const url = `${this.baseUrl}/${lang}/${ns}`;
    const cacheKey = `${lang}_${ns}`;

    console.log(`📥 Fetching namespace: ${lang}/${ns}`);

    // Retourner depuis le cache si disponible
    if (this.translationsCache.has(cacheKey)) {
      console.log(`💾 Cache hit: ${cacheKey}`);
      return new Observable(observer => {
        observer.next(this.translationsCache.get(cacheKey)!);
        observer.complete();
      });
    }

    return this.http.get<Record<string, string>>(url)
      .pipe(
        timeout(5000),
        tap(translations => {
          console.log(`✓ Namespace loaded (${ns}):`, Object.keys(translations).length, 'keys');
          this.translationsCache.set(cacheKey, translations);
        }),
        catchError(error => {
          console.error(`❌ Error fetching namespace ${ns}:`, error);
          // Retourner un objet vide en cas d'erreur
          return of({});
        })
      );
  }

  /**
   * Récupère une traduction unique
   */
  getTranslation(lang: string, key: string): Observable<string> {
    const url = `${this.baseUrl}/${lang}?key=${key}`;
    
    console.log(`📥 Fetching single translation: ${lang}/${key}`);

    return this.http.get<string>(url)
      .pipe(
        timeout(5000),
        tap(value => {
          console.log(`✓ Translation loaded: ${key} = ${value}`);
        }),
        catchError(error => {
          console.error(`❌ Error fetching translation ${key}:`, error);
          // Retourner la clé en fallback
          return of(key);
        })
      );
  }

  /**
   * Change la langue courante
   */
  setCurrentLanguage(lang: string): void {
    console.log('🔤 Setting current language:', lang);
    this.currentLanguageSubject.next(lang);
  }

  /**
   * Obtient la langue courante
   */
  getCurrentLanguage(): string {
    return this.currentLanguageSubject.value;
  }

  /**
   * Sauvegarde une traduction (POST)
   */
  saveTranslation(
    lang: string,
    key: string,
    value: string,
    namespace: string = 'common'
  ): Observable<void> {
    const url = `${this.baseUrl}/${lang}`;
    
    console.log(`📤 Saving translation: ${lang}/${key} = ${value}`);

    return this.http.post<void>(
      url,
      null,
      {
        params: { key, value, namespace }
      }
    ).pipe(
      timeout(5000),
      tap(() => {
        console.log(`✓ Translation saved: ${key}`);
        // Invalider le cache après sauvegarde
        this.translationsCache.delete(`${lang}_${namespace}`);
      }),
      catchError(error => {
        console.error(`❌ Error saving translation ${key}:`, error);
        return of(void 0);
      })
    );
  }

  /**
   * Vide le cache des traductions
   */
  clearCache(): void {
    console.log('🗑️ Clearing translation cache');
    this.translationsCache.clear();
  }

  /**
   * Récupère les langues mockées (pour test/développement)
   */
  getMockLanguages(): Language[] {
    console.log('📦 Using mock languages');
    return this.mockLanguages;
  }

  /**
   * Vérifie si le backend est disponible
   */
  isBackendAvailable(): boolean {
    return this.backendAvailable;
  }
}