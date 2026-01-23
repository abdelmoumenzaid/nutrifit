// src/app/features/calendar/add-workout.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

interface ExerciseSetForm {
  exerciseName: string;
  setNumber: number;
  reps?: number;
  weightKg?: number;
  durationSec?: number;
}

@Component({
  selector: 'app-add-workout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './add-workout.html',
  styleUrl: './add-workout.css',
})
export class AddWorkoutComponent {
  date!: string;

  name = '';
  time = '18:00';
  durationMin = 45;
  caloriesBurned?: number;

  sets: ExerciseSetForm[] = [
    { exerciseName: 'Squat', setNumber: 1, reps: 8, weightKg: 60 },
  ];

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.date = this.route.snapshot.paramMap.get('date') || '';
  }

  addSet(): void {
    const nextNumber = this.sets.length + 1;
    this.sets.push({
      exerciseName: '',
      setNumber: nextNumber,
    });
  }

  removeSet(index: number): void {
    this.sets.splice(index, 1);
    this.sets.forEach((s, i) => (s.setNumber = i + 1));
  }

  onCancel(): void {
    this.router.navigate(['/calendar', this.date]);
  }

  onSave(): void {
    const payload = {
      date: this.date,
      name: this.name,
      time: this.time,
      durationMin: this.durationMin,
      caloriesBurned: this.caloriesBurned,
      sets: this.sets,
    };

    console.log('Workout to save:', payload);
    // TODO: POST /api/calendar/days/:date/workouts

    this.router.navigate(['/calendar', this.date]);
  }
}
