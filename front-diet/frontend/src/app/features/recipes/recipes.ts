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
  lunch: 'Main', // Déjeuner -> plats principaux
  dinner: 'Main', // Dîner -> aussi Main
  snack: 'Dessert', // Collation -> Dessert par ex.
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
  aiPrompt = ''; // 🔥

  // ✅ État de pagination
  recipes: RecipeCard[] = [];
  page = 0; // page courante
  pageSize = 8; // combien par page
  hasMore = true; // y a-t-il plus de recettes ?

  ngOnInit(): void {
    console.log('🟢 RecipesComponent initialized');
    this.page = 0;
    this.loadRecipes();
    this.loadCategories();
  }

  private loadRecipes(): void {
    console.log('loadRecipes called, page =', this.page, 'search=', this.search);
    this.loading = true;

    const searchParts: string[] = [];

    // texte
    if (this.search.trim()) {
      searchParts.push(`title:${this.search.trim()}`);
    }

    // filtre chips
    const mappedCategory = MEALTYPE_TO_CATEGORY[this.activeFilter];
    if (mappedCategory) {
      searchParts.push(`category:${mappedCategory}`);
    }

    // filtre "Plus de filtres"
    if (this.selectedCategory) {
      searchParts.push(`category:${this.selectedCategory}`);
    }

    const searchQuery = searchParts.join(',');
    console.log('searchQuery =', searchQuery);

    // ✅ On appelle le service avec page et pageSize
    const obs = searchQuery
      ? this.recipeService.search(searchQuery, this.page, this.pageSize)
      : this.recipeService.getAll(this.page, this.pageSize);

    obs.subscribe({
      next: (recipes: Recipe[]) => {
        console.log('API returned', recipes.length, 'recipes for page', this.page);
        const mapped = this.mapToRecipeCard(recipes);

        // ✅ Si page 0 on remplace, sinon on concatène
        this.recipes = this.page === 0 ? mapped : [...this.recipes, ...mapped];

        console.log('recipes total after mapping =', this.recipes.length);

        // ✅ Y a-t-il plus ? Si on a reçu moins que pageSize, c'est la dernière page
        this.hasMore = mapped.length === this.pageSize;

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur chargement', err);
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private loadCategories(): void {
    this.recipeService.getCategories().subscribe({
      next: (categories) => {
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
      source: r.source, // 🔥 badge AI
    }));
  }

  private getDifficulty(calories: number): 'Facile' | 'Moyen' | 'Difficile' {
    if (calories < 400) return 'Facile';
    if (calories < 700) return 'Moyen';
    return 'Difficile';
  }

  // ✅ Réinitialise page à 0 quand on cherche/filtre
  onSearch(): void {
    this.page = 0;
    this.loadRecipes();
  }

  // ✅ Réinitialise page à 0 quand on change de filtre
  setFilter(filter: MealType): void {
    this.activeFilter = filter;
    this.selectedCategory = '';
    this.search = '';
    this.page = 0;
    this.loadRecipes();
  }

  toggleMoreFilters(): void {
    this.showMoreFilters = !this.showMoreFilters;
  }

  // ✅ Réinitialise page à 0 quand on sélectionne une catégorie
  applyCategoryFilter(category: string): void {
    this.selectedCategory = category;
    this.showMoreFilters = false;
    this.activeFilter = 'all';
    this.search = '';
    this.page = 0;
    this.loadRecipes();
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

  // ✅ Charge la page suivante
  showMore(): void {
    if (!this.hasMore || this.loading) return;
    this.page++;
    this.loadRecipes();
  }
}