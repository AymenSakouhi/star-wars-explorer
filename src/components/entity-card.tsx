import { Link } from 'react-router-dom'
import { formatLabel, formatValue } from '@/lib/format'

type Props = {
  to: string
  /** The SWAPI record number, shown as a catalog reference. */
  recordId: string
  title: string
  fields: { key: string; value: string | number }[]
  /** Used to prefetch the detail route before the user commits to it. */
  onActivateIntent?: () => void
}

export function EntityCard({ to, recordId, title, fields, onActivateIntent }: Props) {
  return (
    // The whole card is one anchor, so keyboard navigation and focus order come
    // for free rather than needing tabIndex and key handlers.
    <Link
      to={to}
      className="border-hairline hover:border-archive/60 hover:bg-muted/50 group flex h-full flex-col gap-3 border p-4 transition-colors"
      onMouseEnter={onActivateIntent}
      onFocus={onActivateIntent}
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="record-title text-foreground group-hover:text-archive min-w-0 text-lg leading-tight transition-colors">
          {title}
        </h2>
        <span className="readout shrink-0">{recordId.padStart(3, '0')}</span>
      </div>

      <dl className="mt-auto grid gap-1">
        {fields.map(({ key, value }) => (
          // min-w-0 on both the row and the value: without it a long value like
          // the Death Star's manufacturer blows out the grid track and puts a
          // horizontal scrollbar on the whole page.
          <div key={key} className="flex min-w-0 items-baseline gap-2">
            <dt className="readout-sm w-[6.5rem] shrink-0">{formatLabel(key)}</dt>
            <dd className="text-foreground/80 min-w-0 flex-1 truncate text-sm">
              {formatValue(value)}
            </dd>
          </div>
        ))}
      </dl>
    </Link>
  )
}
