import { mount } from "cypress/react";
import "../../src/app/globals.css";

Cypress.on("uncaught:exception", () => false);

Cypress.Commands.add("mount", mount);
