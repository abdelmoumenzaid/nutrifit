import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app';
import { appConfig } from './app/app.config';

// ✅ AJOUTE CES LIGNES (mock token pour dev)
if (!localStorage.getItem('access_token')) {
  const mockToken = 'dev-token-' + Date.now();
  localStorage.setItem('access_token', mockToken);
  console.log('✅ Mock token initialized:', mockToken);
}

bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err));
