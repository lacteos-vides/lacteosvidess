"use client";

import { memo } from "react";

interface ProductCardProps {
  name: string;
  price: string;
  isActive: boolean;
  delayMs: number;
}

export const ProductCard = memo(function ProductCard({
  name,
  price,
  isActive,
  delayMs,
}: ProductCardProps) {
  return (
    <div
      className="product-card-highlight animate-enter-fade-up flex items-center justify-between rounded-xl border-2 border-yellow-400/30 bg-white/15 px-6 py-4"
      data-active={isActive}
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <span className="text-xl font-bold text-white text-[40px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
        {name}
      </span>
      <span className="animate-price-pulse text-3xl font-black text-yellow-300 text-[36px] drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
        {price}
      </span>
    </div>
  );
});
