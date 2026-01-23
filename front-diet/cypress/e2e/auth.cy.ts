/// <reference types="cypress" />

describe(' Keycloak E2E', () => {
  beforeEach(() => {
    cy.clearAuth();
    cy.visit('/');
  });

  it('Login  Dashboard', () => {
    cy.contains('Login').click();
    cy.url().should('include', '8082');
    
    cy.loginKeycloak(Cypress.env('KEYCLOAK_USER'), Cypress.env('KEYCLOAK_PASS'));
    
    cy.url().should('include', '/callback');
    cy.url().should('include', '/dashboard');
    
    cy.window().its('localStorage.access_token').should('exist');
  });

  it('Guard protection', () => {
    cy.visit('/dashboard');
    cy.url().should('eq', 'http://localhost:4200/');
  });
});
