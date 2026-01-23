// src/app/features/photo-recipe/photo-recipe.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-photo-recipe',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './photo-recipe.html',
  styleUrl: './photo-recipe.css',
})
export class PhotoRecipeComponent {
  selectedFileName: string | null = null;
  ingredientsText = '';

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.selectedFileName = file ? file.name : null;
  }

  generateRecipes(): void {
    console.log('Générer recettes pour :', {
      file: this.selectedFileName,
      ingredients: this.ingredientsText,
    });
    // TODO: appel backend IA plus tard
  }
}
