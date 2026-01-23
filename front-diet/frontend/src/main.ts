import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent  } from './app/app';
import { appConfig } from './app/app.config';
import { initializeKeycloak } from './app/core/services/keycloak.service'; // ✅ SEUL import

// ✅ Bootstrap Angular APRÈS Keycloak init
initializeKeycloak().then(() => {
  bootstrapApplication(AppComponent , appConfig).catch((err) => console.error(err));
});
