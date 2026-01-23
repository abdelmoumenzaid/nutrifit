// src/app/features/dashboard/dashboard.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

interface Recipe {
  id: string;
  name: string;
  image: string;
  description: string;
  calories: number;
  time: number;
  difficulty: 'Facile' | 'Moyen' | 'Difficile';
  tags: string[];
  isFavorite?: boolean;
}

interface Meal {
  id: string;
  type: MealType;
  label: string;
  icon: string;
  calories: number;
  recipes: Recipe[];
  expanded: boolean;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);

  // Hero data
  userName: string = 'Utilisateur';
  targetCalories = 2100;
  consumedCalories = 0;

  // Meals data
  meals: Meal[] = [
    {
      id: '1',
      type: 'breakfast',
      label: 'Petit-déjeuner',
      icon: '🍳',
      calories: 600,
      expanded: false,
      recipes: [
        {
          id: 'ms1',
          name: 'Msemen au Miel',
          image: 'http://localhost:3000/api/images/recipes/msemen-miel.jpg',
          description: 'Crêpes feuilletées marocaines traditionnelles',
          calories: 280,
          time: 20,
          difficulty: 'Moyen',
          tags: ['Traditionnel', 'Petit-déjeuner'],
          isFavorite: false,
        },
        {
          id: 'sm1',
          name: 'Smoothie Bowl Avocat',
          image: 'http://localhost:3000/api/images/recipes/bowl.jpg',
          description: 'Bowl énergisant pour bien commencer la journée',
          calories: 320,
          time: 10,
          difficulty: 'Facile',
          tags: ['Healthy', 'Végétarien'],
          isFavorite: true,
        },
      ],
    },
    {
      id: '2',
      type: 'lunch',
      label: 'Déjeuner',
      icon: '🍽️',
      calories: 750,
      expanded: false,
      recipes: [
        {
          id: 'csc1',
          name: 'Couscous Seffa',
          image: 'http://localhost:3000/api/images/recipes/couscous.jpg',
          description: 'Couscous sucré avec amandes et raisins secs',
          calories: 750,
          time: 45,
          difficulty: 'Moyen',
          tags: ['Traditionnel', 'Complet'],
          isFavorite: false,
        },
      ],
    },
    {
      id: '3',
      type: 'dinner',
      label: 'Dîner',
      icon: '🥘',
      calories: 500,
      expanded: false,
      recipes: [
        {
          id: 'tag1',
          name: 'Tagine de Poulet',
          image: 'http://localhost:3000/api/images/recipes/tagine.jpg',
          description: 'Tagine marocain au poulet et olives',
          calories: 500,
          time: 60,
          difficulty: 'Moyen',
          tags: ['Traditionnel', 'Marocain'],
          isFavorite: false,
        },
      ],
    },
    {
      id: '4',
      type: 'snack',
      label: 'Collations',
      icon: '🍎',
      calories: 200,
      expanded: false,
      recipes: [
        {
          id: 'sn1',
          name: 'Fruits secs',
          image: 'http://localhost:3000/api/images/recipes/fruits.jpg',
          description: 'Amandes, noix et raisins secs',
          calories: 200,
          time: 0,
          difficulty: 'Facile',
          tags: ['Snack', 'Sain'],
          isFavorite: false,
        },
      ],
    },
  ];

  ngOnInit(): void {
    // Charger le nom de l'utilisateur
    this.loadUserName();
    // Charger les données au démarrage
    this.calculateTotalCalories();
  }

  /**
   * Charger le nom de l'utilisateur depuis le service Auth
   */
  private loadUserName(): void {
  try {
    // Check if token is valid first
    if (!this.authService.isTokenValid()) {
      console.warn('⚠️ Token is invalid or expired');
      this.userName = 'Utilisateur';
      return;
    }

    // Get user name
    const firstName = this.authService.getUserFirstName();
    if (firstName && firstName !== 'Utilisateur') {
      this.userName = firstName;
    } else {
      this.userName = 'Utilisateur';
    }
    
    console.log(`✅ User name loaded: ${this.userName}`);
  } catch (error) {
    console.error('❌ Error loading user name:', error);
    this.userName = 'Utilisateur';
  }
}


  /**
   * Calculer les calories totales consommées
   */
  private calculateTotalCalories(): void {
    this.consumedCalories = this.meals.reduce((sum, meal) => {
      const mealTotal = meal.recipes.reduce(
        (recSum, recipe) => recSum + recipe.calories,
        0
      );
      return sum + mealTotal;
    }, 0);
  }

  /**
   * Getter pour les calories restantes
   */
  get remainingCalories(): number {
    return Math.max(0, this.targetCalories - this.consumedCalories);
  }

  /**
   * Getter pour le pourcentage de progression
   */
  get progressPercent(): number {
    return Math.min(100, (this.consumedCalories / this.targetCalories) * 100);
  }

  /**
   * Générer un nouveau plan du jour
   */
  onNewPlan(): void {
    console.log('🔄 Générer un nouveau plan du jour');
    // TODO: Appeler le service pour générer un nouveau plan
    // this.dashboardService.generateNewPlan().subscribe(
    //   (newMeals: Meal[]) => {
    //     this.meals = newMeals;
    //     this.calculateTotalCalories();
    //   }
    // );
  }

  /**
   * Basculer l'expansion d'un repas
   */
  toggleMeal(meal: Meal): void {
    meal.expanded = !meal.expanded;
  }

  /**
   * Ajouter/Retirer une recette des favoris
   */
  onFavorite(recipe: Recipe, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    recipe.isFavorite = !recipe.isFavorite;
    console.log(
      `♥ Favori ${recipe.isFavorite ? 'ajouté' : 'retiré'}: ${recipe.name}`
    );
    // TODO: Appeler le service pour persister le changement
    // this.recipeService.toggleFavorite(recipe.id).subscribe();
  }

  /**
   * Remplacer une recette
   */
  onReplace(recipe: Recipe, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    console.log(`↻ Remplacer recette: ${recipe.name}`);
    // TODO: Ouvrir un modal ou naviger vers la sélection de recettes
    // this.router.navigate(['/recipes'], {
    //   queryParams: { mealId: recipe.id, action: 'replace' }
    // });
  }

  /**
   * Ouvrir le détail d'une recette
   */
  openRecipeDetail(recipe: Recipe, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    console.log(`📖 Ouvrir détail: ${recipe.name}`);
    this.router.navigate(['/recipes', recipe.id]);
  }

  /**
   * Naviguer vers la page des recettes
   */
  navigateToRecipes(): void {
    this.router.navigate(['/recipes']);
  }
}
