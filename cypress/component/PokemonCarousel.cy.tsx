import { PokemonCarousel } from "../../src/app/_components/PokemonCarousel";
import type { PokemonCardData } from "../../src/app/lib/pokeapi";

const SAMPLE: PokemonCardData[] = Array.from({ length: 4 }, (_, i) => ({
  id: i + 1,
  name: `mon-${i + 1}`,
  types: ["normal"],
  heightM: 1,
  weightKg: 10,
  abilityName: "blaze",
  genus: "Test Pokémon",
  artworkUrl: "https://example.com/x.png",
}));

describe("<PokemonCarousel />", () => {
  it("renders a card per item", () => {
    cy.mount(<PokemonCarousel pokemons={SAMPLE} />);
    cy.get("[data-carousel-card]").should("have.length", 4);
  });

  it("left arrow starts disabled (no scroll yet)", () => {
    cy.mount(<PokemonCarousel pokemons={SAMPLE} />);
    cy.get('button[aria-label="Previous Pokémon"]').should("be.disabled");
  });

  it("renders both arrow controls with correct aria labels", () => {
    cy.mount(<PokemonCarousel pokemons={SAMPLE} />);
    cy.get('button[aria-label="Previous Pokémon"]').should("exist");
    cy.get('button[aria-label="Next Pokémon"]').should("exist");
  });
});
