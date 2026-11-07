export type EntityKey = 'books' | 'authors' | 'genres'

interface EntityTabsProps {
  active: EntityKey
  onChange: (key: EntityKey) => void
}

const TABS: { key: EntityKey; label: string }[] = [
  { key: 'books', label: 'Books' },
  { key: 'authors', label: 'Authors' },
  { key: 'genres', label: 'Genres' },
]

export function EntityTabs({ active, onChange }: EntityTabsProps) {
  const move = (delta: number) => {
    const index = TABS.findIndex((tab) => tab.key === active)
    const next = TABS[(index + delta + TABS.length) % TABS.length]
    onChange(next.key)
    document.getElementById(`tab-${next.key}`)?.focus()
  }

  return (
    <div className="entity-tabs" role="tablist" aria-label="Database entities">
      {TABS.map((tab) => {
        const selected = tab.key === active
        return (
          <button
            key={tab.key}
            type="button"
            id={`tab-${tab.key}`}
            role="tab"
            aria-selected={selected}
            aria-controls={`panel-${tab.key}`}
            tabIndex={selected ? 0 : -1}
            className={
              selected
                ? 'entity-tabs__tab entity-tabs__tab--active'
                : 'entity-tabs__tab'
            }
            onClick={() => onChange(tab.key)}
            onKeyDown={(event) => {
              if (event.key === 'ArrowRight') {
                event.preventDefault()
                move(1)
              } else if (event.key === 'ArrowLeft') {
                event.preventDefault()
                move(-1)
              }
            }}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
