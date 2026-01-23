import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-allergie',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './allergie.html',
  styleUrl: './allergie.css',
})
export class AllergieComponent {
  // régime et restrictions
  dietType: 'standard' | 'vegetarian' | 'vegan' | 'keto' = 'standard';
  allergies = '';
  intolerances = '';
  dislikedFoods = '';
  medicalConditions = '';

  // allergies courantes (checkbox)
  commonAllergies = {
    gluten: false,
    lactose: false,
    nuts: false,
    shellfish: false,
    eggs: false,
    soy: false,
  };

  constructor(private router: Router) {}

  onCancel(): void {
    this.router.navigate(['/profil']);
  }

  onSave(): void {
    const allergiesList = Object.keys(this.commonAllergies).filter(
      key => this.commonAllergies[key as keyof typeof this.commonAllergies]
    );

    const payload = {
      dietType: this.dietType,
      allergies: allergiesList.length ? allergiesList.join(', ') : this.allergies,
      intolerances: this.intolerances,
      dislikedFoods: this.dislikedFoods,
      medicalConditions: this.medicalConditions,
    };

    console.log('Sauvegarder allergies/restrictions', payload);
    // TODO: POST/PUT /api/profile/allergies
    this.router.navigate(['/profil']);
  }
}
