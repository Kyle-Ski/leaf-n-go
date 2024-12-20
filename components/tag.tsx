import { X } from 'lucide-react'
import { Button } from "@/components/ui/button"

interface TagProps {
  label: string
  onRemove: () => void
}

export function Tag({ label, onRemove }: TagProps) {
  return (
    <div className="inline-flex items-center bg-primary text-primary-foreground rounded-full px-3 py-1 text-sm">
      {label}
      <Button
        variant="ghost"
        size="sm"
        className="ml-2 h-5 w-5 p-0 hover:bg-primary-foreground hover:text-primary"
        onClick={onRemove}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  )
}

