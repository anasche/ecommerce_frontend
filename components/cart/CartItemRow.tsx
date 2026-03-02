"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import type { CartItem } from "@/types";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";

interface CartItemRowProps {
  item: CartItem;
}

export default function CartItemRow({ item }: CartItemRowProps) {
  const { updateQuantity, removeItem } = useCart();
  const { product, quantity } = item;

  return (
    <div className="flex items-center gap-4 py-5 border-b border-border last:border-0">
      {/* Image */}
      <div className="w-20 h-20 rounded-xl overflow-hidden bg-secondary shrink-0">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-2xl font-semibold text-muted-foreground/30">
              {product.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm text-foreground truncate">
          {product.name}
        </h4>
        <p className="text-sm text-muted-foreground mt-0.5">
          ${product.price} each
        </p>
      </div>

      {/* Quantity stepper */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="w-8 h-8 rounded-lg"
          onClick={() => updateQuantity(product.id, quantity - 1)}
          aria-label="Decrease quantity"
        >
          <Minus className="w-3 h-3" />
        </Button>
        <span className="w-8 text-center text-sm font-semibold tabular-nums">
          {quantity}
        </span>
        <Button
          variant="outline"
          size="icon"
          className="w-8 h-8 rounded-lg"
          onClick={() => updateQuantity(product.id, quantity + 1)}
          aria-label="Increase quantity"
        >
          <Plus className="w-3 h-3" />
        </Button>
      </div>

      {/* Line total */}
      <p className="w-20 text-right text-sm font-semibold text-foreground tabular-nums">
        ${(product.price * quantity).toFixed(2)}
      </p>

      {/* Remove */}
      <Button
        variant="ghost"
        size="icon"
        className="w-8 h-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        onClick={() => removeItem(product.id)}
        aria-label={`Remove ${product.name}`}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}
