
import type { SessionMeta } from '../api/types';

interface SectionTransitionProps {
  currentSection: 'new' | 'learning' | 'review';
  cardPosition: number;
  sectionMeta: SessionMeta;
}

export function SectionTransition({ currentSection, cardPosition, sectionMeta }: SectionTransitionProps) {
  const sectionInfo = {
    new: {
      title: 'New Cards',
      description: 'Learning new material',
      icon: '🌟',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    learning: {
      title: 'Learning Cards', 
      description: 'Cards in learning phase',
      icon: '📚',
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    },
    review: {
      title: 'Review Cards',
      description: 'Spaced repetition review',
      icon: '🔄',
      color: 'text-blue-600 dark:text-blue-400', 
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
  };
  
  const info = sectionInfo[currentSection];
  const totalInSection = sectionMeta[`total_${currentSection}` as keyof SessionMeta] as number;
  
  if (totalInSection === 0) return null;

  return (
    <div className={`w-full max-w-2xl mx-auto mb-6 p-4 rounded-lg border ${info.bgColor} ${info.color}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{info.icon}</span>
          <div>
            <h3 className="font-semibold text-lg">{info.title}</h3>
            <p className="text-sm opacity-80">{info.description}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm opacity-80">Section Progress</div>
          <div className="font-semibold">
            {/* Calculate position within current section */}
            {totalInSection > 0 ? `${Math.min(cardPosition + 1, totalInSection)} / ${totalInSection}` : '0 / 0'}
          </div>
        </div>
      </div>
    </div>
  );
}