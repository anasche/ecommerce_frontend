'use client'

import { useState, useMemo, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import useSWR from 'swr'
import { SlidersHorizontal, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import ProductCard from '@/components/products/ProductCard'
import { ProductCardSkeleton } from '@/components/common/LoadingSkeleton'
import EmptyState from '@/components/common/EmptyState'
import ErrorState from '@/components/common/ErrorState'
import { getProducts } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

const PAGE_SIZE = 12

type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'newest'

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'featured', label: 'Featured' },
  { key: 'price-asc', label: 'Price: Low to High' },
  { key: 'price-desc', label: 'Price: High to Low' },
  { key: 'newest', label: 'Newest' },
]

// ── Filter panel lifted outside render to prevent remount ──────────────────
interface FilterPanelProps {
  priceRange: [number, number]
  maxPrice: number
  inStockOnly: boolean
  onPriceChange: (v: [number, number]) => void
  onInStockChange: (v: boolean) => void
  onReset: () => void
}

function FilterPanel({
  priceRange,
  maxPrice,
  inStockOnly,
  onPriceChange,
  onInStockChange,
  onReset,
}: FilterPanelProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Price Range</h3>
        <Slider
          min={0}
          max={maxPrice}
          step={1}
          value={priceRange}
          onValueChange={(v) => onPriceChange(v as [number, number])}
          className="mb-3"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>${priceRange[0]}</span>
          <span>${priceRange[1]}</span>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Availability</h3>
        <div className="flex items-center gap-2">
          <Switch
            id="in-stock"
            checked={inStockOnly}
            onCheckedChange={onInStockChange}
          />
          <Label htmlFor="in-stock" className="text-sm text-muted-foreground cursor-pointer">
            In stock only
          </Label>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        className="w-full rounded-xl"
        onClick={onReset}
      >
        Reset filters
      </Button>
    </div>
  )
}

function ProductsContent() {
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get('q') ?? ''

  const [sort, setSort] = useState<SortKey>('featured')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1500])
  const [inStockOnly, setInStockOnly] = useState(false)
  const [page, setPage] = useState(1)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const { data: products, error, isLoading, mutate } = useSWR('products', getProducts)

  const maxPrice = useMemo(() => {
    if (!products?.length) return 1500
    return Math.ceil(Math.max(...products.map((p) => p.price)))
  }, [products])

  const filtered = useMemo(() => {
    if (!products) return []
    let result = [...products]

    const q = searchQuery.trim().toLowerCase()
    if (q) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      )
    }

    result = result.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    )

    if (inStockOnly) {
      result = result.filter((p) => p.stock === undefined || p.stock > 0)
    }

    switch (sort) {
      case 'price-asc': result.sort((a, b) => a.price - b.price); break
      case 'price-desc': result.sort((a, b) => b.price - a.price); break
      case 'newest': result.reverse(); break
    }

    return result
  }, [products, searchQuery, priceRange, inStockOnly, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const handleSortChange = useCallback((key: SortKey) => {
    setSort(key)
    setPage(1)
  }, [])

  const handlePriceChange = useCallback((v: [number, number]) => {
    setPriceRange(v)
    setPage(1)
  }, [])

  const handleInStockChange = useCallback((v: boolean) => {
    setInStockOnly(v)
    setPage(1)
  }, [])

  const handleReset = useCallback(() => {
    setPriceRange([0, maxPrice])
    setInStockOnly(false)
    setPage(1)
  }, [maxPrice])

  const sortLabel = SORT_OPTIONS.find((o) => o.key === sort)?.label ?? 'Featured'

  const filterProps: FilterPanelProps = {
    priceRange,
    maxPrice,
    inStockOnly,
    onPriceChange: handlePriceChange,
    onInStockChange: handleInStockChange,
    onReset: handleReset,
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground text-balance">
          {searchQuery ? `Results for "${searchQuery}"` : 'Shop essentials, fast.'}
        </h1>
        <p className="mt-2 text-base text-muted-foreground leading-relaxed max-w-md">
          {searchQuery
            ? `${filtered.length} product${filtered.length !== 1 ? 's' : ''} found`
            : 'Discover a curated selection of everyday products.'}
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <p className="text-sm text-muted-foreground hidden sm:block">
          {isLoading ? 'Loading...' : `${filtered.length} product${filtered.length !== 1 ? 's' : ''}`}
        </p>

        <div className="flex items-center gap-2 ml-auto">
          <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-xl lg:hidden">
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-6">
              <SheetHeader className="mb-6">
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <FilterPanel {...filterProps} />
            </SheetContent>
          </Sheet>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-xl gap-1.5 min-w-40">
                <span className="flex-1 text-left text-xs">{sortLabel}</span>
                <ChevronDown className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 rounded-xl">
              {SORT_OPTIONS.map((opt) => (
                <DropdownMenuItem
                  key={opt.key}
                  className={`text-xs rounded-lg cursor-pointer ${sort === opt.key ? 'font-semibold' : ''}`}
                  onClick={() => handleSortChange(opt.key)}
                >
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Desktop filter sidebar */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-28 bg-card border border-border rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-foreground mb-5">Filters</h2>
            <FilterPanel {...filterProps} />
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {error && (
            <ErrorState
              description="Could not load products. Please try again."
              onRetry={() => mutate()}
            />
          )}

          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          )}

          {!isLoading && !error && filtered.length === 0 && (
            <EmptyState
              title={searchQuery ? 'No results found' : 'No products yet'}
              description={
                searchQuery
                  ? `No products match "${searchQuery}". Try different filters.`
                  : 'Check back soon for new arrivals.'
              }
            />
          )}

          {!isLoading && !error && paginated.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {paginated.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-9 h-9 rounded-xl"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                    .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
                      if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('ellipsis')
                      acc.push(p)
                      return acc
                    }, [])
                    .map((item, idx) =>
                      item === 'ellipsis' ? (
                        <span key={`e${idx}`} className="text-xs text-muted-foreground px-1">…</span>
                      ) : (
                        <Button
                          key={item}
                          variant={currentPage === item ? 'default' : 'outline'}
                          size="icon"
                          className="w-9 h-9 rounded-xl text-xs"
                          onClick={() => setPage(item as number)}
                          aria-label={`Page ${item}`}
                          aria-current={currentPage === item ? 'page' : undefined}
                        >
                          {item}
                        </Button>
                      )
                    )}

                  <Button
                    variant="outline"
                    size="icon"
                    className="w-9 h-9 rounded-xl"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                    aria-label="Next page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense>
      <ProductsContent />
    </Suspense>
  )
}
