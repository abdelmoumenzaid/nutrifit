import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';


export interface ChatResponse {
  answer: string;
  provider: string;
}


export interface RecipeCard {
  id?: string;
  title: string;
  imageUrl?: string;
  category?: string;
  area?: string;
  calories?: number;
  readyInMinutes?: number;
  difficulty?: string;
  description?: string;
}


export interface ChatRecipeResponse {
  intro: string;
  recipes: RecipeCard[];
}


@Injectable({ providedIn: 'root' })
export class ChatService {
  // ✅ CHANGÉ: URL Railway au lieu de localhost
  private readonly baseUrl = 'https://agent-ia-production-7fb0.up.railway.app/api';


  constructor(private http: HttpClient) {}


  // ✅ Version avec historique
  sendMessage(
    text: string,
    sessionId: string,
    history: { role: 'user' | 'assistant'; content: string }[]
  ): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(`${this.baseUrl}/chat`, {
      message: text,
      session_id: sessionId,  // ✅ Corrigé: session_id (pas sessionId)
      history,
    });
  }

  // ✅ Analyse d'images
  analyzeImages(formData: FormData): Observable<ChatRecipeResponse> {
    return this.http.post<ChatRecipeResponse>(
      `${this.baseUrl}/chat/recipes-from-images`,  // ✅ Chemin corrigé
      formData
    );
  }

  // ✅ Chat recettes
  sendRecipePrompt(prompt: string, sessionId: string): Observable<ChatRecipeResponse> {
    return this.http.post<ChatRecipeResponse>(`${this.baseUrl}/recipes/suggest`, {
      message: prompt,  // ✅ Field correct pour l'endpoint
    });
  }

  // ✅ Générer et sauvegarder recette
  materializeRecipeFromPrompt(prompt: string): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/recipes/generate`,
      { prompt }  // ✅ Format JSON au lieu de form-urlencoded
    );
  }
}
