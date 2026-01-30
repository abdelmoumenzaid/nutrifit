import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Recipe } from './recipe.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RecipeService {
  // ✅ Utilise recipeUrl (pas apiUrl!)
  private readonly baseUrl = environment.recipeUrl;

  constructor(private http: HttpClient) {}

  // ✅ NOUVELLE SIGNATURE: avec page et size
  getAll(page: number = 0, size: number = 8): Observable<Recipe[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    console.log('🔵 [RECIPE] Chargement des recettes');
    console.log('  - URL:', this.baseUrl);
    console.log('  - Page:', page, 'Size:', size);
    
    return this.http.get<Recipe[]>(this.baseUrl, { params });
  }

  getById(id: string): Observable<Recipe> {
    console.log('🔵 [RECIPE] Chargement recette ID:', id);
    console.log('  - URL:', `${this.baseUrl}/${id}`);
    
    return this.http.get<Recipe>(`${this.baseUrl}/${id}`);
  }

  getCategories(): Observable<string[]> {
    console.log('🔵 [RECIPE] Chargement des catégories');
    console.log('  - URL:', `${this.baseUrl}/categories`);
    
    return this.http.get<string[]>(`${this.baseUrl}/categories`);
  }

  // ✅ NOUVELLE SIGNATURE: avec page et size pour la recherche
  search(searchQuery: string, page: number = 0, size: number = 8): Observable<Recipe[]> {
    const params = new HttpParams()
      .set('search', searchQuery)
      .set('page', page.toString())
      .set('size', size.toString());

    console.log('🔵 [RECIPE] Recherche:', searchQuery);
    console.log('  - URL:', `${this.baseUrl}/search`);
    console.log('  - Page:', page, 'Size:', size);

    return this.http.get<Recipe[]>(`${this.baseUrl}/search`, { params });
  }

  // ✅ Génération de recette AI
  // Utilise aiChatUrl (pas apiUrl!) car c'est un endpoint AI
  generateAIRecipe(prompt: string): Observable<Recipe> {
    console.log('🔵 [AI] Génération de recette');
    console.log('  - URL:', `${environment.aiChatUrl}/recipes/generate`);
    console.log('  - Prompt:', prompt);

    // ✅ Envoie en JSON (pas en form-urlencoded!)
    return this.http.post<Recipe>(
      `${environment.aiChatUrl}/recipes/generate`,
      { prompt },  // ✅ Format JSON
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}