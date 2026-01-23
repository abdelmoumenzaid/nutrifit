// src/app/features/recipes/recipes.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RecipeService } from './recipe.service';
import { Recipe } from './recipe.model';

type MealType = 'all' | 'breakfast' | 'lunch' | 'dinner' | 'snack';

interface RecipeCard {
  id: string;
  name: string;
  image: string;
  description: string;
  calories: number;
  time: number;
  difficulty: 'Facile' | 'Moyen' | 'Difficile';
  mealType: MealType;
  source?: string; // 🔥 badge AI
}

// mapping visuel → catégorie backend
const MEALTYPE_TO_CATEGORY: Record<MealType, string | null> = {
  all: null,
  breakfast: 'Breakfast', // Petit-déj
  lunch: 'Main',          // Déjeuner -> plats principaux
  dinner: 'Main',         // Dîner -> aussi Main
  snack: 'Dessert',       // Collation -> Dessert par ex.
};

@Component({
  selector: 'app-recipes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recipes.html',
  styleUrl: './recipes.css',
})
export class RecipesComponent implements OnInit {
  constructor(
    private router: Router,
    private recipeService: RecipeService,
    private cdr: ChangeDetectorRef
  ) {}

  search = '';
  activeFilter: MealType = 'all';

  categories: string[] = [];
  selectedCategory = '';
  showMoreFilters = false;

  loading = false;
  aiLoading = false; // 🔥
  aiPrompt = '';     // 🔥

  recipes: RecipeCard[] = [];

  // 🔥 pagination simple pour la grille
  visibleCount = 8; // 2 lignes si tu as 4 colonnes

  ngOnInit(): void {
    console.log('🟢 RecipesComponent initialized');
    this.loadRecipes();
    this.loadCategories();
  }

  loadRecipes(): void {
    console.log('loadRecipes called, search=', this.search, 'filter=', this.activeFilter);
    this.loading = true;

    const searchParts: string[] = [];

    // texte
    if (this.search.trim()) {
      searchParts.push(`title:${this.search.trim()}`);
    }

    // filtre chips
    const mappedCategory = MEALTYPE_TO_CATEGORY[this.activeFilter]; // -> null pour 'all'
    if (mappedCategory) {
      searchParts.push(`category:${mappedCategory}`);
    }

    // filtre "Plus de filtres"
    if (this.selectedCategory) {
      searchParts.push(`category:${this.selectedCategory}`);
    }

    const searchQuery = searchParts.join(',');
    console.log('searchQuery =', searchQuery);

    const obs = searchQuery
      ? this.recipeService.search(searchQuery) // seulement si texte de recherche
      : this.recipeService.getAll();          // ✅ aucun critère -> TOUTE la BD

    obs.subscribe({
      next: (recipes: Recipe[]) => {
        console.log('API returned', recipes.length, 'recipes');
        this.recipes = this.mapToRecipeCard(recipes);
        console.log('recipes after mapping =', this.recipes.length);
        this.loading = false;
        this.visibleCount = 8;      // reset à 2 lignes à chaque chargement
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur chargement', err);
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  loadCategories(): void {
    this.recipeService.getCategories().subscribe({
      next: (categories) => {
        // avant : this.categories = ['Generated AI', ...categories];
        // après : on laisse les catégories de la DB
        this.categories = categories;
      },
      error: (err) => console.error('Erreur catégories', err),
    });
  }

  // backend → UI
  private mapToRecipeCard(recipes: Recipe[]): RecipeCard[] {
    return recipes.map((r) => ({
      id: r.id,
      name: r.title,
      image: r.imageUrl || 'assets/default-recipe.jpg',
      description: r.shortDescription || '',
      calories: r.calories || 0,
      time: (r.prepMinutes || 0) + (r.cookMinutes || 0),
      difficulty: this.getDifficulty(r.calories || 0),
      mealType: 'lunch', // pour l'instant, fixe
      source: r.source,  // 🔥 badge AI
    }));
  }

  private getDifficulty(calories: number): 'Facile' | 'Moyen' | 'Difficile' {
    if (calories < 400) return 'Facile';
    if (calories < 700) return 'Moyen';
    return 'Difficile';
  }

  onSearch(): void {
    this.loadRecipes();
  }

  setFilter(filter: MealType): void {
    this.activeFilter = filter;
    this.selectedCategory = '';
    this.search = '';
    this.loadRecipes();
  }

  toggleMoreFilters(): void {
    this.showMoreFilters = !this.showMoreFilters;
  }

  applyCategoryFilter(category: string): void {
    this.selectedCategory = category;
    this.showMoreFilters = false; // ferme le panneau
    this.activeFilter = 'all';    // revient sur "Tout" visuel
    this.search = '';             // nettoie la barre de recherche
    this.loadRecipes();           // applique directement le filtre
  }

  openRecipe(recipe: RecipeCard): void {
    console.log('openRecipe', recipe.id);
    this.router.navigate(['/recipes', recipe.id]);
  }

  // 🔥 GÉNÉRATEUR AI
  generateAIRecipe(): void {
    if (!this.aiPrompt.trim()) {
      alert('Tape un prompt ! ex: "recette poulet rapide"');
      return;
    }

    this.aiLoading = true;

    this.recipeService.generateAIRecipe(this.aiPrompt).subscribe({
      next: (recipe: Recipe) => {
        const recipeCard: RecipeCard = {
          id: recipe.id,
          name: recipe.title,
          image: recipe.imageUrl || 'assets/default-recipe.jpg',
          description: recipe.shortDescription || '',
          calories: recipe.calories || 0,
          time: (recipe.prepMinutes || 0) + (recipe.cookMinutes || 0),
          difficulty: this.getDifficulty(recipe.calories || 0),
          mealType: 'lunch',
          source: 'AI', // Badge 🔥
        };

        // Ajoute en HAUT de la liste
        this.recipes = [recipeCard, ...this.recipes];

        // Reset
        this.aiPrompt = '';
        this.aiLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur AI', err);
        alert('Erreur génération AI');
        this.aiLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  // 🔥 bouton "Afficher plus"
  showMore(): void {
    this.visibleCount += 8; // charge 2 lignes de plus
  }
}
