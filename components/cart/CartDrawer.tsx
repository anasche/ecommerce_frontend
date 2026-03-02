"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const { items, updateQuantity, removeItem, subtotal, totalItems } = useCart();
  const router = useRouter();

  const shipping = subtotal > 0 ? (subtotal >= 50 ? 0 : 4.99) : 0;
  const total = subtotal + shipping;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md flex flex-col p-0"
      >
        <SheetHeader className="px-6 py-5 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-base font-semibold">
                Cart
                {totalItems > 0 && (
                  <span className="ml-2 text-muted-foreground font-normal">
                    ({totalItems})
                  </span>
                )}
              </SheetTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Items: {totalItems}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 rounded-lg"
              onClick={() => onOpenChange(false)}
              aria-label="Close cart"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
              <ShoppingBag className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-sm font-semibold text-foreground mb-1">
              Your cart is empty
            </p>
            <p className="text-xs text-muted-foreground mb-6">
              Add some products to get started.
            </p>
            <Button
              className="rounded-xl"
              onClick={() => {
                onOpenChange(false);
                router.push("/products");
              }}
            >
              Browse products
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 px-6">
              <div className="py-4 space-y-4">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-3">
                    {/* Image */}
                    <Link
                      href={`/products/${item.product.id}`}
                      onClick={() => onOpenChange(false)}
                      className="w-16 h-16 rounded-xl overflow-hidden bg-secondary shrink-0"
                    >
                      {item.product.image ? (
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-lg font-semibold text-muted-foreground/30">
                            {item.product.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate leading-snug">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        ${item.product.price}
                      </p>
                      {/* Qty controls */}
                      <div className="flex items-center gap-1.5 mt-2">
                        <button
                          className="w-6 h-6 rounded-lg border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity - 1)
                          }
                          aria-label="Decrease"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-semibold tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          className="w-6 h-6 rounded-lg border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity + 1)
                          }
                          aria-label="Increase"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Right side */}
                    <div className="flex flex-col items-end justify-between shrink-0">
                      <button
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        onClick={() => removeItem(item.product.id)}
                        aria-label={`Remove ${item.product.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-sm font-semibold text-foreground tabular-nums">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="border-t border-border px-6 py-5 space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium tabular-nums">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium tabular-nums">
                    {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
              </div>
              <Separator />
              <div className="flex justify-between text-base font-semibold">
                <span>Total</span>
                <span className="tabular-nums">${total.toFixed(2)}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl"
                  onClick={() => {
                    onOpenChange(false);
                    router.push("/cart");
                  }}
                >
                  View cart
                </Button>
                <Button
                  className="flex-1 rounded-xl"
                  onClick={() => {
                    if (items.length === 0) {
                      toast.error("Your cart is empty");
                      return;
                    }
                    onOpenChange(false);
                    router.push("/checkout");
                  }}
                >
                  Checkout
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
