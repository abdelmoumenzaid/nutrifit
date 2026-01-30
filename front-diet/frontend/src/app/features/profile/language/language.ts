import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { I18nService } from '../../../core/services/i18n.service';
import { TranslationService, Language } from '../../../core/services/translation.service';

@Component({
  selector: 'app-language',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './language.html',
  styleUrl: './language.css',
})
export class LanguageComponent implements OnInit, OnDestroy {
  currentLang: string = 'fr';
  availableLangs: Language[] = [];
  isLoading: boolean = false;
  message: string = '';
  error: string = '';

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    public i18n: I18nService,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    // Charger les langues disponibles depuis le backend
    this.loadAvailableLanguages();
    // Définir la langue actuelle
    this.currentLang = this.i18n.getCurrentLanguage();
  }

  ngOnDestroy(): void {
    // Nettoyer les subscriptions
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Charger la liste des langues disponibles depuis le backend
   */
  loadAvailableLanguages(): void {
    this.isLoading = true;
    this.error = '';

    this.translationService
      .getLanguages()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (languages: Language[]) => {
          // Vérifier que les langues sont chargées
          if (languages && languages.length > 0) {
            // Trier par sortOrder
            this.availableLangs = languages.sort((a, b) => a.sortOrder - b.sortOrder);
            console.log('✓ Langues chargées:', this.availableLangs.length);
          } else {
            this.error = 'Aucune langue disponible';
            console.warn('⚠️ Aucune langue chargée');
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('❌ Erreur lors du chargement des langues:', error);
          this.error = this.i18n.t('error.loadLanguages', 'Erreur lors du chargement des langues');
          this.isLoading = false;
        }
      });
  }

  /**
   * Sélectionner une langue
   * Charger la langue en temps réel pour prévisualisation
   */
  selectLang(code: string): void {
    // Vérifier que la langue est valide
    const lang = this.availableLangs.find(l => l.code === code);
    if (!lang) {
      console.warn('⚠️ Langue non trouvée:', code);
      return;
    }

    this.currentLang = code;
    this.message = '';
    this.error = '';

    // Charger la langue en temps réel
    this.i18n.changeLanguage(code)
      .then(() => {
        console.log('✓ Langue changée:', code);
      })
      .catch((error) => {
        console.error('❌ Erreur changement langue:', error);
        this.error = this.i18n.t('error.changeLanguage', 'Erreur lors du changement de langue');
      });
  }

  /**
   * Annuler et revenir au profil
   */
  onCancel(): void {
    this.router.navigate(['/profil']);
  }

  /**
   * Sauvegarder la langue dans le profil utilisateur
   */
  onSave(): void {
    if (this.isLoading) return;

    this.isLoading = true;
    this.message = '';
    this.error = '';

    try {
      // Sauvegarder dans localStorage
      localStorage.setItem('preferredLanguage', this.currentLang);

      console.log('✓ Langue sauvegardée:', this.currentLang);
      
      // Afficher le message de succès
      this.message = this.i18n.t('common.save', 'Sauvegardé') + ' ✓';
      this.isLoading = false;

      // Rediriger après 1 seconde
      setTimeout(() => {
        this.router.navigate(['/profil']);
      }, 1000);
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error);
      this.error = this.i18n.t('error.saveFailed', 'Erreur lors de la sauvegarde');
      this.isLoading = false;
    }
  }
}