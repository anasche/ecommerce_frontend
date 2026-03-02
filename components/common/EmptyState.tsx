import { PackageOpen } from 'lucide-react'

interface EmptyStateProps {
  title?: string
  description?: string
}

export default function EmptyState({
  title = 'No products found',
  description = 'Try adjusting your search or check back later.',
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-5">
        <PackageOpen className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
        {description}
      </p>
    </div>
  )
}
