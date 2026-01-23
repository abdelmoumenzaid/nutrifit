/// <reference types="cypress" />

Cypress.Commands.add('clearAuth', () => {
  cy.clearLocalStorage('access_token');
  cy.clearLocalStorage('refresh_token');
});
