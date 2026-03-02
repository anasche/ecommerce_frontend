'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShoppingBag, Tag, X } from 'lucide-react'
import { toast } from 'sonner'
import CartItemRow from '@/components/cart/CartItemRow'
import { useCart } from '@/context/CartContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

const VALID_CODES: Record<string, number> = {
  SAVE10: 10,
  WELCOME20: 20,
  MINI15: 15,
}

export default function CartPage() {
  const { items, subtotal } = useCart()
  const router = useRouter()

  const [couponInput, setCouponInput] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null)

  const shipping = subtotal >= 50 || subtotal === 0 ? 0 : 4.99
  const discountAmount = appliedCoupon ? (subtotal * appliedCoupon.discount) / 100 : 0
  const total = subtotal - discountAmount + shipping

  const handleApplyCoupon = () => {
    const code = couponInput.trim().toUpperCase()
    if (!code) return
    const discount = VALID_CODES[code]
    if (discount) {
      setAppliedCoupon({ code, discount })
      setCouponInput('')
      toast.success(`Coupon applied — ${discount}% off!`)
    } else {
      toast.error('Invalid coupon code')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground mb-8">
          Your cart {items.length > 0 && <span className="text-muted-foreground font-normal text-xl">({items.length} {items.length === 1 ? 'item' : 'items'})</span>}
        </h1>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center mb-5">
              <ShoppingBag className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">Your cart is empty</h3>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed mb-8">
              Looks like you haven&apos;t added anything yet. Explore our products and find something you love.
            </p>
            <Button asChild className="rounded-xl" size="lg">
              <Link href="/products">Start shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Cart items */}
            <div className="flex-1 min-w-0">
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                {/* Table header */}
                <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto] gap-4 px-6 py-3 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  <span>Product</span>
                  <span className="text-center w-28">Quantity</span>
                  <span className="text-right w-20">Price</span>
                  <span className="w-8" />
                </div>
                {items.map((item) => (
                  <CartItemRow key={item.product.id} item={item} />
                ))}
              </div>

              <div className="flex items-center justify-between mt-4">
                <Button asChild variant="ghost" size="sm" className="rounded-xl text-muted-foreground hover:text-foreground -ml-2">
                  <Link href="/products">
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Continue shopping
                  </Link>
                </Button>
              </div>
            </div>

            {/* Order summary */}
            <div className="w-full lg:w-80 shrink-0">
              <div className="bg-card border border-border rounded-2xl p-6 sticky top-28 space-y-5">
                <h2 className="text-base font-semibold text-foreground">Order summary</h2>

                {/* Coupon */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    Discount code
                  </p>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2">
                      <span className="text-xs font-semibold text-emerald-700">
                        {appliedCoupon.code} — {appliedCoupon.discount}% off
                      </span>
                      <button
                        onClick={() => setAppliedCoupon(null)}
                        className="text-emerald-600 hover:text-emerald-800"
                        aria-label="Remove coupon"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter code"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                        className="h-9 rounded-xl text-xs flex-1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl h-9 shrink-0"
                        onClick={handleApplyCoupon}
                      >
                        Apply
                      </Button>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-1.5">Try: SAVE10, WELCOME20, MINI15</p>
                </div>

                <Separator />

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium tabular-nums">${subtotal.toFixed(2)}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount ({appliedCoupon.discount}%)</span>
                      <span className="font-medium tabular-nums">-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium tabular-nums">
                      {shipping === 0 ? (
                        <span className="text-emerald-600">Free</span>
                      ) : (
                        `$${shipping.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Add ${(50 - subtotal).toFixed(2)} more for free shipping
                    </p>
                  )}
                </div>

                <Separator />

                <div className="flex justify-between text-base font-semibold text-foreground">
                  <span>Total</span>
                  <span className="tabular-nums">${total.toFixed(2)}</span>
                </div>

                <Button
                  className="w-full rounded-xl"
                  size="lg"
                  onClick={() => {
                    if (items.length === 0) {
                      toast.error('Your cart is empty')
                      return
                    }
                    router.push('/checkout')
                  }}
                >
                  Proceed to checkout
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Secure checkout — your data is protected
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
