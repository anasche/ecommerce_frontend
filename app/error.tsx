'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[v0] App error boundary caught:', error)
  }, [error])

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-5">
          <AlertTriangle className="w-8 h-8 text-destructive" />
        </div>
        <h1 className="text-xl font-semibold text-foreground mb-2">Something went wrong</h1>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          {error?.message || 'An unexpected error occurred. Please try again.'}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} className="rounded-xl gap-2">
            <RefreshCw className="w-4 h-4" />
            Try again
          </Button>
          <Button variant="outline" asChild className="rounded-xl">
            <Link href="/products">Back to shop</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
