import { useNavigate } from 'react-router-dom';
import { CompactMusicPlayer } from './CompactMusicPlayer';

export function AppHeader() {
  const navigate = useNavigate();

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <button 
            onClick={() => navigate('/')}
            className="text-left hover:opacity-80 transition-opacity"
          >
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              🌸 Kotoba Dojo
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Your cozy Japanese learning companion
            </p>
          </button>
          
          <nav className="flex items-center gap-6">
            <CompactMusicPlayer />
            <button 
              onClick={() => navigate('/decks')}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors font-medium"
            >
              📚 Decks
            </button>
            <button 
              onClick={() => navigate('/browse')}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors font-medium"
            >
              🔍 Browse
            </button>
            <button 
              onClick={() => navigate('/stats')}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors font-medium"
            >
              📊 Stats
            </button>
            <button 
              onClick={() => navigate('/settings')}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors font-medium"
            >
              ⚙️ Settings
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
