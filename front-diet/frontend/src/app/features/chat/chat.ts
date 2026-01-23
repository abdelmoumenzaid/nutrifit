import {
  Component,
  ViewChild,
  ElementRef,
  NgZone,
  OnInit,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { marked } from 'marked';

import {
  ChatService,
  ChatRecipeResponse,
  RecipeCard as ChatRecipeCard,
} from './chat.service';

interface Message {
  from: 'bot' | 'user';
  text?: string;
  time: string;
  htmlText?: string;
  recipes?: ChatRecipeCard[];
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './chat.html',
  styleUrls: ['./chat.css'],
})
export class ChatComponent implements OnInit, AfterViewInit {
  @ViewChild('chatMessages') chatMessages!: ElementRef<HTMLDivElement>;

  messages: Message[] = [];
  suggestions: string[] = [
    'Adapter mon plan du jour',
    'Moins de calories le soir',
    'Plus de plats marocains',
    'Recettes végétariennes',
  ];

  input = '';
  loading = false;
  private sessionId = '';

  // ✅ propriétés nécessaires pour les images
  selectedImages: string[] = [];
  imageFiles: File[] = [];

  constructor(
    private chatService: ChatService,
    private zone: NgZone,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.sessionId = this.getOrCreateSessionId();
    this.restoreMessages();

    if (this.messages.length === 0) {
      const text =
        "Bonjour ! Je suis ton coach nutrition IA. Comment puis-je t'aider aujourd'hui ?";
      this.messages.push({
        from: 'bot',
        text,
        htmlText: marked.parse(text) as string,
        time: this.nowTime(),
      });
      this.saveMessages();
    }
  }

  ngAfterViewInit(): void {
    this.scrollToBottom();
  }

  // ---- Helpers navigateur / localStorage ----

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && !!window.localStorage;
  }

  private getOrCreateSessionId(): string {
    if (!this.isBrowser()) {
      return 'ssr-session';
    }
    const existing = localStorage.getItem('chat_session_id');
    if (existing) return existing;

    const id = crypto.randomUUID();
    localStorage.setItem('chat_session_id', id);
    return id;
  }

  private restoreMessages(): void {
    if (!this.isBrowser()) {
      this.messages = [];
      return;
    }
    try {
      const raw = localStorage.getItem('chat_messages');
      if (raw) {
        this.messages = JSON.parse(raw);
      }
    } catch (e) {
      console.error('Erreur restore messages:', e);
      this.messages = [];
    }
  }

  private saveMessages(): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem('chat_messages', JSON.stringify(this.messages));
    } catch (e) {
      console.error('Erreur save messages:', e);
    }
  }

  // ---- Construction de l’historique pour le backend ----

  private buildHistoryForBackend(): { role: 'user' | 'assistant'; content: string }[] {
    return this.messages
      .filter((m) => !!m.text)
      .map((m) => ({
        role: m.from === 'user' ? 'user' : 'assistant',
        content: m.text as string,
      }));
  }

  // ---- UI helpers ----

  private nowTime(): string {
    const now = new Date();
    return now.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const el = this.chatMessages?.nativeElement;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    }, 50);
  }

  // ---- Envoi message texte ----

  send(): void {
    const text = this.input.trim();
    if (!text || this.loading) return;

    const t = this.nowTime();
    this.messages.push({ from: 'user', text, time: t });
    this.saveMessages();
    this.input = '';
    this.loading = true;
    this.scrollToBottom();

    const lower = text.toLowerCase();

    // 1) Recettes → endpoint spécial
    if (
      lower.includes('recette') ||
      lower.includes('recettes') ||
      lower.includes('plat') ||
      lower.includes('plats')
    ) {
      this.chatService.sendRecipePrompt(text, this.sessionId).subscribe({
        next: (resp: ChatRecipeResponse) => {
          this.zone.run(() => {
            this.loading = false;

            const introText = resp.intro ?? '';
            const htmlText = marked.parse(introText) as string;

            this.messages.push({
              from: 'bot',
              text: introText,
              htmlText,
              time: this.nowTime(),
              recipes:
                resp.recipes && resp.recipes.length ? resp.recipes : undefined,
            });
            this.saveMessages();
            this.scrollToBottom();
          });
        },
        error: () => {
          this.zone.run(() => {
            this.loading = false;
            const textError =
              'Désolé, une erreur est survenue. Réessaie dans un instant ou reformule ta question.';
            this.messages.push({
              from: 'bot',
              text: textError,
              htmlText: marked.parse(textError) as string,
              time: this.nowTime(),
            });
            this.saveMessages();
            this.scrollToBottom();
          });
        },
      });
      return;
    }

    // 2) Chat texte classique avec contexte
    const history = this.buildHistoryForBackend();

    this.chatService.sendMessage(text, this.sessionId, history).subscribe({
      next: (resp) => {
        this.zone.run(() => {
          this.loading = false;

          const answerText = resp.answer ?? '';
          const htmlText = marked.parse(answerText) as string;

          this.messages.push({
            from: 'bot',
            text: answerText,
            htmlText,
            time: this.nowTime(),
          });
          this.saveMessages();
          this.scrollToBottom();
        });
      },
      error: () => {
        this.zone.run(() => {
          this.loading = false;
        });
      },
    });
  }

  // ---- Gestion images ----

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.imageFiles = Array.from(input.files);
      this.selectedImages = this.imageFiles.map((file: File) =>
        URL.createObjectURL(file)
      );
    }
  }

  removeImage(index: number): void {
    this.selectedImages.splice(index, 1);
    this.imageFiles.splice(index, 1);
  }

  analyzeImages(): void {
    if (!this.imageFiles.length || this.loading) return;

    this.loading = true;
    const formData = new FormData();

    this.imageFiles.forEach((file: File) => {
      formData.append('images', file);
    });

    if (this.input.trim()) {
      formData.append('prompt', this.input.trim());
    }

    this.chatService.analyzeImages(formData).subscribe({
      next: (resp: ChatRecipeResponse) => {
        this.zone.run(() => {
          this.loading = false;
          this.messages.push({
            from: 'bot',
            text: `Recettes générées à partir de ${this.imageFiles.length} image(s) :`,
            htmlText: marked.parse(
              `Recettes générées à partir de **${this.imageFiles.length} image(s)** :`
            ) as string,
            time: this.nowTime(),
            recipes: resp.recipes,
          });
          this.saveMessages();
          this.scrollToBottom();

          this.selectedImages = [];
          this.imageFiles = [];
          this.input = '';
        });
      },
      error: () => {
        this.zone.run(() => {
          this.loading = false;
          this.messages.push({
            from: 'bot',
            text: 'Erreur analyse image. Réessaie.',
            time: this.nowTime(),
          });
          this.scrollToBottom();
        });
      },
    });
  }

  // ---- Navigation vers détail recette ----

  openRecipe(r: ChatRecipeCard): void {
    if (r.id) {
      this.router.navigate(['/recipes', r.id]);
      return;
    }

    if (!r.title) {
      console.warn('Recette sans titre, impossible de créer le détail');
      return;
    }

    const prompt = `Crée une recette détaillée pour : ${r.title}`;
    this.loading = true;

    this.chatService.materializeRecipeFromPrompt(prompt).subscribe({
      next: (recipe: any) => {
        this.zone.run(() => {
          this.loading = false;
          if (recipe && recipe.id) {
            this.router.navigate(['/recipes', recipe.id]);
          } else {
            console.error('Réponse generate-and-save sans id', recipe);
          }
        });
      },
      error: (err) => {
        this.zone.run(() => {
          this.loading = false;
          console.error('Erreur materializeRecipeFromPrompt', err);
        });
      },
    });
  }

  // ---- Effacer la conversation ----

  clearChat(): void {
    this.messages = [];
    if (this.isBrowser()) {
      try {
        localStorage.removeItem('chat_messages');
      } catch (e) {
        console.error('Erreur clear messages:', e);
      }
    }
    this.messages.push({
      from: 'bot',
      text: "Bonjour ! Je suis ton coach nutrition IA. Comment puis-je t'aider aujourd'hui ?",
      time: this.nowTime(),
    });
    this.saveMessages();
    this.scrollToBottom();
  }

  useSuggestion(s: string): void {
    this.input = s;
    this.send();
  }

  onKeyUp(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.send();
    }
  }

  trackByIndex(index: number): number {
    return index;
  }

  onRecipeImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.onerror = null;
    img.src = 'https://picsum.photos/seed/recipe-fallback/800/400';
  }
}
