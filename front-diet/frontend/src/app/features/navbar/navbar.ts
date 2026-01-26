import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ImageService } from '../../core/services/image.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
})
export class Navbar implements OnInit {
  menuOpen = false;
  logoUrl = '';
  loading = true;

  private authService = inject(AuthService);
  private router = inject(Router);
  private imageService = inject(ImageService);

  ngOnInit(): void {
    this.loadLogoUrl();
  }

  /**
   * Charge l'URL du logo depuis l'API
   */
  loadLogoUrl(): void {
    this.imageService.getLogoUrl().subscribe(
      (response) => {
        this.logoUrl = response.url;
        this.loading = false;
        console.log('✅ Logo URL loaded:', this.logoUrl);
      },
      (error) => {
        console.error('❌ Error loading logo:', error);
        this.loading = false;
        // Fallback URL
        this.logoUrl = 'https://a92262e7c6362aa064b3345772b0e86b.r2.cloudflarestorage.com/nutrifit-image/logo-diet-32.jpg';
      }
    );
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }
}
