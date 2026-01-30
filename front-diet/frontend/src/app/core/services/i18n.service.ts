import { Injectable } from '@angular/core';
import { TranslationService } from './translation.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  private currentTranslations: Map<string, string> = new Map();
  private languageChanged = new BehaviorSubject<string>('fr');
  public languageChanged$ = this.languageChanged.asObservable();

  private isInitialized = false;

  constructor(private translationService: TranslationService) {}

  /**
   * Initialiser i18n avec la langue par défaut ou depuis le localStorage
   */
  async initializeI18n(): Promise<void> {
    if (this.isInitialized) return;

    try {
      const savedLang = localStorage.getItem('preferredLanguage') || 'fr';
      await this.loadLanguage(savedLang);
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing i18n:', error);
      await this.loadLanguage('fr');
      this.isInitialized = true;
    }
  }

  /**
   * Charger une langue complète (tous les namespaces)
   */
  async loadLanguage(languageCode: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Namespaces à charger
      const namespaces = ['dashboard', 'profile', 'common', 'day-tracking'];
      let loadedCount = 0;

      namespaces.forEach(namespace => {
        this.translationService.getNamespace(languageCode, namespace).subscribe({
          next: (translations) => {
            // Ajouter les traductions au store
            Object.entries(translations).forEach(([key, value]) => {
              this.currentTranslations.set(key, value);
            });

            loadedCount++;
            if (loadedCount === namespaces.length) {
              this.translationService.setCurrentLanguage(languageCode);
              localStorage.setItem('preferredLanguage', languageCode);
              this.languageChanged.next(languageCode);
              resolve();
            }
          },
          error: (error) => {
            console.error(`Error loading ${namespace} for ${languageCode}:`, error);
            loadedCount++;
            if (loadedCount === namespaces.length) {
              resolve(); // Continuer même avec des erreurs
            }
          }
        });
      });
    });
  }

  /**
   * Fonction de traduction simple : t(key)
   * Retourne la traduction ou la clé en fallback
   */
  t(key: string, defaultValue?: string): string {
    return this.currentTranslations.get(key) || defaultValue || key;
  }

  /**
   * Traduction avec variables : tWithVars(key, { name: 'John' })
   * Remplace {{name}} par John dans la traduction
   */
  tWithVars(key: string, variables: Record<string, string>): string {
    let translation = this.t(key);
    Object.entries(variables).forEach(([varName, varValue]) => {
      translation = translation.replace(`{{${varName}}}`, varValue);
    });
    return translation;
  }

  /**
   * Changer la langue et recharger toutes les traductions
   */
  async changeLanguage(languageCode: string): Promise<void> {
    this.currentTranslations.clear();
    this.translationService.clearCache();
    await this.loadLanguage(languageCode);
  }

  /**
   * Obtenir la langue courante
   */
  getCurrentLanguage(): string {
    return this.translationService.getCurrentLanguage();
  }

  /**
   * Obtenir les langues disponibles
   */
  getAvailableLanguages(): Observable<any[]> {
    return this.translationService.getLanguages();
  }
}
