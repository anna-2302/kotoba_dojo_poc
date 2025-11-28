
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
      color: 'var(--kd-success)',
      bgColor: 'var(--kd-success-bg)',
    },
    learning: {
      title: 'Learning Cards', 
      description: 'Cards in learning phase',
      icon: '📚',
      color: 'var(--kd-warning)',
      bgColor: 'var(--kd-warning-bg)',
    },
    review: {
      title: 'Review Cards',
      description: 'Spaced repetition review',
      icon: '🔄',
      color: 'var(--kd-primary)', 
      bgColor: 'var(--kd-primary-bg)',
    },
  };
  
  const info = sectionInfo[currentSection];
  const totalInSection = sectionMeta[`total_${currentSection}` as keyof SessionMeta] as number;
  
  if (totalInSection === 0) return null;

  return (
    <div className="w-full max-w-2xl mx-auto mb-6 p-4 rounded-lg border" style={{ 
      backgroundColor: info.bgColor,
      borderColor: info.color,
      color: info.color
    }}>
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