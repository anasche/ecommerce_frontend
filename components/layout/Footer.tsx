import Link from 'next/link'
import { Package } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <Link href="/products" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-foreground flex items-center justify-center">
              <Package className="w-3.5 h-3.5 text-background" />
            </div>
            <span className="text-sm font-semibold text-foreground">MiniMart</span>
          </Link>

          {/* Links */}
          <nav className="flex items-center gap-5 text-xs text-muted-foreground" aria-label="Footer navigation">
            <Link href="/products" className="hover:text-foreground transition-colors">Shop</Link>
            <Link href="/cart" className="hover:text-foreground transition-colors">Cart</Link>
            <span className="hover:text-foreground transition-colors cursor-default">About</span>
            <span className="hover:text-foreground transition-colors cursor-default">Contact</span>
            <span className="hover:text-foreground transition-colors cursor-default">Privacy</span>
          </nav>

          {/* Copyright */}
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} MiniMart. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
