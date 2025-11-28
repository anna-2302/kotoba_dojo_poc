import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from './components/ThemeProvider'
import { SettingsSync } from './components/SettingsSync'
import { AriaAnnouncer } from './components/AriaAnnouncer'
import { DashboardPage } from './pages/DashboardPage'
import { EnhancedReviewPage } from './pages/EnhancedReviewPage'
import { BrowsePage } from './pages/BrowsePage'
import { CardsPage } from './pages/CardsPage'
import { StatsPage } from './pages/StatsPage'
import { SettingsPage } from './pages/SettingsPage'
import { WelcomePage } from './pages/WelcomePage'
import { Decks } from './pages/Decks'
import AmbientAudioPlayer from './components/AmbientAudioPlayer'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SettingsSync />
        <AriaAnnouncer />
        <Router>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/welcome" element={<WelcomePage />} />
            <Route path="/review" element={<EnhancedReviewPage />} />
            <Route path="/browse" element={<BrowsePage />} />
            <Route path="/cards" element={<CardsPage />} />
            <Route path="/decks" element={<Decks />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
          <AmbientAudioPlayer />
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
