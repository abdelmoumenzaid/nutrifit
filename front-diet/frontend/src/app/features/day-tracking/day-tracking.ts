// src/app/features/calendar/day-tracking.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { DayTrackingService } from './day-tracking.service';


interface MealEntry {
  id: string;
  type: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
  label: string;
  time: string;
  recipeName: string;
  imageUrl: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  servings: number;
}


interface ExerciseSet {
  id: string;
  exerciseName: string;
  setNumber: number;
  reps?: number;
  weightKg?: number;
  durationSec?: number;
}


interface WorkoutEntry {
  id: string;
  name: string;
  time: string;
  durationMin: number;
  caloriesBurned?: number;
  totalSets: number;
  sets: ExerciseSet[];
}


interface DayTracking {
  date: string; // ISO yyyy-MM-dd
  caloriesIn: number;
  caloriesTarget: number;
  caloriesOut: number;
  totalWorkoutMinutes: number;
  totalSets: number;
  meals: MealEntry[];
  workouts: WorkoutEntry[];
}


interface WeekRing {
  date: string; // yyyy-MM-dd
  label: string; // L, M, M, J, V, S, D
  caloriesIn: number;
  caloriesTarget: number;
  trained: boolean; // entraînement fait ou pas
}


@Component({
  selector: 'app-day-tracking',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './day-tracking.html',
  styleUrl: './day-tracking.css',
})
export class DayTrackingComponent implements OnInit {
  day: DayTracking | null = null;
  displayDate = '';
  weekRings: WeekRing[] = [];
  loading = true;
  error: string | null = null;
  currentDate: Date = new Date();


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private trackingService: DayTrackingService
  ) {}


  ngOnInit(): void {
    // ✅ ÉCOUTE LES CHANGEMENTS DE PARAMÈTRES (pas seulement à l'init)
    this.route.paramMap.subscribe(params => {
      const paramDate = params.get('date');
      const today = new Date();
      const date = paramDate ? new Date(paramDate) : today;

      // ✅ IMPORTANT : Mémoriser la date
      this.currentDate = date;

      this.displayDate = date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });

      // ✅ RECHARGER LES DONNÉES À CHAQUE CHANGEMENT DE DATE
      this.loadDayTracking(date);
      
      // ✅ RECHARGER LES RINGS
      this.buildWeekRings(date);
    });
  }


  // ✅ NOUVELLE MÉTHODE : CHARGER LES DONNÉES DU JOUR
  private loadDayTracking(date: Date): void {
    this.loading = true;
    this.error = null;

    this.trackingService.getDayTracking(date).subscribe({
      next: (data) => {
        this.day = data;
        this.loading = false;
        console.log('✅ Day data loaded:', this.day);
      },
      error: (err) => {
        console.error('❌ Error loading day:', err);
        this.day = null;
        this.error = 'Impossible de charger les données du jour';
        this.loading = false;
      },
    });
  }


  onAddMeal(): void {
    if (this.day) {
      this.router.navigate(['/calendar', this.day.date, 'add-meal']);
    }
  }


  onAddWorkout(): void {
    if (this.day) {
      this.router.navigate(['/calendar', this.day.date, 'add-workout']);
    }
  }


  getRingRotation(r: WeekRing): number {
    if (!r.caloriesTarget || r.caloriesTarget <= 0) return 0;
    const ratio = Math.min(r.caloriesIn / r.caloriesTarget, 1);
    return ratio * 360;
  }


  getRingEmoji(r: WeekRing): string {
    return r.trained ? '💪' : '😴';
  }


  getRingColor(r: WeekRing): string {
    const ratio = r.caloriesIn / r.caloriesTarget;
    if (ratio === 0) return '#9ca3af'; // gris : pas de données
    if (ratio >= 0.9 && ratio <= 1.1) return '#22c55e'; // vert : ok
    if (ratio < 0.9) return '#3b82f6'; // bleu : en dessous
    return '#ef4444'; // rouge : au-dessus
  }


  goToToday(): void {
    const today = new Date();
    const iso = today.toISOString().substring(0, 10);
    this.router.navigate(['/calendar', iso]);
  }


  goToOffset(days: number): void {
    if (!this.day) return;
    const base = new Date(this.day.date);
    base.setDate(base.getDate() + days);
    const iso = base.toISOString().substring(0, 10);
    this.router.navigate(['/calendar', iso]);
  }


  goToDate(iso: string): void {
    this.router.navigate(['/calendar', iso]);
  }

  // ✅ Méthodes pour éditer/supprimer repas
onEditMeal(meal: MealEntry): void {
  if (this.day) {
    this.router.navigate(['/calendar', this.day.date, 'add-meal', meal.id]);  // ✅ add-meal/:mealId
  }
}


onDeleteMeal(mealId: string): void {
  if (confirm('Supprimer ce repas ?')) {
    this.trackingService.deleteMeal(this.day!.date, mealId).subscribe({
      next: () => {
        console.log('✅ Repas supprimé');
        this.loadDayTracking(this.currentDate); // Recharge
      },
      error: (err) => {
        console.error('❌ Erreur suppression:', err);
        this.error = 'Erreur suppression repas';
      }
    });
  }
}

trackByMealId(index: number, meal: MealEntry): string {
  return meal.id;
}


  private buildWeekRings(centerDate: Date): void {
    // 0 = lundi
    const d = new Date(centerDate);
    const dayOfWeek = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - dayOfWeek);

    const labels = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
    const rings: WeekRing[] = [];

    for (let i = 0; i < 7; i++) {
      const current = new Date(d);
      current.setDate(d.getDate() + i);
      const iso = current.toISOString().substring(0, 10);

      // ✅ APPEL BACKEND POUR CHAQUE JOUR DE LA SEMAINE
      this.trackingService.getDayTracking(current).subscribe({
        next: (data: DayTracking) => {
          const trained = data.totalWorkoutMinutes > 0;
          const ring: WeekRing = {
            date: iso,
            label: labels[i],
            caloriesIn: data.caloriesIn,
            caloriesTarget: data.caloriesTarget,
            trained,
          };
          rings[i] = ring;
          this.weekRings = [...rings];
        },
        error: (err: any) => {
          // Jour sans données = ring gris vide
          const ring: WeekRing = {
            date: iso,
            label: labels[i],
            caloriesIn: 0,
            caloriesTarget: 0,
            trained: false,
          };
          rings[i] = ring;
          this.weekRings = [...rings];
        },
      });
    }
  }
}