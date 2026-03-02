"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  CheckCircle2,
  Loader2,
  Lock,
  Package,
  ArrowRight,
  ArrowLeft,
  MapPin,
  User,
  CreditCard,
  ShoppingBag,
  Check,
  Banknote,
} from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import { createOrder } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// ─── Schema ───────────────────────────────────────────────────────────────────
const schema = z.object({
  customerName: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().optional(),
  address: z.string().min(1, "Address is required"),
  address2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  country: z.string().min(1, "Country is required"),
});
type FormValues = z.infer<typeof schema>;

interface OrderSuccess {
  id: string | number;
  total: number;
}

const STEPS = [
  { id: 1, label: "Contact", icon: User },
  { id: 2, label: "Shipping", icon: MapPin },
  { id: 3, label: "Review", icon: CreditCard },
];

// ─── Sub-components (defined outside page to prevent remount) ─────────────────

function FieldRow({
  id,
  label,
  optional,
  error,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
        {optional && (
          <span className="text-muted-foreground font-normal ml-1">
            (optional)
          </span>
        )}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function Stepper({ current }: { current: number }) {
  return (
    <nav aria-label="Checkout steps" className="flex items-center mb-8">
      {STEPS.map((step, idx) => {
        const done = current > step.id;
        const active = current === step.id;
        const Icon = step.icon;
        return (
          <div
            key={step.id}
            className="flex items-center flex-1 last:flex-none"
          >
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <div
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all",
                  done
                    ? "bg-foreground border-foreground text-background"
                    : active
                      ? "bg-background border-foreground text-foreground"
                      : "bg-background border-border text-muted-foreground",
                )}
              >
                {done ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>
              <span
                className={cn(
                  "text-xs font-medium hidden sm:block",
                  active || done ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-2 mb-5 transition-all",
                  done ? "bg-foreground" : "bg-border",
                )}
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}

function OrderSummary({
  items,
  subtotal,
  shipping,
  total,
}: {
  items: ReturnType<typeof useCart>["items"];
  subtotal: number;
  shipping: number;
  total: number;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 sticky top-28">
      <h2 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">
        Order summary
      </h2>
      <div className="space-y-3 mb-5">
        {items.map((item) => (
          <div key={item.product.id} className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-secondary shrink-0 border border-border">
              {item.product.image ? (
                <Image
                  src={item.product.image}
                  alt={item.product.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground/40 font-bold text-sm">
                  {item.product.name.charAt(0)}
                </div>
              )}
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-foreground text-background text-[10px] font-bold flex items-center justify-center">
                {item.quantity}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">
                {item.product.name}
              </p>
              <p className="text-xs text-muted-foreground">
                ${item.product.price} each
              </p>
            </div>
            <span className="text-sm font-semibold tabular-nums text-foreground shrink-0">
              ${(item.product.price * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
      </div>
      <Separator className="mb-4" />
      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span className="tabular-nums text-foreground">
            ${subtotal.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Shipping</span>
          <span
            className={cn(
              "tabular-nums font-medium",
              shipping === 0 ? "text-emerald-600" : "text-foreground",
            )}
          >
            {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
          </span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Discount</span>
          <span className="tabular-nums text-foreground">$0.00</span>
        </div>
      </div>
      <Separator className="my-4" />
      <div className="flex justify-between text-base font-semibold text-foreground">
        <span>Total</span>
        <span className="tabular-nums">${total.toFixed(2)}</span>
      </div>
      <div className="flex items-center justify-center gap-1.5 mt-5 text-xs text-muted-foreground">
        <Lock className="w-3 h-3" />
        <span>Secured with 256-bit encryption</span>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<OrderSuccess | null>(null);

  // Defer cart check until after hydration — avoids blank flash on SSR
  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    register,
    trigger,
    watch,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
  });

  // watch() keeps review values live — no stale snapshot in step 3
  const values = watch();

  const shipping = subtotal >= 50 ? 0 : subtotal > 0 ? 4.99 : 0;
  const total = subtotal + shipping;

  const handleNext = async () => {
    const fields =
      step === 1
        ? (["customerName", "email", "phone"] as (keyof FormValues)[])
        : (["address", "address2", "city", "country"] as (keyof FormValues)[]);
    const valid = await trigger(fields);
    if (valid) setStep((s) => s + 1);
  };

  const handleBack = () => setStep((s) => s - 1);

  const handlePlaceOrder = async () => {
    const v = getValues();
    setIsSubmitting(true);
    try {
      const order = await createOrder({
        customer: {
          name: v.customerName,
          email: v.email,
          phone: v.phone,
          address: v.address,
          address2: v.address2,
          city: v.city,
          country: v.country,
        },
        items: items.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
        })),
        total,
      });
      setOrderSuccess({ id: order.id, total: order.total ?? total });
      clearCart();
      toast.success("Order placed successfully!");
    } catch {
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Always render a container — never a blank screen ──────────────────────
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* ── Order success ── */}
        {orderSuccess && (
          <div className="flex items-center justify-center py-20">
            <div className="max-w-md w-full text-center">
              <div className="relative mx-auto mb-8 w-24 h-24">
                <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-30" />
                <div className="relative w-24 h-24 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                </div>
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-2">
                Order confirmed!
              </h1>
              <p className="text-muted-foreground text-sm leading-relaxed mb-8">
                Thank you for shopping at MiniMart. We&apos;ll send a
                confirmation to your email and dispatch within 24 hours.
              </p>
              <div className="bg-card border border-border rounded-2xl overflow-hidden mb-6 text-left">
                <div className="bg-secondary/60 px-5 py-3 border-b border-border">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Order details
                  </p>
                </div>
                <div className="divide-y divide-border">
                  {[
                    {
                      label: "Order ID",
                      value: `#${orderSuccess.id}`,
                      mono: true,
                    },
                    {
                      label: "Amount charged",
                      value: `$${orderSuccess.total.toFixed(2)}`,
                      mono: false,
                    },
                    {
                      label: "Payment",
                      value: "Cash on Delivery",
                      mono: false,
                    },
                    {
                      label: "Est. delivery",
                      value: "24 – 48 hours",
                      mono: false,
                    },
                  ].map(({ label, value, mono }) => (
                    <div
                      key={label}
                      className="flex items-center justify-between px-5 py-3.5"
                    >
                      <span className="text-sm text-muted-foreground">
                        {label}
                      </span>
                      <span
                        className={cn(
                          "text-sm font-semibold text-foreground",
                          mono && "font-mono",
                        )}
                      >
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl gap-2"
                  onClick={() => toast.info("Order tracking coming soon!")}
                >
                  <Package className="w-4 h-4" />
                  Track order
                </Button>
                <Button asChild className="flex-1 rounded-xl gap-2">
                  <Link href="/products">
                    Go to products
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ── Pre-hydration spinner ── */}
        {!orderSuccess && !mounted && (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* ── Empty cart (after hydration) ── */}
        {!orderSuccess && mounted && items.length === 0 && (
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-5">
                <ShoppingBag className="w-10 h-10 text-muted-foreground" />
              </div>
              <h1 className="text-xl font-semibold text-foreground mb-2">
                Your cart is empty
              </h1>
              <p className="text-sm text-muted-foreground mb-6">
                Add some products before checking out.
              </p>
              <Button asChild className="rounded-xl">
                <Link href="/products">Go to Products</Link>
              </Button>
            </div>
          </div>
        )}

        {/* ── Checkout wizard (after hydration, cart has items) ── */}
        {!orderSuccess && mounted && items.length > 0 && (
          <>
            <div className="mb-6">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="rounded-xl text-muted-foreground -ml-2"
              >
                <Link href="/cart">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to cart
                </Link>
              </Button>
            </div>

            <div className="flex flex-col lg:flex-row gap-10 items-start">
              {/* Left: steps */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-6">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                  <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                    Secure Checkout
                  </h1>
                </div>

                <Stepper current={step} />

                {/* Step 1 — Contact */}
                {step === 1 && (
                  <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-background" />
                      </div>
                      <div>
                        <h2 className="text-base font-semibold text-foreground">
                          Contact information
                        </h2>
                        <p className="text-xs text-muted-foreground">
                          We&apos;ll use this to send your order confirmation.
                        </p>
                      </div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <FieldRow
                        id="customerName"
                        label="Full name"
                        error={errors.customerName?.message}
                      >
                        <Input
                          id="customerName"
                          placeholder="Jane Smith"
                          className="rounded-xl"
                          {...register("customerName")}
                        />
                      </FieldRow>
                      <FieldRow
                        id="phone"
                        label="Phone"
                        optional
                        error={errors.phone?.message}
                      >
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+1 555 000 0000"
                          className="rounded-xl"
                          {...register("phone")}
                        />
                      </FieldRow>
                    </div>
                    <FieldRow
                      id="email"
                      label="Email address"
                      error={errors.email?.message}
                    >
                      <Input
                        id="email"
                        type="email"
                        placeholder="jane@example.com"
                        className="rounded-xl"
                        {...register("email")}
                      />
                    </FieldRow>
                    <Button
                      className="w-full rounded-xl gap-2"
                      size="lg"
                      onClick={handleNext}
                    >
                      Continue to shipping <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                {/* Step 2 — Shipping */}
                {step === 2 && (
                  <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4 text-background" />
                      </div>
                      <div>
                        <h2 className="text-base font-semibold text-foreground">
                          Shipping address
                        </h2>
                        <p className="text-xs text-muted-foreground">
                          Where should we deliver your order?
                        </p>
                      </div>
                    </div>
                    <Separator />
                    <FieldRow
                      id="address"
                      label="Address line 1"
                      error={errors.address?.message}
                    >
                      <Input
                        id="address"
                        placeholder="123 Main St"
                        className="rounded-xl"
                        {...register("address")}
                      />
                    </FieldRow>
                    <FieldRow id="address2" label="Address line 2" optional>
                      <Input
                        id="address2"
                        placeholder="Apt, suite, floor..."
                        className="rounded-xl"
                        {...register("address2")}
                      />
                    </FieldRow>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <FieldRow
                        id="city"
                        label="City"
                        error={errors.city?.message}
                      >
                        <Input
                          id="city"
                          placeholder="New York"
                          className="rounded-xl"
                          {...register("city")}
                        />
                      </FieldRow>
                      <FieldRow
                        id="country"
                        label="Country"
                        error={errors.country?.message}
                      >
                        <Input
                          id="country"
                          placeholder="United States"
                          className="rounded-xl"
                          {...register("country")}
                        />
                      </FieldRow>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1 rounded-xl gap-2"
                        size="lg"
                        onClick={handleBack}
                      >
                        <ArrowLeft className="w-4 h-4" /> Back
                      </Button>
                      <Button
                        className="flex-1 rounded-xl gap-2"
                        size="lg"
                        onClick={handleNext}
                      >
                        Review order <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 3 — Review & Pay */}
                {step === 3 && (
                  <div className="space-y-4">
                    {/* Contact review */}
                    <div className="bg-card border border-border rounded-2xl overflow-hidden">
                      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-semibold text-foreground">
                            Contact
                          </span>
                        </div>
                        <button
                          className="text-xs text-muted-foreground hover:text-foreground underline"
                          onClick={() => setStep(1)}
                        >
                          Edit
                        </button>
                      </div>
                      <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground mb-0.5">
                            Name
                          </p>
                          <p className="font-medium text-foreground">
                            {values.customerName || "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-0.5">
                            Email
                          </p>
                          <p className="font-medium text-foreground">
                            {values.email || "—"}
                          </p>
                        </div>
                        {values.phone && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-0.5">
                              Phone
                            </p>
                            <p className="font-medium text-foreground">
                              {values.phone}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Shipping review */}
                    <div className="bg-card border border-border rounded-2xl overflow-hidden">
                      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-semibold text-foreground">
                            Shipping
                          </span>
                        </div>
                        <button
                          className="text-xs text-muted-foreground hover:text-foreground underline"
                          onClick={() => setStep(2)}
                        >
                          Edit
                        </button>
                      </div>
                      <div className="px-5 py-4 text-sm">
                        <p className="font-medium text-foreground">
                          {[values.address, values.address2]
                            .filter(Boolean)
                            .join(", ") || "—"}
                        </p>
                        <p className="text-muted-foreground mt-0.5">
                          {[values.city, values.country]
                            .filter(Boolean)
                            .join(", ") || "—"}
                        </p>
                      </div>
                    </div>

                    {/* Payment */}
                    <div className="bg-card border border-border rounded-2xl overflow-hidden">
                      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border">
                        <Banknote className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-semibold text-foreground">
                          Payment method
                        </span>
                      </div>
                      <div className="px-5 py-4">
                        <div className="flex items-center gap-3 p-3 rounded-xl border-2 border-foreground bg-secondary/40">
                          <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center shrink-0">
                            <Banknote className="w-4 h-4 text-background" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-foreground">
                              Cash on Delivery (Demo)
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Pay when your order arrives
                            </p>
                          </div>
                          <Check className="w-4 h-4 text-foreground shrink-0" />
                        </div>
                      </div>
                    </div>

                    {/* Items + totals */}
                    <div className="bg-card border border-border rounded-2xl overflow-hidden">
                      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border">
                        <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-semibold text-foreground">
                          Items ({items.reduce((s, i) => s + i.quantity, 0)})
                        </span>
                      </div>
                      <div className="px-5 py-4 space-y-3">
                        {items.map((item) => (
                          <div
                            key={item.product.id}
                            className="flex items-center gap-3"
                          >
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-secondary shrink-0">
                              {item.product.image ? (
                                <Image
                                  src={item.product.image}
                                  alt={item.product.name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-muted-foreground/40">
                                  {item.product.name.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-foreground truncate">
                                {item.product.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Qty: {item.quantity}
                              </p>
                            </div>
                            <span className="text-sm font-semibold tabular-nums text-foreground shrink-0">
                              ${(item.product.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-border px-5 py-4 space-y-2 text-sm">
                        <div className="flex justify-between text-muted-foreground">
                          <span>Subtotal</span>
                          <span className="tabular-nums text-foreground">
                            ${subtotal.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>Shipping</span>
                          <span
                            className={cn(
                              "tabular-nums font-medium",
                              shipping === 0
                                ? "text-emerald-600"
                                : "text-foreground",
                            )}
                          >
                            {shipping === 0
                              ? "Free"
                              : `$${shipping.toFixed(2)}`}
                          </span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>Discount</span>
                          <span className="tabular-nums text-foreground">
                            $0.00
                          </span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-semibold text-foreground text-base pt-1">
                          <span>Total</span>
                          <span className="tabular-nums">
                            ${total.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1 rounded-xl gap-2"
                        size="lg"
                        onClick={handleBack}
                      >
                        <ArrowLeft className="w-4 h-4" /> Back
                      </Button>
                      <Button
                        className="flex-1 rounded-xl gap-2"
                        size="lg"
                        onClick={handlePlaceOrder}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Placing
                            order…
                          </>
                        ) : (
                          <>
                            Place order · ${total.toFixed(2)}{" "}
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </Button>
                    </div>

                    <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
                      <Lock className="w-3 h-3" />
                      Your information is encrypted and secure
                    </p>
                  </div>
                )}
              </div>

              {/* Right: order summary sidebar */}
              <div className="w-full lg:w-80 shrink-0">
                <OrderSummary
                  items={items}
                  subtotal={subtotal}
                  shipping={shipping}
                  total={total}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
