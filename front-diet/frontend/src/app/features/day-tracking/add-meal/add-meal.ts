// src/app/features/calendar/add-meal.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';

@Component({
  selector: 'app-add-meal',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './add-meal.html',
  styleUrl: './add-meal.css',
})
export class AddMealComponent implements OnInit {
  date!: string;
  mealId: string | null = null;  // ✅ CHANGE ÇA (permet null)
  isEditMode = false;  // ✅ NOUVEAU : mode édition
  type: MealType = 'LUNCH';
  time = '12:00';
  recipeName = '';
  calories = 0;
  servings = 1;
  protein?: number;
  carbs?: number;
  fat?: number;
  imageUrl = '';  // ✅ AJOUTÉ

  loading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.date = this.route.snapshot.paramMap.get('date') || '';
    this.mealId = this.route.snapshot.paramMap.get('mealId');  // ✅ Récupère ID

    if (!this.date) {
      console.error('❌ Date parameter is missing!');
      this.router.navigate(['/day-tracking']);
      return;
    }

    // ✅ SI MODE ÉDITION : CHARGER LE REPAS
    if (this.mealId) {
      this.isEditMode = true;
      this.loadMeal();
    }
  }

  // ✅ NOUVEAU : Charge repas pour édition
  loadMeal(): void {
  if (!this.mealId) return;  // ✅ Protection
  
  this.loading = true;
  this.http.get<any>(`http://localhost:8081/api/day-tracking/${this.date}/meals/${this.mealId}`)
    .subscribe({
      next: (meal) => {
        this.type = meal.label as MealType;
        this.time = meal.time;
        this.recipeName = meal.recipeName;
        this.calories = meal.calories;
        this.servings = meal.servings;
        this.protein = meal.protein;
        this.carbs = meal.carbs;
        this.fat = meal.fat;
        this.imageUrl = meal.imageUrl || '';
        this.loading = false;
        console.log('✅ Meal loaded for edit:', meal);
      },
      error: (err) => {
        this.error = 'Erreur chargement repas';
        this.loading = false;
      }
    });
}


  onCancel(): void {
    this.router.navigate(['/calendar', this.date]);  // ✅ Retour calendar
  }
onSave(): void {
  if (!this.recipeName.trim()) {
    this.error = 'Nom requis';
    return;
  }

  this.loading = true;
  this.error = null;

  const payload = {
    recipeName: this.recipeName.trim(),
    label: this.type,
    time: this.time,
    calories: Math.round(this.calories),
    servings: this.servings,
    protein: this.protein ? Math.round(this.protein) : undefined,
    carbs: this.carbs ? Math.round(this.carbs) : undefined,
    fat: this.fat ? Math.round(this.fat) : undefined,
    imageUrl: this.imageUrl || this.getFallbackImage()
  };

  // ✅ CORRIGÉ : Vérifie si mealId existe
  const url = this.mealId 
    ? `http://localhost:8081/api/day-tracking/${this.date}/meals/${this.mealId}`
    : `http://localhost:8081/api/day-tracking/${this.date}/meals`;

  const request = this.mealId 
    ? this.http.put(url, payload) 
    : this.http.post(url, payload);

  request.subscribe({
    next: () => {
      console.log(this.mealId ? '✅ Meal updated' : '✅ Meal added');
      this.router.navigate(['/calendar', this.date]);
    },
    error: (err) => {
      console.error('❌ Error:', err);
      this.error = this.mealId ? 'Erreur mise à jour' : 'Erreur ajout';
      this.loading = false;
    }
  });
}


  // ✅ GÉNÈRE UNE IMAGE PAR DÉFAUT
  private getFallbackImage(): string {
    const seed = Math.abs(
      this.recipeName.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
    );
    return `https://picsum.photos/seed/${seed}/400/300`;
  }
}
