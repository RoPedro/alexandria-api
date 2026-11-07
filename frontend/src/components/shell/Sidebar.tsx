interface SidebarProps {
  activePanel: string
  onPanelChange: (panel: string) => void
}

const NAV_ITEMS = [{ id: 'database', label: 'Database' }]

export function Sidebar({ activePanel, onPanelChange }: SidebarProps) {
  return (
    <nav className="app-sidebar" aria-label="Primary">
      <ul className="app-sidebar__list">
        {NAV_ITEMS.map((item) => {
          const isActive = item.id === activePanel
          return (
            <li key={item.id}>
              <button
                type="button"
                className={
                  isActive
                    ? 'app-sidebar__link app-sidebar__link--active'
                    : 'app-sidebar__link'
                }
                aria-current={isActive ? 'page' : undefined}
                onClick={() => onPanelChange(item.id)}
              >
                {item.label}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
