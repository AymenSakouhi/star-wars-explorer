import { Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'

type Props = {
  /** The committed value — in this app, the one in the URL. */
  value: string
  placeholder: string
  onChange: (value: string) => void
}

const DEBOUNCE_MS = 300

/**
 * Keeps the keystroke-by-keystroke value local and commits it on a debounce, so
 * the URL gains one history entry per search rather than one per keystroke.
 */
export function SearchInput({ value, placeholder, onChange }: Props) {
  const [draft, setDraft] = useState(value)

  // Resync when the committed value changes from outside — a back navigation,
  // or clicking a nav link that resets the query.
  useEffect(() => {
    setDraft(value)
  }, [value])

  useEffect(() => {
    if (draft === value) return

    const timer = setTimeout(() => {
      onChange(draft)
    }, DEBOUNCE_MS)
    return () => {
      clearTimeout(timer)
    }
  }, [draft, value, onChange])

  return (
    <div className="relative">
      <Search
        className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
        aria-hidden
      />
      <Input
        type="search"
        className="pl-9"
        value={draft}
        placeholder={placeholder}
        aria-label={placeholder}
        onChange={(event) => {
          setDraft(event.target.value)
        }}
      />
    </div>
  )
}
