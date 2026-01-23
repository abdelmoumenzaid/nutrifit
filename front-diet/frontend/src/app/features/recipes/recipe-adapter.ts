// src/app/features/recipes/recipe-adapter.ts
import { Recipe } from './recipe.model';

export interface RecipeCard {
  id: string;
  name: string;
  image: string;
  description: string;
  calories: number;
  time: number;
  difficulty: 'Facile' | 'Moyen' | 'Difficile';
  mealType: 'all' | 'breakfast' | 'lunch' | 'dinner' | 'snack';
  category: string;
  source: string;
  prepMinutes: number;
}

export class RecipeAdapter {
  static toRecipeCard(recipe: Recipe): RecipeCard {
    return {
      id: recipe.id,
      name: recipe.title,
      image: recipe.imageUrl || this.getRandomImage(recipe.category || 'Other'),
      description: recipe.shortDescription || recipe.instructions?.substring(0, 100) || 'Recette délicieuse',
      calories: recipe.calories || 500,
      time: (recipe.prepMinutes || 15) + (recipe.cookMinutes || 20),
      difficulty: this.getDifficulty(recipe.calories || 500),
      mealType: 'lunch' as const,
      category: recipe.category || 'Other',
      source: recipe.source || 'Manual',
      prepMinutes: recipe.prepMinutes || 15,
    };
  }

  private static getDifficulty(calories: number): 'Facile' | 'Moyen' | 'Difficile' {
    if (calories < 400) return 'Facile';
    if (calories < 700) return 'Moyen';
    return 'Difficile';
  }

  private static getRandomImage(category: string): string {
    const images: Record<string, string[]> = {
      'Generated AI': [
        'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&fit=crop',
        'https://images.unsplash.com/photo-1555939594-58056f625634?w=400&fit=crop',
      ],
      'Main': ['https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&fit=crop'],
      'Other': ['https://via.placeholder.com/400x300/ff6b6b/ffffff?text=🍲+Recette'],
    };
    const categoryImages = images[category] || images['Other'];
    return categoryImages[Math.floor(Math.random() * categoryImages.length)];
  }
}
