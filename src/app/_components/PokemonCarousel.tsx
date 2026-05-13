"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { type PokemonCardData } from "../lib/pokeapi";
import { PokemonCard } from "./PokemonCard";

const POKEBALL_RED = "#DC0A2D";

type Props = {
  pokemons: PokemonCardData[];
};

export function PokemonCarousel({ pokemons }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateAffordances = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    updateAffordances();
    el.addEventListener("scroll", updateAffordances, { passive: true });
    window.addEventListener("resize", updateAffordances);
    return () => {
      el.removeEventListener("scroll", updateAffordances);
      window.removeEventListener("resize", updateAffordances);
    };
  }, [updateAffordances]);

  const scrollBy = (direction: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("article");
    const step = card ? card.offsetWidth + 24 : el.clientWidth * 0.8;
    el.scrollBy({ left: direction * step, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-6 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-12"
      >
        {pokemons.map((p) => (
          <div key={p.id} className="snap-start">
            <PokemonCard pokemon={p} />
          </div>
        ))}
      </div>

      <ArrowButton
        direction="left"
        disabled={!canScrollLeft}
        onClick={() => scrollBy(-1)}
      />
      <ArrowButton
        direction="right"
        disabled={!canScrollRight}
        onClick={() => scrollBy(1)}
      />
    </div>
  );
}

function ArrowButton({
  direction,
  disabled,
  onClick,
}: {
  direction: "left" | "right";
  disabled: boolean;
  onClick: () => void;
}) {
  const isLeft = direction === "left";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={isLeft ? "Previous Pokémon" : "Next Pokémon"}
      className={`absolute top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full text-white shadow-lg transition-opacity ${
        isLeft ? "left-2 sm:left-4" : "right-2 sm:right-4"
      } ${disabled ? "pointer-events-none opacity-30" : "opacity-100 hover:scale-105"}`}
      style={{ backgroundColor: POKEBALL_RED }}
    >
      <svg
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {isLeft ? (
          <polyline points="15 18 9 12 15 6" />
        ) : (
          <polyline points="9 18 15 12 9 6" />
        )}
      </svg>
    </button>
  );
}
