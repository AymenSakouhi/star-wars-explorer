import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { formatLabel, formatValue } from '@/lib/format'

type Props = {
  to: string
  title: string
  fields: { key: string; value: string | number }[]
  /** Used to prefetch the detail route before the user commits to it. */
  onActivateIntent?: () => void
}

export function EntityCard({ to, title, fields, onActivateIntent }: Props) {
  return (
    <Card className="hover:border-swapi focus-within:border-swapi h-full p-0 transition-colors">
      {/* The whole card is one anchor, so keyboard navigation and focus order
          come for free rather than needing tabIndex and key handlers. */}
      <Link
        to={to}
        className="block h-full p-4"
        onMouseEnter={onActivateIntent}
        onFocus={onActivateIntent}
      >
        <h2 className="font-semibold">{title}</h2>

        <ul className="text-muted-foreground mt-2 grid gap-1 text-xs">
          {fields.map(({ key, value }) => (
            <li key={key}>
              <span className="tracking-wide uppercase">{formatLabel(key)}:</span>{' '}
              {formatValue(value)}
            </li>
          ))}
        </ul>
      </Link>
    </Card>
  )
}
