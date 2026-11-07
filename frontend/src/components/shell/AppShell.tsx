import type { ReactNode } from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

interface AppShellProps {
  activePanel: string
  onPanelChange: (panel: string) => void
  children: ReactNode
}

export function AppShell({
  activePanel,
  onPanelChange,
  children,
}: AppShellProps) {
  return (
    <div className="app-shell">
      <Header />
      <div className="app-body">
        <Sidebar activePanel={activePanel} onPanelChange={onPanelChange} />
        <main className="app-workspace" id="main-content">
          {children}
        </main>
      </div>
    </div>
  )
}
