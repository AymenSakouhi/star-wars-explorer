import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { RESOURCES } from '@/lib/swapi/resources'
import { RESOURCE_KEYS } from '@/lib/swapi/urls'

export function HomePage() {
  return (
    <div className="grid gap-8">
      <header className="grid gap-2">
        <h1 className="text-swapi text-3xl font-bold tracking-tight">The Star Wars Archives</h1>
        <p className="text-muted-foreground max-w-prose text-sm">
          Browse people, planets, films, species, vehicles, and starships. Everything is linked, so
          you can follow a character to their homeworld and on to the films it appears in.
        </p>
      </header>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {RESOURCE_KEYS.map((key) => (
          <li key={key}>
            <Card className="hover:border-swapi h-full p-0 transition-colors">
              <Link to={`/${key}`} className="block h-full p-5">
                <h2 className="font-semibold">{RESOURCES[key].label}</h2>
                <p className="text-muted-foreground mt-1 text-sm">{RESOURCES[key].blurb}</p>
              </Link>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  )
}
