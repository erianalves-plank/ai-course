describe("Pokédex grid", () => {
  beforeEach(() => {
    cy.visit("/pokedex");
  });

  it("renders all 151 Gen 1 Pokémon cards", () => {
    cy.get("main ul > li").should("have.length", 151);
  });

  it("shows the page title and Gen 1 label", () => {
    cy.contains("h1", "The Pokédex").should("be.visible");
    cy.contains("Generation I").should("be.visible");
  });

  it("first card links to /pokedex/1", () => {
    cy.get("main ul > li a").first().should("have.attr", "href", "/pokedex/1");
  });

  it("navigating to a card opens the detail page", () => {
    cy.get("main ul > li a").first().click();
    cy.location("pathname").should("eq", "/pokedex/1");
  });
});
