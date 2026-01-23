import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-profile-personal-info',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './personal-info.html',
  styleUrl: './personal-info.css',
})
export class ProfilePersonalInfoComponent {
  firstName = 'Zaid';
  lastName = '';
  email = 'zaid@example.com';

  age = 30;
  heightCm = 175;
  weightKg = 80;
  gender: 'H' | 'F' | 'A' = 'H';

  // objectifs
  goal: 'loss' | 'maintain' | 'gain' = 'maintain';
  targetBodyFat?: number;
  sportGoals = '';

  // activité
  sessionsPerWeek = 3;
  activityLevel: 'low' | 'medium' | 'high' = 'medium';
  favoriteActivities = '';

  // santé
  allergies = '';
  medicalConditions = '';

  // préférences alimentaires
  dietType: 'standard' | 'vegetarian' | 'vegan' | 'keto' = 'standard';
  likedFoods = '';
  dislikedFoods = '';
  mealsPerDay = 3;
  mealSchedule = '';

  // style de vie
  sleepHours = 7;
  stressLevel: 'low' | 'medium' | 'high' = 'medium';
  dailyActivity = '';

  constructor(private router: Router) {}

  onCancel(): void {
    this.router.navigate(['/profil']);
  }

  onSave(): void {
    const payload = {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      age: this.age,
      heightCm: this.heightCm,
      weightKg: this.weightKg,
      gender: this.gender,
      goal: this.goal,
      targetBodyFat: this.targetBodyFat,
      sportGoals: this.sportGoals,
      sessionsPerWeek: this.sessionsPerWeek,
      activityLevel: this.activityLevel,
      favoriteActivities: this.favoriteActivities,
      allergies: this.allergies,
      medicalConditions: this.medicalConditions,
      dietType: this.dietType,
      likedFoods: this.likedFoods,
      dislikedFoods: this.dislikedFoods,
      mealsPerDay: this.mealsPerDay,
      mealSchedule: this.mealSchedule,
      sleepHours: this.sleepHours,
      stressLevel: this.stressLevel,
      dailyActivity: this.dailyActivity,
    };

    console.log('Sauvegarder profil perso', payload);
    // TODO: POST/PUT /api/profile/personal-info
    this.router.navigate(['/profil']);
  }
}
