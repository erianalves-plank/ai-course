import { mount } from "cypress/react";

Cypress.on("uncaught:exception", () => false);

Cypress.Commands.add("mount", mount);
