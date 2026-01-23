import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-language',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './language.html',
  styleUrl: './language.css',
})
export class LanguageComponent {
  currentLang = 'fr';
  availableLangs = [
    { code: 'fr', label: 'Français' },
    { code: 'en', label: 'English' },
    { code: 'ar', label: 'العربية' },
    { code: 'ma', label: 'Darija' },
  ];

  constructor(private router: Router) {}

  selectLang(code: string): void {
    this.currentLang = code;
    console.log('Langue choisie =', code);
    // TODO: service i18n + localStorage/backend
  }

  onCancel(): void {
    this.router.navigate(['/profil']);
  }

  onSave(): void {
    console.log('Langue sauvegardée:', this.currentLang);
    // TODO: persistance
    this.router.navigate(['/profil']);
  }
}
