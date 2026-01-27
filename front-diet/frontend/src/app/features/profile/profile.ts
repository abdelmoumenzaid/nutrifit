import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ProfileService, UserProfile } from '../../core/services/profile.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface ProfileItem {
  key: string;
  icon: string;
  title: string;
  subtitle: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class ProfileComponent implements OnInit, OnDestroy {
  name: string = '';
  email: string = '';
  userProfile: UserProfile | null = null;
  errorMessage: string = '';

  private destroy$ = new Subject<void>();

  accountItems: ProfileItem[] = [
    {
      key: 'personal-info',
      icon: '👤',
      title: 'Informations personnelles',
      subtitle: 'Nom, âge, taille, poids',
    },
    {
      key: 'goal',
      icon: '🎯',
      title: 'Mon objectif',
      subtitle: 'Perte, maintien ou prise de poids',
    },
  ];

  preferenceItems: ProfileItem[] = [
    {
      key: 'diet',
      icon: '🥗',
      title: 'Restrictions alimentaires',
      subtitle: 'Halal, végétarien, allergies...',
    },
    {
      key: 'language',
      icon: '🌐',
      title: 'Langue',
      subtitle: 'Darija, FR, AR, EN',
    },
  ];

  notificationsEnabled = true;
  stats = {
    days: 28,
    recipes: 142,
    goals: 89,
  };

  constructor(
    private router: Router,
    private profileService: ProfileService
  ) {}

  ngOnInit(): void {
    // 1️⃣ Vérifier s'il y a un token, sinon rediriger
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.warn('⚠️ No token found - Redirection vers auth-landing');
      this.redirectToAuth();
      return;
    }

    // 2️⃣ S'abonner au profil
    this.profileService.profile$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profile: UserProfile | null) => {
          if (profile) {
            this.userProfile = profile;
            this.name = `${profile.firstName} ${profile.lastName}`;
            this.email = profile.email;
            this.errorMessage = ''; // effacer toute erreur
            console.log('✅ Profil affiché:', profile);
          } else {
            this.userProfile = null;
            // On ne met pas d'erreur ici, error$ s'en charge
            console.warn('⚠️ Profil null (initial ou effacé)');
          }
        },
        error: (err: any) => {
          console.error('❌ Erreur lors du chargement du profil:', err);
          this.errorMessage = 'Impossible de charger le profil';
        }
      });

    // 3️⃣ S'abonner aux erreurs
    this.profileService.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe((error: string | null) => {
        if (error) {
          this.errorMessage = error;
          console.warn('⚠️ Erreur du ProfileService:', error);
        } else {
          this.errorMessage = '';
        }
      });

    // 4️⃣ Déclencher le chargement
    this.profileService.loadProfile();
  }

  openItem(item: ProfileItem): void {
    switch (item.key) {
      case 'personal-info':
        this.router.navigate(['/profil/personal-info']);
        break;
      case 'goal':
        this.router.navigate(['/profil/objectif']);
        break;
      case 'diet':
        this.router.navigate(['/profil/allergie']);
        break;
      case 'language':
        this.router.navigate(['/profil/langue']);
        break;
    }
  }

  toggleNotifications(): void {
    this.notificationsEnabled = !this.notificationsEnabled;
  }

  logout(): void {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      this.profileService.logoutLocal();
      console.log('✅ Logout réussi - Tokens supprimés');
      this.redirectToAuth();
    }
  }

  private redirectToAuth(): void {
    if (this.router.url !== '/auth-landing') {
      setTimeout(() => {
        this.router.navigate(['/auth-landing'], { replaceUrl: true })
          .then(success => {
            if (!success) {
              window.location.href = '/auth-landing';
            }
          })
          .catch(() => {
            window.location.href = '/auth-landing';
          });
      }, 50);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
