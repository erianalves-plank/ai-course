import { TeamBuilder, type PokemonEntry } from "../../src/app/_components/TeamBuilder";

const SAMPLE: PokemonEntry[] = [
  { slug: "azumarill", name: "azumarill", types: ["water", "fairy"], tier: "S", rank: 1 },
  { slug: "altaria",   name: "altaria",   types: ["dragon", "flying"], tier: "S", rank: 2 },
  { slug: "registeel", name: "registeel", types: ["steel"], tier: "A+", rank: 3 },
  { slug: "medicham",  name: "medicham",  types: ["fighting", "psychic"], tier: "A", rank: 4 },
  { slug: "swampert",  name: "swampert",  types: ["water", "ground"], tier: "S", rank: 5 },
];

describe("<TeamBuilder />", () => {
  beforeEach(() => {
    cy.mount(<TeamBuilder pokemon={SAMPLE} />);
  });

  it("starts empty and shows no analysis", () => {
    cy.contains("Empty slot").should("be.visible");
    cy.contains("Coverage analysis").should("not.exist");
  });

  it("search filter narrows the picker", () => {
    cy.get('input[type="search"]').type("altaria");
    cy.get("ul.grid > li").should("have.length", 1);
    cy.contains("Altaria");
  });

  it("type filter narrows the picker", () => {
    cy.get("select").select("water");
    cy.get("ul.grid > li").each(($li) => {
      cy.wrap($li).find("span").should("contain.text", "water");
    });
  });

  it("clicking a picker fills a slot and disables the item", () => {
    cy.get("ul.grid > li").first().find("button").click();
    cy.get("ul.grid > li").first().find("button").should("be.disabled");
  });

  it("removing a slot frees it", () => {
    cy.get("ul.grid > li").first().find("button").click();
    cy.get('button[aria-label^="Remove"]').first().click();
    cy.get('button[aria-label^="Remove"]').should("not.exist");
  });

  it("filling three slots shows the analysis", () => {
    for (let i = 0; i < 3; i++) {
      cy.get("ul.grid > li button:not(:disabled)").first().click();
    }
    cy.contains("Coverage analysis").should("be.visible");
  });

  it("clear button empties all slots", () => {
    for (let i = 0; i < 3; i++) {
      cy.get("ul.grid > li button:not(:disabled)").first().click();
    }
    cy.contains("button", "clear").click();
    cy.contains("Coverage analysis").should("not.exist");
  });

  it("random fills three slots", () => {
    cy.contains("button", "random").click();
    cy.contains("Coverage analysis").should("be.visible");
  });
});
