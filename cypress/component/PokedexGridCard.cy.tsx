import { PokedexGridCard } from "../../src/app/_components/PokedexGridCard";
import type { PokemonGridData } from "../../src/app/lib/pokeapi";

const PIKACHU: PokemonGridData = {
  id: 25,
  name: "pikachu",
  types: ["electric"],
  artworkUrl: "https://example.com/pikachu.png",
};

describe("<PokedexGridCard />", () => {
  it("renders the title-cased name", () => {
    cy.mount(<PokedexGridCard pokemon={PIKACHU} />);
    cy.contains("Pikachu").should("be.visible");
  });

  it("renders the formatted dex id", () => {
    cy.mount(<PokedexGridCard pokemon={PIKACHU} />);
    cy.contains("N°025").should("be.visible");
  });

  it("renders a type pill for each type", () => {
    cy.mount(<PokedexGridCard pokemon={PIKACHU} />);
    cy.contains("span", "electric").should("be.visible");
  });

  it("links to the detail route", () => {
    cy.mount(<PokedexGridCard pokemon={PIKACHU} />);
    cy.get("a").should("have.attr", "href", "/pokedex/25");
  });

  it("renders dual types", () => {
    const bulbasaur: PokemonGridData = {
      id: 1,
      name: "bulbasaur",
      types: ["grass", "poison"],
      artworkUrl: "https://example.com/bulba.png",
    };
    cy.mount(<PokedexGridCard pokemon={bulbasaur} />);
    cy.contains("span", "grass");
    cy.contains("span", "poison");
  });
});
