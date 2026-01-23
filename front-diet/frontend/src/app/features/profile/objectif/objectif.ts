import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';


@Component({
  selector: 'app-objectif',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './objectif.html',
  styleUrl: './objectif.css',
})
export class ObjectifComponent {
  // objectifs principaux
  goal: 'loss' | 'maintain' | 'gain' = 'maintain';
  targetWeightKg?: number;
  targetBodyFat?: number;
  timeFrameWeeks = 12;

  // objectifs sportifs
  strengthGoal = false;
  cardioGoal = false;
  enduranceGoal = false;
  mobilityGoal = false;
  customSportGoal = '';

  // priorités
  focus: 'nutrition' | 'training' | 'balanced' = 'balanced';

  // motivation / contraintes
  motivation = '';
  constraints = '';

  constructor(private router: Router) {}

  onCancel(): void {
    this.router.navigate(['/profil']);
  }

  onSave(): void {
    const payload = {
      goal: this.goal,
      targetWeightKg: this.targetWeightKg,
      targetBodyFat: this.targetBodyFat,
      timeFrameWeeks: this.timeFrameWeeks,
      sports: {
        strength: this.strengthGoal,
        cardio: this.cardioGoal,
        endurance: this.enduranceGoal,
        mobility: this.mobilityGoal,
        custom: this.customSportGoal,
      },
      focus: this.focus,
      motivation: this.motivation,
      constraints: this.constraints,
    };

    console.log('Sauvegarder objectifs', payload);
    // TODO: POST/PUT /api/profile/objectives
    this.router.navigate(['/profil']);
  }
}
