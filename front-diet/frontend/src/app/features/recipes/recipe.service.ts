
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Recipe } from './recipe.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RecipeService {
  private readonly baseUrl = `${environment.apiUrl}recipes`;

  constructor(private http: HttpClient) {}

  // ✅ NOUVELLE SIGNATURE: avec page et size
  getAll(page: number = 0, size: number = 8): Observable<Recipe[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Recipe[]>(this.baseUrl, { params });
  }

  getById(id: string): Observable<Recipe> {
    return this.http.get<Recipe>(`${this.baseUrl}/${id}`);
  }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/categories`);
  }

  // ✅ NOUVELLE SIGNATURE: avec page et size pour la recherche
  search(searchQuery: string, page: number = 0, size: number = 8): Observable<Recipe[]> {
    let params = new HttpParams()
      .set('search', searchQuery)
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<Recipe[]>(`${this.baseUrl}/search`, { params });
  }

  generateAIRecipe(prompt: string): Observable<Recipe> {
    const params = new HttpParams().set('prompt', prompt);
    return this.http.post<Recipe>(`${environment.apiUrl}ai/generate-and-save`, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  }
}