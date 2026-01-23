import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { RecipeService } from '../recipes/recipe.service';  // ← importer le service
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
  ingredients: Ingredient[] | undefined;
  steps: string[] | undefined;
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
// export class RecipeDetailComponent implements OnInit {
//   private route = inject(ActivatedRoute);
//   private router = inject(Router);
//   private recipeService = inject(RecipeService);

//   recipe?: RecipeDetail;

//   ngOnInit(): void {
//   const id = this.route.snapshot.paramMap.get('id');
//   console.log('detail id =', id);
//   if (!id) {
//     this.router.navigate(['/recipes']);
//     return;
//   }

//   this.recipeService.getById(id).subscribe({
//     next: (r: Recipe) => {
//       console.log('API detail OK', r);

//       const ingredients: Ingredient[] = r.ingredientsJson
//         ? JSON.parse(r.ingredientsJson)
//         : [];

//       const steps: string[] = (r.instructions ?? '')
//         .split('\n')
//         .map(s => s.trim())
//         .filter(s => s.length > 0);

//       this.recipe = {
//         id: r.id,
//         name: r.title,
//         image: r.imageUrl || 'assets/default-recipe.jpg',
//         description: r.shortDescription || '',
//         calories: r.calories || 0,
//         time: (r.prepMinutes || 0) + (r.cookMinutes || 0),
//         difficulty: 'Moyen',
//         tags: r.tags ? r.tags.split(',').map(t => t.trim()) : [],
//         ingredients,
//         steps,
//         nutrition: {
//           calories: r.calories || 0,
//           protein: r.proteinG || 0,
//           carbs: r.carbsG || 0,
//           fat: r.fatG || 0,
//         },
//       };
//       console.log('mapped recipe =', this.recipe);
//     },
//     error: (err) => {
//       console.error('Erreur recette', err);
//       this.router.navigate(['/recipes']);
//     },
//   });
// }




//   goBack(): void {
//     this.router.navigate(['/recipes']);
//   }

//   addToPlan(): void {
//     if (this.recipe) {
//       console.log('Ajouter au plan', this.recipe.id);
//     }
//   }
// }
export class RecipeDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private recipeService = inject(RecipeService);

  recipe?: RecipeDetail;
  loading = true;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    console.log('detail id =', id);
    if (!id) {
      this.router.navigate(['/recipes']);
      return;
    }

    this.recipeService.getById(id).subscribe({
      next: (r: Recipe) => {
        console.log('API detail OK', r);

        const ingredients: Ingredient[] = r.ingredientsJson
          ? JSON.parse(r.ingredientsJson)
          : [];

        const steps: string[] = (r.instructions ?? '')
          .split('\n')
          .map(s => s.trim())
          .filter(s => s.length > 0);

        this.recipe = {
          id: r.id,
          name: r.title,
          image: r.imageUrl || 'assets/default-recipe.jpg',
          description: r.shortDescription || '',
          calories: r.calories || 0,
          time: (r.prepMinutes || 0) + (r.cookMinutes || 0),
          difficulty: 'Moyen',
          tags: r.tags ? r.tags.split(',').map(t => t.trim()) : [],
          ingredients,
          steps,
          nutrition: {
            calories: r.calories || 0,
            protein: r.proteinG || 0,
            carbs: r.carbsG || 0,
            fat: r.fatG || 0,
          },
        };
        console.log('mapped recipe =', this.recipe);
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur recette', err);
        this.loading = false;
        this.router.navigate(['/recipes']);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/recipes']);
  }

  addToPlan(): void {
    if (this.recipe) {
      console.log('Ajouter au plan', this.recipe.id);
    }
  }
}


