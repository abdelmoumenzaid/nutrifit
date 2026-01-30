import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

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
  // ✅ IMPORTANT: Appelle SPRING au lieu de l'agent Python !
  // Le frontend ne peut pas appeler l'agent Python directement
  // (problème CORS + localhost:8000 n'existe pas en production)
  
  // 🔵 LOCAL (développement)
  private readonly baseUrl = 'http://localhost:8080/api/public/ai';
  
  // 🟢 PRODUCTION - Décommente et change si besoin :
  // private readonly baseUrl = 'https://ton-backend-prod.com/api/public/ai';

  constructor(private http: HttpClient) {
    console.log('✅ ChatService initialisé avec URL:', this.baseUrl);
  }

  // ✅ Version avec historique
  sendMessage(
    text: string,
    sessionId: string,
    history: { role: 'user' | 'assistant'; content: string }[]
  ): Observable<ChatResponse> {
    const payload = {
      message: text,
      session_id: sessionId,  // ✅ Clé correcte
      history,
    };

    console.log('🔵 [CHAT] Envoi du message');
    console.log('  - URL:', `${this.baseUrl}/chat`);
    console.log('  - Payload:', payload);

    return this.http.post<ChatResponse>(`${this.baseUrl}/chat`, payload).pipe(
      tap(response => {
        console.log('✅ [CHAT] Réponse reçue:', response);
      }),
      catchError(error => {
        console.error('❌ [CHAT] Erreur:', error);
        return this.handleError(error, 'sendMessage');
      })
    );
  }

  // ✅ Analyse d'images
  analyzeImages(formData: FormData): Observable<ChatRecipeResponse> {
    console.log('🔵 [IMAGES] Envoi des images');
    console.log('  - URL:', `${this.baseUrl}/chat/recipes-from-images`);
    console.log('  - Nombre de fichiers:', Array.from(formData.keys()).length);

    return this.http
      .post<ChatRecipeResponse>(
        `${this.baseUrl}/chat/recipes-from-images`,
        formData
      )
      .pipe(
        tap(response => {
          console.log('✅ [IMAGES] Réponse reçue:', response);
        }),
        catchError(error => {
          console.error('❌ [IMAGES] Erreur:', error);
          return this.handleError(error, 'analyzeImages');
        })
      );
  }

  // ✅ Chat recettes
  sendRecipePrompt(prompt: string, sessionId: string): Observable<ChatRecipeResponse> {
    const payload = {
      message: prompt,
    };

    console.log('🔵 [RECIPE_PROMPT] Envoi du prompt');
    console.log('  - URL:', `${this.baseUrl}/recipes/suggest`);
    console.log('  - Payload:', payload);

    return this.http
      .post<ChatRecipeResponse>(`${this.baseUrl}/recipes/suggest`, payload)
      .pipe(
        tap(response => {
          console.log('✅ [RECIPE_PROMPT] Réponse reçue:', response);
        }),
        catchError(error => {
          console.error('❌ [RECIPE_PROMPT] Erreur:', error);
          return this.handleError(error, 'sendRecipePrompt');
        })
      );
  }

  // ✅ Générer et sauvegarder recette
  materializeRecipeFromPrompt(prompt: string): Observable<any> {
    const payload = { prompt };

    console.log('🔵 [MATERIALIZE] Envoi du prompt');
    console.log('  - URL:', `${this.baseUrl}/recipes/generate`);
    console.log('  - Payload:', payload);

    return this.http
      .post(`${this.baseUrl}/recipes/generate`, payload)
      .pipe(
        tap(response => {
          console.log('✅ [MATERIALIZE] Réponse reçue:', response);
        }),
        catchError(error => {
          console.error('❌ [MATERIALIZE] Erreur:', error);
          return this.handleError(error, 'materializeRecipeFromPrompt');
        })
      );
  }

  // ✅ Gestion centralisée des erreurs
  private handleError(error: HttpErrorResponse, context: string): Observable<never> {
    console.error(`\n❌ [${context}] Erreur HTTP détaillée:\n`, {
      status: error.status,
      statusText: error.statusText,
      message: error.message,
      url: error.url,
      error: error.error,
    });

    // Détection du type d'erreur
    if (error.status === 0) {
      console.error('🔴 ERR_CONNECTION_REFUSED ou CORS');
      console.error('   ➜ Spring backend (http://localhost:8080) n\'est pas démarré?');
      console.error('   ➜ Ou mauvaise URL configurée dans ChatService');
    } else if (error.status === 404) {
      console.error('🔴 Endpoint non trouvé');
      console.error('   ➜ Vérifier l\'URL:', error.url);
    } else if (error.status === 500) {
      console.error('🔴 Erreur serveur');
      console.error('   ➜ Vérifier les logs du backend Spring');
    } else if (error.status === 403 || error.status === 401) {
      console.error('🔴 Accès refusé');
      console.error('   ➜ Vérifier l\'authentification/CORS');
    }

    return throwError(() => error);
  }
}