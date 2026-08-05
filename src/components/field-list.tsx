import { formatLabel, formatValue } from '@/lib/format'

type Props = {
  entity: Record<string, unknown>
  fields: readonly string[]
}

export function FieldList({ entity, fields }: Props) {
  return (
    <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
      {fields.map((field) => {
        const raw = entity[field]
        const value = typeof raw === 'string' || typeof raw === 'number' ? raw : ''

        return (
          <div key={field} className="border-border/50 border-b pb-2">
            <dt className="text-muted-foreground text-xs tracking-wide uppercase">
              {formatLabel(field)}
            </dt>
            <dd className="mt-1 text-sm break-words">{formatValue(value)}</dd>
          </div>
        )
      })}
    </dl>
  )
}
