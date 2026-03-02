"use client";

import Link from "next/link";
import { Heart, ShoppingCart, Star, Eye } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  product: Product;
}

function getRating(id: string | number): number {
  const n = typeof id === "string" ? parseInt(id, 10) || id.charCodeAt(0) : id;
  return 3.5 + ((n * 17 + 7) % 15) / 10;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`${rating.toFixed(1)} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-3 h-3 ${
            star <= Math.floor(rating)
              ? "fill-amber-400 text-amber-400"
              : star - 0.5 <= rating
                ? "fill-amber-200 text-amber-400"
                : "fill-muted text-muted-foreground/30"
          }`}
        />
      ))}
      <span className="text-xs text-muted-foreground ml-1">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const [wishlisted, setWishlisted] = useState(false);
  const isOutOfStock = product.stock !== undefined && product.stock === 0;
  const rating = getRating(product.id);

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(product);
    toast.success("Added to cart", { description: product.name });
  };

  return (
    <article className="group bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
      {/* Image */}
      <Link href={`/products/${product.id}`} className="block relative">
        <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
              <span className="text-5xl font-semibold text-muted-foreground/20 select-none">
                {product.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
              <Badge variant="secondary" className="text-xs font-medium">
                Out of stock
              </Badge>
            </div>
          )}
        </div>

        {/* Wishlist button */}
        <button
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
          onClick={(e) => {
            e.preventDefault();
            setWishlisted((v) => !v);
            toast(wishlisted ? "Removed from wishlist" : "Added to wishlist", {
              description: product.name,
            });
          }}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              wishlisted ? "fill-rose-500 text-rose-500" : "text-foreground"
            }`}
          />
        </button>
      </Link>

      {/* Content */}
      <div className="p-4">
        <StarRating rating={rating} />
        <Link href={`/products/${product.id}`} className="block mt-1.5">
          <h3 className="font-semibold text-sm text-foreground truncate hover:text-muted-foreground transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-base font-semibold text-foreground mt-0.5 mb-1">
          ${product?.price}
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-1 mb-3">
          {product.description}
        </p>

        <div className="flex gap-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-xl text-xs h-9 px-3"
          >
            <Link href={`/products/${product.id}`}>
              <Eye className="w-3.5 h-3.5 mr-1.5" />
              Quick view
            </Link>
          </Button>
          <Button
            size="sm"
            className="flex-1 rounded-xl text-xs h-9"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
          >
            <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
            Add to cart
          </Button>
        </div>
      </div>
    </article>
  );
}
