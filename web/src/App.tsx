import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from './components/ThemeProvider'
import { DashboardPage } from './pages/DashboardPage'
import { ReviewPage } from './pages/ReviewPage'
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
        <Router>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/welcome" element={<WelcomePage />} />
            <Route path="/review" element={<ReviewPage />} />
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
