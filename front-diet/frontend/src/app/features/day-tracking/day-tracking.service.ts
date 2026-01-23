import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

export interface DayTracking {
  date: string;
  caloriesIn: number;
  caloriesTarget: number;
  caloriesOut: number;
  totalWorkoutMinutes: number;
  totalSets: number;
  meals: MealEntry[];
  workouts: WorkoutEntry[];
}

@Injectable({
  providedIn: 'root'
})
export class DayTrackingService {
  private apiUrl = 'http://localhost:8081/api';

  constructor(private http: HttpClient) {}

  getDayTracking(date: Date): Observable<DayTracking> {
    const iso = date.toISOString().substring(0, 10);
    return this.http.get<DayTracking>(`${this.apiUrl}/day-tracking/${iso}`);
  }

  addMeal(date: string, meal: MealEntry): Observable<MealEntry> {
    return this.http.post<MealEntry>(`${this.apiUrl}/day-tracking/${date}/meals`, meal);
  }

  addWorkout(date: string, workout: WorkoutEntry): Observable<WorkoutEntry> {
    return this.http.post<WorkoutEntry>(`${this.apiUrl}/day-tracking/${date}/workouts`, workout);
  }
  deleteMeal(date: string, mealId: string): Observable<any> {
  return this.http.delete(`http://localhost:8081/api/day-tracking/${date}/meals/${mealId}`);
}
}
