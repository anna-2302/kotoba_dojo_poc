interface RatingButtonsProps {
  onRate: (rating: 'again' | 'good' | 'easy') => void;
  disabled?: boolean;
}

export function RatingButtons({ onRate, disabled = false }: RatingButtonsProps) {
  return (
    <div className="flex gap-4 justify-center mt-8">
      <button
        onClick={() => onRate('again')}
        disabled={disabled}
        className="px-6 py-3 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
      >
        <span className="block text-xs mb-1">1</span>
        <span className="block">Again</span>
      </button>
      <button
        onClick={() => onRate('good')}
        disabled={disabled}
        className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <span className="block text-xs mb-1">2</span>
        <span className="block">Good</span>
      </button>
      <button
        onClick={() => onRate('easy')}
        disabled={disabled}
        className="px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
      >
        <span className="block text-xs mb-1">3</span>
        <span className="block">Easy</span>
      </button>
    </div>
  );
}
