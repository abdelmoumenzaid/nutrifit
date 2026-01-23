import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { Navbar } from './features/navbar/navbar';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Navbar, CommonModule],
  template: `
    <div class="app-container">
      <!-- Navbar visible seulement si pas sur page auth -->
      <app-navbar *ngIf="!isAuthPage"></app-navbar>
      
      <!-- Contenu -->
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
    }
  `]
})
export class AppComponent implements OnInit, AfterViewInit {
  isAuthPage = false;

  constructor(private router: Router) {}

  ngOnInit() {
    // Vérifier au premier chargement
    this.updateAuthPageStatus();
    
    // Vérifier chaque fois que la route change
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateAuthPageStatus();
      });
  }

  ngAfterViewInit() {
    // Double check après le rendu
    setTimeout(() => this.updateAuthPageStatus(), 0);
  }

  private updateAuthPageStatus() {
    const url = this.router.url;
    const isAuth = url.includes('auth-landing') || 
                   url.includes('auth-register') || 
                   url.includes('auth-connexion') ||
                   url.includes('callback');
    
    this.isAuthPage = isAuth;
    console.log(`🔍 Auth page: ${this.isAuthPage}, URL: ${url}`);
  }
}










// import { Component, signal } from '@angular/core';
// import { RouterOutlet } from '@angular/router';
// import { Navbar } from './features/navbar/navbar';

// @Component({
//   selector: 'app-root',
//   standalone: true,
//   imports: [RouterOutlet, Navbar],
//   templateUrl: './app.html',
//   styleUrl: './app.css',
// })
// export class App {
//   protected readonly title = signal('frontend');
// }
