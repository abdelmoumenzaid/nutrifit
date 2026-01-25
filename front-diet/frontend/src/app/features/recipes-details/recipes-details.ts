import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { RecipeService } from '../recipes/recipe.service';
import { Recipe } from '../recipes/recipe.model';

interface Ingredient {
  name: string;
  quantity: string;
}

interface RecipeDetail {
  id: string;
  name: string;
  image: string;
  description: string;
  calories: number;
  time: number;
  difficulty: string;
  tags: string[];
  ingredients?: Ingredient[];
  steps?: string[];
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

@Component({
  selector: 'app-recipe-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recipes-details.html',
  styleUrl: './recipes-details.css',
})
export class RecipeDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private recipeService = inject(RecipeService);
  private cdr = inject(ChangeDetectorRef);  // ✅ AJOUTE CETTE LIGNE

  recipe: RecipeDetail | null = null;
  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    console.log('🔵 Recipe detail loaded, id =', id);

    if (!id) {
      this.router.navigate(['/recipes']);
      return;
    }

    // ✅ APPELER L'API POUR CHARGER LA RECETTE
    this.recipeService.getById(id).subscribe({
      next: (r: Recipe) => {
        console.log('✅ API detail received:', r.title);

        // Parser les ingrédients depuis le JSON
        const ingredients: Ingredient[] = r.ingredientsJson
          ? JSON.parse(r.ingredientsJson)
          : [];

        // Parser les étapes depuis les instructions
        const steps: string[] = (r.instructions ?? '')
          .split('\n')
          .map((s) => s.trim())
          .filter((s) => s.length > 0);

        // Mapper vers l'interface locale
        this.recipe = {
          id: r.id,
          name: r.title,
          image: r.imageUrl || 'assets/default-recipe.jpg',
          description: r.shortDescription || '',
          calories: r.calories || 0,
          time: (r.prepMinutes || 0) + (r.cookMinutes || 0),
          difficulty: this.getDifficulty(r.calories || 0),
          tags: r.tags ? r.tags.split(',').map((t) => t.trim()) : [],
          ingredients,
          steps,
          nutrition: {
            calories: r.calories || 0,
            protein: r.proteinG || 0,
            carbs: r.carbsG || 0,
            fat: r.fatG || 0,
          },
        };

        console.log('✅ Recipe mapped:', this.recipe.name);
        this.loading = false;
        this.cdr.markForCheck();  // ✅ FORCE LE RENDU
        console.log('✅ Page is ready to display');
      },
      error: (err) => {
        console.error('❌ Error loading recipe:', err);
        this.error = 'Erreur chargement recette';
        this.loading = false;
        this.cdr.markForCheck();  // ✅ FORCE LE RENDU
      },
    });
  }

  // ✅ FONCTION: Retourner aux recettes
  goBack(): void {
    this.router.navigate(['/recipes']);
  }

  // ✅ FONCTION: Ajouter au plan
  addToPlan(): void {
    if (this.recipe) {
      console.log('Added to plan:', this.recipe.id);
      alert(this.recipe.name + ' ajouté au plan!');
    }
  }

  // ✅ FONCTION HELPER: Calculer la difficulté
  private getDifficulty(calories: number): string {
    if (calories < 400) return 'Facile';
    if (calories < 700) return 'Moyen';
    return 'Difficile';
  }
}