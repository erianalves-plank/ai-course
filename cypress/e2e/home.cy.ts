describe("Home page", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("renders the hero headline and CTAs", () => {
    cy.contains("h1", "Who").should("be.visible");
    cy.contains("a", "Open the Pokédex").should("have.attr", "href", "/pokedex");
    cy.contains("a", "Build a team").should("have.attr", "href", "/team");
  });

  it("renders six carousel cards from the API", () => {
    cy.get("[data-carousel-card]").should("have.length", 6);
  });

  it("right arrow scrolls the carousel forward", () => {
    cy.get('button[aria-label="Next Pokémon"]').click();
    cy.get('button[aria-label="Previous Pokémon"]').should("not.be.disabled");
  });
});
