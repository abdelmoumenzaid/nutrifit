// Import commands
import './commands';

Cypress.Commands.add('loginKeycloak', (user = 'testuser', pass = 'Test123!') => {
  cy.get('#username').clear().type(user);
  cy.get('#password').clear().type(pass);
  cy.get('#kc-login').click();
});
