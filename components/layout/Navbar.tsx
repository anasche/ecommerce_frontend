'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Package, Search, ShoppingCart, User, Menu, X } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import CartDrawer from '@/components/cart/CartDrawer'

const CATEGORIES = [
  { label: 'All', value: '' },
  { label: 'New', value: 'new' },
  { label: 'Popular', value: 'popular' },
  { label: 'Essentials', value: 'essentials' },
  { label: 'Deals', value: 'deals' },
]

export default function Navbar() {
  const { totalItems } = useCart()
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchValue, setSearchValue] = useState(
    searchParams.get('q') ?? ''
  )

  const activeCategory = searchParams.get('category') ?? ''
  const onProductsPage = pathname === '/products'

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (searchValue.trim()) {
      params.set('q', searchValue.trim())
    } else {
      params.delete('q')
    }
    router.push(`/products?${params.toString()}`)
  }

  const handleCategory = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set('category', value)
    } else {
      params.delete('category')
    }
    router.push(`/products?${params.toString()}`)
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-4">
            {/* Brand */}
            <Link href="/products" className="flex items-center gap-2 shrink-0">
              <div className="w-7 h-7 rounded-lg bg-foreground flex items-center justify-center">
                <Package className="w-4 h-4 text-background" />
              </div>
              <span className="font-semibold text-base tracking-tight text-foreground hidden sm:block">
                MiniMart
              </span>
            </Link>

            {/* Search — center, always visible */}
            <form
              onSubmit={handleSearch}
              className="flex-1 max-w-lg mx-auto relative"
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                type="search"
                placeholder="Search products..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="pl-9 h-9 bg-secondary border-0 rounded-xl text-sm focus-visible:ring-1 w-full"
              />
            </form>

            {/* Right actions */}
            <div className="flex items-center gap-1 shrink-0">
              {/* Account placeholder */}
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl hidden sm:flex"
                aria-label="Account"
              >
                <User className="w-5 h-5" />
              </Button>

              {/* Cart */}
              <Button
                variant="ghost"
                size="icon"
                className="relative rounded-xl"
                onClick={() => setDrawerOpen(true)}
                aria-label={`Open cart, ${totalItems} items`}
              >
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 min-w-5 px-1 text-xs flex items-center justify-center rounded-full bg-foreground text-background border-0 pointer-events-none">
                    {totalItems > 99 ? '99+' : totalItems}
                  </Badge>
                )}
              </Button>

              {/* Mobile menu toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl sm:hidden"
                onClick={() => setMobileMenuOpen((v) => !v)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Category chips — always shown */}
          <div className="flex items-center gap-2 pb-3 overflow-x-auto scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => handleCategory(cat.value)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                  activeCategory === cat.value && onProductsPage
                    ? 'bg-foreground text-background'
                    : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-border bg-background px-4 py-4 space-y-2">
            <Link
              href="/products"
              className="block text-sm font-medium text-foreground py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Products
            </Link>
            <Link
              href="/cart"
              className="block text-sm font-medium text-foreground py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Cart {totalItems > 0 && `(${totalItems})`}
            </Link>
          </div>
        )}
      </header>

      <CartDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </>
  )
}
