import { useState } from 'react'
import { AuthProvider } from './auth/AuthProvider'
import { AppShell } from './components/shell/AppShell'
import { DatabasePage } from './pages/DatabasePage'

function App() {
  const [panel, setPanel] = useState('database')

  return (
    <AuthProvider>
      <AppShell activePanel={panel} onPanelChange={setPanel}>
        {panel === 'database' && <DatabasePage />}
      </AppShell>
    </AuthProvider>
  )
}

export default App
