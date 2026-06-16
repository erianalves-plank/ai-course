describe("Team builder", () => {
  beforeEach(() => {
    cy.visit("/team");
  });

  it("renders the team section with empty slots", () => {
    cy.get("section").contains("Your team").should("be.visible");
    cy.contains("Empty slot").should("be.visible");
  });

  it("clicking a picker fills the first empty slot", () => {
    cy.get("ul.grid > li button").first().click();
    cy.get('button[aria-label^="Remove"]').should("exist");
  });

  it("shows analysis once three Pokémon are picked", () => {
    for (let i = 0; i < 3; i++) {
      cy.get("ul.grid > li button:not(:disabled)").first().click();
    }
    cy.contains("Coverage analysis").should("be.visible");
    cy.contains(/Covered|Exposed|Stacked/).should("be.visible");
  });

  it("clear button empties all slots and hides analysis", () => {
    for (let i = 0; i < 3; i++) {
      cy.get("ul.grid > li button:not(:disabled)").first().click();
    }
    cy.contains("button", "clear").click();
    cy.contains("Coverage analysis").should("not.exist");
    cy.get('button[aria-label^="Remove"]').should("not.exist");
  });

  it("search filter narrows the picker", () => {
    cy.get('input[type="search"]').type("azumarill");
    cy.get("ul.grid > li").should("have.length.at.most", 5);
  });

  it("random button fills three slots and shows analysis", () => {
    cy.contains("button", "random").click();
    cy.contains("Coverage analysis").should("be.visible");
  });
});
