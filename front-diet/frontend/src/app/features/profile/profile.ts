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
  isLoading: boolean = true;
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
    // 🔐 ÉTAPE 1 : Vérifier si le token existe
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.warn('⚠️ No token found - Redirection vers auth-landing');
      console.log('📍 Current URL:', this.router.url);
      console.log('🔑 Token in localStorage:', localStorage.getItem('access_token'));
      
      // 🚀 Redirection avec délai minimal (laisser le temps au token d'être supprimé)
      setTimeout(() => {
        this.router.navigate(['/auth-landing'], { replaceUrl: true })
          .then(success => {
            console.log('✅ Redirection réussie vers /auth-landing:', success);
          })
          .catch(err => {
            console.error('❌ Erreur lors de la redirection:', err);
            // Fallback : redirection directe du navigateur
            window.location.href = '/auth-landing';
          });
      }, 50);
      return;
    }

    // 📥 ÉTAPE 2 : Charger le profil
    this.profileService.profile$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profile: UserProfile | null) => {
          if (profile) {
            this.userProfile = profile;
            this.name = `${profile.firstName} ${profile.lastName}`;
            this.email = profile.email;
            this.isLoading = false;
            console.log('✅ Profil affiché:', profile);
          } else {
            // ⚠️ Vérifier si on n'est pas déjà sur la page auth-landing
            if (this.router.url !== '/auth-landing') {
              console.warn('⚠️ Profil null - Redirection vers auth-landing');
              
              setTimeout(() => {
                this.router.navigate(['/auth-landing'], { replaceUrl: true })
                  .then(success => {
                    console.log('✅ Redirection réussie:', success);
                  })
                  .catch(err => {
                    console.error('❌ Erreur redirection:', err);
                    window.location.href = '/auth-landing';
                  });
              }, 50);
            }
          }
        },
        error: (err: any) => {
          console.error('❌ Erreur profil:', err);
          this.errorMessage = 'Impossible de charger le profil';
          this.isLoading = false;
          
          // Rediriger en cas d'erreur (au chargement initial seulement)
          if (this.router.url !== '/auth-landing') {
            setTimeout(() => {
              this.router.navigate(['/auth-landing'], { replaceUrl: true })
                .then(success => {
                  console.log('✅ Redirection réussie:', success);
                })
                .catch(err => {
                  console.error('❌ Erreur redirection:', err);
                  window.location.href = '/auth-landing';
                });
            }, 50);
          }
        }
      });

    // 🔄 ÉTAPE 3 : Suivre l'état de chargement
    this.profileService.isLoading$
      .pipe(takeUntil(this.destroy$))
      .subscribe((loading: boolean) => {
        this.isLoading = loading;
      });

    // 🚀 ÉTAPE 4 : Déclencher le chargement du profil
    this.profileService.loadProfile();
  }

  /**
   * 🔗 Ouvrir une section du profil
   */
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

  /**
   * 🔔 Basculer les notifications
   */
  toggleNotifications(): void {
    this.notificationsEnabled = !this.notificationsEnabled;
  }

  /**
   * 🚪 SE DÉCONNECTER
   * ✅ Appelle logoutLocal() - SANS appel API
   * ✅ Redirige IMMÉDIATEMENT vers /auth-landing
   * ✅ UNE SEULE redirection (pas de double navigation)
   * ✅ Vérification d'URL pour éviter les redirections multiples
   * ✅ replaceUrl: true pour forcer la redirection
   * ✅ Fallback window.location.href si router.navigate échoue
   */
  logout(): void {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      // ✅ APPELER logoutLocal()
      this.profileService.logoutLocal();
      console.log('✅ Logout réussi');
      
      // 🚀 Redirection FORCÉE avec fallback
      if (this.router.url !== '/auth-landing') {
        setTimeout(() => {
          this.router.navigate(['/auth-landing'], { replaceUrl: true })
            .then(success => {
              console.log('✅ Redirection vers /auth-landing:', success);
            })
            .catch(err => {
              console.error('❌ Erreur redirection:', err);
              // Fallback : redirection directe du navigateur
              window.location.href = '/auth-landing';
            });
        }, 50);
      }
    }
  }

  /**
   * 🧹 Nettoyer les subscriptions
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}











// // src/app/features/profile/profile.ts
// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { Router, RouterModule } from '@angular/router';

// interface ProfileItem {
//   key: string;
//   icon: string;
//   title: string;
//   subtitle: string;
// }

// @Component({
//   selector: 'app-profile',
//   standalone: true,
//   imports: [CommonModule, RouterModule],
//   templateUrl: './profile.html',
//   styleUrl: './profile.css',
// })
// export class ProfileComponent {
//   name = 'zaid';
//   email = 'zaid@example.com';

//   accountItems: ProfileItem[] = [
//     {
//       key: 'personal-info',
//       icon: '👤',
//       title: 'Informations personnelles',
//       subtitle: 'Nom, âge, taille, poids',
//     },
//     {
//       key: 'goal',
//       icon: '🎯',
//       title: 'Mon objectif',
//       subtitle: 'Perte, maintien ou prise de poids',
//     },
//   ];

//   preferenceItems: ProfileItem[] = [
//     {
//       key: 'diet',
//       icon: '🥗',
//       title: 'Restrictions alimentaires',
//       subtitle: 'Halal, végétarien, allergies...',
//     },
//     {
//       key: 'language',
//       icon: '🌐',
//       title: 'Langue',
//       subtitle: 'Darija, FR, AR, EN',
//     },
//   ];

//   notificationsEnabled = true;

//   stats = {
//     days: 28,
//     recipes: 142,
//     goals: 89,
//   };

//   constructor(private router: Router) {}

//   openItem(item: ProfileItem): void {
//     switch (item.key) {
//       case 'personal-info':
//         this.router.navigate(['/profil/personal-info']);
//         break;
//       case 'goal':
//         this.router.navigate(['/profil/objectif']);
//         console.log('Ouvrir objectif');
//         break;
//       case 'diet':
//         this.router.navigate(['/profil/allergie']);
//         console.log('Ouvrir restrictions alimentaires');
//         break;
//       case 'language':
//         this.router.navigate(['/profil/langue']);
//         console.log('Ouvrir langue');
//         break;
//       default:
//         console.log('Ouvrir section', item.title);
//     }
//   }

//   toggleNotifications(): void {
//     this.notificationsEnabled = !this.notificationsEnabled;
//   }

//   logout(): void {
//     console.log('Se déconnecter');
//   }
// }
