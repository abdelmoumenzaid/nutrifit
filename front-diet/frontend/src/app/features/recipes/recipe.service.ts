import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Recipe } from './recipe.model';
import { environment } from '../../../environments/environment';


@Injectable({ providedIn: 'root' })
export class RecipeService {


  // ✅ FIX: Use environment.apiUrl instead of hardcoded localhost
  private readonly baseUrl = `${environment.apiUrl}recipes`;


  constructor(private http: HttpClient) {}


  getAll(): Observable<Recipe[]> {
    return this.http.get<Recipe[]>(this.baseUrl);
  }


  getById(id: string): Observable<Recipe> {
    return this.http.get<Recipe>(`${this.baseUrl}/${id}`);
  }


  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/categories`);
  }


  search(searchQuery: string): Observable<Recipe[]> {
    let params = new HttpParams();
    if (searchQuery && searchQuery.trim().length > 0) {
      params = params.set('search', searchQuery);
    }
    return this.http.get<Recipe[]>(`${this.baseUrl}/search`, { params });
  }

  // ✅ FIX: Use environment.apiUrl instead of hardcoded localhost
  generateAIRecipe(prompt: string): Observable<Recipe> {
    const params = new HttpParams().set('prompt', prompt);
    return this.http.post<Recipe>(`${environment.apiUrl}ai/generate-and-save`, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
  }
}