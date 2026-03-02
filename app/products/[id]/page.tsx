"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import {
  ChevronLeft,
  Minus,
  Plus,
  ShoppingCart,
  Zap,
  Truck,
  RotateCcw,
  Shield,
  Star,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import { getProduct, getProducts } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ProductDetailSkeleton } from "@/components/common/LoadingSkeleton";
import ErrorState from "@/components/common/ErrorState";
import ProductCard from "@/components/products/ProductCard";

function getRating(id: string | number): number {
  const n = typeof id === "string" ? parseInt(id, 10) || id.charCodeAt(0) : id;
  return 3.5 + ((n * 17 + 7) % 15) / 10;
}

function StarRating({ rating, count }: { rating: number; count?: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= Math.floor(rating)
                ? "fill-amber-400 text-amber-400"
                : star - 0.5 <= rating
                  ? "fill-amber-200 text-amber-400"
                  : "fill-muted text-muted-foreground/30"
            }`}
          />
        ))}
      </div>
      <span className="text-sm font-medium text-foreground">
        {rating.toFixed(1)}
      </span>
      {count && (
        <span className="text-sm text-muted-foreground">({count} reviews)</span>
      )}
    </div>
  );
}

const SAMPLE_REVIEWS = [
  {
    id: 1,
    name: "Sarah M.",
    rating: 5,
    date: "Jan 15, 2025",
    comment:
      "Exactly as described. Fast delivery, great packaging. Would definitely buy again.",
  },
  {
    id: 2,
    name: "James T.",
    rating: 4,
    date: "Dec 28, 2024",
    comment:
      "Good quality for the price. Minor cosmetic imperfection on arrival but works perfectly.",
  },
  {
    id: 3,
    name: "Priya K.",
    rating: 5,
    date: "Dec 10, 2024",
    comment:
      "Outstanding product. Highly recommend to anyone looking for reliable quality.",
  },
];

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  const {
    data: product,
    error,
    isLoading,
    mutate,
  } = useSWR(id ? ["product", id] : null, () => getProduct(id));

  const { data: allProducts } = useSWR("products", getProducts);

  const isOutOfStock = product?.stock !== undefined && product.stock === 0;

  // Simulate a small gallery by repeating the image if only one exists
  const images = product
    ? product.image
      ? [product.image, product.image, product.image]
      : []
    : [];

  const related =
    allProducts?.filter((p) => p.id !== product?.id).slice(0, 8) ?? [];

  const rating = product ? getRating(product.id) : 4.0;
  const reviewCount = product
    ? 18 +
      (((typeof product.id === "number"
        ? product.id
        : parseInt(String(product.id), 10) || 5) *
        7) %
        120)
    : 0;

  const highlights = product
    ? [
        `Premium quality ${product.name.toLowerCase()}`,
        "Ships in 1–2 business days",
        `${product.stock !== undefined ? (product.stock > 0 ? `${product.stock} units in stock` : "Currently out of stock") : "In stock and ready to ship"}`,
      ]
    : [];

  const handleAddToCart = () => {
    if (!product || isOutOfStock) return;
    addItem(product, qty);
    toast.success(`Added ${qty > 1 ? `${qty}x ` : ""}to cart`, {
      description: product.name,
    });
  };

  const handleBuyNow = () => {
    if (!product || isOutOfStock) return;
    addItem(product, qty);
    router.push("/checkout");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex items-center gap-2 text-sm text-muted-foreground"
        >
          <Link
            href="/products"
            className="hover:text-foreground transition-colors flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Products
          </Link>
          {product && (
            <>
              <span>/</span>
              <span className="text-foreground truncate max-w-xs">
                {product.name}
              </span>
            </>
          )}
        </nav>

        {/* Loading */}
        {isLoading && <ProductDetailSkeleton />}

        {/* Error */}
        {error && (
          <ErrorState
            description="Could not load this product."
            onRetry={() => mutate()}
          />
        )}

        {/* Product Detail */}
        {product && !isLoading && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 mb-16">
              {/* Left: Image Gallery */}
              <div className="flex flex-col gap-3">
                {/* Main image */}
                <div className="aspect-square rounded-2xl overflow-hidden bg-secondary relative">
                  {images.length > 0 ? (
                    <img
                      src={images[activeImage]}
                      alt={product.name}
                      className="w-full h-full object-cover transition-opacity duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-9xl font-semibold text-muted-foreground/10 select-none">
                        {product.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  {isOutOfStock && (
                    <div className="absolute top-3 left-3">
                      <Badge variant="secondary">Out of stock</Badge>
                    </div>
                  )}
                </div>

                {/* Thumbnails */}
                {images.length > 1 && (
                  <div className="flex gap-2">
                    {images.map((src, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImage(idx)}
                        className={`w-20 h-20 rounded-xl overflow-hidden bg-secondary border-2 transition-colors flex-shrink-0 ${
                          activeImage === idx
                            ? "border-foreground"
                            : "border-transparent hover:border-muted-foreground/50"
                        }`}
                        aria-label={`View image ${idx + 1}`}
                      >
                        <img
                          src={src}
                          alt={`${product.name} view ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: Product Info */}
              <div className="flex flex-col">
                <div className="flex items-start gap-3 mb-2">
                  <h1 className="flex-1 text-2xl sm:text-3xl font-semibold tracking-tight text-foreground text-balance">
                    {product.name}
                  </h1>
                  {!isOutOfStock && (
                    <Badge className="shrink-0 mt-1 bg-emerald-100 text-emerald-700 border-0 rounded-full text-xs">
                      In stock
                    </Badge>
                  )}
                </div>

                <StarRating rating={rating} count={reviewCount} />

                <div className="mt-4 mb-5">
                  <span className="text-3xl font-bold text-foreground tabular-nums">
                    ${product.price}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                  {product.description}
                </p>

                {/* Highlights */}
                <ul className="space-y-2 mb-6">
                  {highlights.map((h, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-sm text-foreground"
                    >
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                      {h}
                    </li>
                  ))}
                </ul>

                <Separator className="mb-6" />

                {/* Quantity */}
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-sm font-medium text-foreground">
                    Quantity
                  </span>
                  <div className="flex items-center border border-border rounded-xl overflow-hidden">
                    <button
                      className="w-9 h-9 flex items-center justify-center hover:bg-secondary transition-colors disabled:opacity-40"
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      disabled={isOutOfStock}
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-12 text-center text-sm font-semibold tabular-nums">
                      {qty}
                    </span>
                    <button
                      className="w-9 h-9 flex items-center justify-center hover:bg-secondary transition-colors disabled:opacity-40"
                      onClick={() => setQty((q) => q + 1)}
                      disabled={isOutOfStock}
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                  <Button
                    size="lg"
                    variant="outline"
                    className="flex-1 rounded-xl"
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {isOutOfStock ? "Out of stock" : "Add to cart"}
                  </Button>
                  <Button
                    size="lg"
                    className="flex-1 rounded-xl"
                    onClick={handleBuyNow}
                    disabled={isOutOfStock}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Buy now
                  </Button>
                </div>

                {/* Delivery info */}
                <div className="bg-secondary rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Truck className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div>
                      <span className="font-medium text-foreground">
                        Fast delivery
                      </span>
                      <span className="text-muted-foreground ml-1">
                        — Delivered in 24–48h
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <RotateCcw className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div>
                      <span className="font-medium text-foreground">
                        Free returns
                      </span>
                      <span className="text-muted-foreground ml-1">
                        — 30-day return policy
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Shield className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div>
                      <span className="font-medium text-foreground">
                        Secure checkout
                      </span>
                      <span className="text-muted-foreground ml-1">
                        — 100% protected
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs: Description / Specifications / Reviews */}
            <Tabs defaultValue="description" className="mb-16">
              <TabsList className="rounded-xl h-10 mb-6">
                <TabsTrigger value="description" className="rounded-lg text-sm">
                  Description
                </TabsTrigger>
                <TabsTrigger
                  value="specifications"
                  className="rounded-lg text-sm"
                >
                  Specifications
                </TabsTrigger>
                <TabsTrigger value="reviews" className="rounded-lg text-sm">
                  Reviews ({reviewCount})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="mt-0">
                <div className="bg-card border border-border rounded-2xl p-6">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {product.description}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-4">
                    Crafted with attention to detail, {product.name} is designed
                    to seamlessly fit into your daily routine. Whether
                    you&apos;re stocking up on essentials or treating yourself,
                    you&apos;ll appreciate the consistent quality and reliable
                    performance this product delivers.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="specifications" className="mt-0">
                <div className="bg-card border border-border rounded-2xl p-6">
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                    {[
                      { label: "Product ID", value: String(product.id) },
                      { label: "Price", value: `$${product.price}` },
                      {
                        label: "Availability",
                        value:
                          product.stock === undefined
                            ? "In stock"
                            : product.stock > 0
                              ? `${product.stock} units`
                              : "Out of stock",
                      },
                      { label: "Rating", value: `${rating.toFixed(1)} / 5.0` },
                      { label: "Delivery", value: "24–48 hours" },
                      { label: "Return policy", value: "30 days" },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex flex-col gap-1">
                        <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          {label}
                        </dt>
                        <dd className="text-sm font-medium text-foreground">
                          {value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="mt-0">
                <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
                  {/* Summary */}
                  <div className="flex items-center gap-4 pb-4 border-b border-border">
                    <div className="text-center">
                      <p className="text-4xl font-bold text-foreground">
                        {rating.toFixed(1)}
                      </p>
                      <StarRating rating={rating} />
                      <p className="text-xs text-muted-foreground mt-1">
                        {reviewCount} reviews
                      </p>
                    </div>
                  </div>

                  {/* Individual reviews */}
                  {SAMPLE_REVIEWS.map((review) => (
                    <div
                      key={review.id}
                      className="pb-5 border-b border-border last:border-0 last:pb-0"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {review.name}
                          </p>
                          <div className="flex items-center gap-1 mt-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3 h-3 ${s <= review.rating ? "fill-amber-400 text-amber-400" : "fill-muted text-muted-foreground/30"}`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {review.date}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            {/* Related products — horizontal scroll carousel */}
            {related.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-semibold text-foreground">
                    You might also like
                  </h2>
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="text-xs rounded-xl text-muted-foreground"
                  >
                    <Link href="/products">View all</Link>
                  </Button>
                </div>
                <div className="flex gap-5 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none snap-x snap-mandatory">
                  {related.map((p) => (
                    <div key={p.id} className="w-56 shrink-0 snap-start">
                      <ProductCard product={p} />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
