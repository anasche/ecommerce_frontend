import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
}

export default function ErrorState({
  title = 'Something went wrong',
  description = 'Failed to load data. Please try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-5">
        <AlertCircle className="w-8 h-8 text-destructive" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-xs leading-relaxed mb-6">
        {description}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="rounded-xl">
          Try again
        </Button>
      )}
    </div>
  )
}
