import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
})
export class Navbar {
  menuOpen = false;
  private authService = inject(AuthService);
  private router = inject(Router);

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu() {
    this.menuOpen = false;
  }

  

  get isAuthenticated() {
    return this.authService.isAuthenticated();
  }
}










// import { CommonModule } from '@angular/common';
// import { Component } from '@angular/core';
// import { RouterLink, RouterLinkActive } from '@angular/router';


// @Component({
//   selector: 'app-navbar',
//   standalone: true,
//   imports: [CommonModule, RouterLink, RouterLinkActive],
//   templateUrl: './navbar.html',
//   styleUrls: ['./navbar.css'],
// })
// export class Navbar {
//  menuOpen = false;

//   toggleMenu() {
//     this.menuOpen = !this.menuOpen;
//   }

//   closeMenu() {
//     this.menuOpen = false;
//   }

// }
