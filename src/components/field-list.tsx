import { formatLabel, formatValue } from '@/lib/format'

type Props = {
  entity: Record<string, unknown>
  fields: readonly string[]
}

export function FieldList({ entity, fields }: Props) {
  return (
    // An odd number of fields leaves a final cell spanning one column, so its
    // bottom rule would stop halfway across. Spanning it closes the table.
    <dl className="border-hairline grid sm:grid-cols-2 sm:[&>div:last-child:nth-child(odd)]:col-span-2">
      {fields.map((field) => {
        const raw = entity[field]
        const value = typeof raw === 'string' || typeof raw === 'number' ? raw : ''

        return (
          <div key={field} className="border-hairline grid gap-1 border-b py-3 pr-6">
            <dt className="readout">{formatLabel(field)}</dt>
            <dd className="text-sm leading-relaxed break-words">{formatValue(value)}</dd>
          </div>
        )
      })}
    </dl>
  )
}
