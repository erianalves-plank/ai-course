describe("Pokédex detail", () => {
  it("renders Bulbasaur's name, genus, and stats", () => {
    cy.visit("/pokedex/1");
    cy.contains("h1", "Bulbasaur").should("be.visible");
    cy.contains("Seed Pokémon").should("be.visible");
    cy.contains("Base stats").should("be.visible");
    cy.contains("HP").should("be.visible");
  });

  it("next button on first page navigates to Ivysaur", () => {
    cy.visit("/pokedex/1");
    cy.contains("a", "N°002").click();
    cy.location("pathname").should("eq", "/pokedex/2");
    cy.contains("h1", "Ivysaur").should("be.visible");
  });

  it("renders 404 for out-of-range id", () => {
    cy.request({ url: "/pokedex/9999", failOnStatusCode: false })
      .its("status")
      .should("eq", 404);
  });

  it("renders 404 for non-numeric id", () => {
    cy.request({ url: "/pokedex/abc", failOnStatusCode: false })
      .its("status")
      .should("eq", 404);
  });
});
