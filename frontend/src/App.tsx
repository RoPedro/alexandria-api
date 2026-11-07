import { useState } from 'react'
import { AppShell } from './components/shell/AppShell'
import { DatabasePage } from './pages/DatabasePage'

function App() {
  const [panel, setPanel] = useState('database')

  return (
    <AppShell activePanel={panel} onPanelChange={setPanel}>
      {panel === 'database' && <DatabasePage />}
    </AppShell>
  )
}

export default App
