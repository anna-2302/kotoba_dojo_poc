
import type { SessionSections } from '../api/types';

interface SessionProgressIndicatorProps {
  current: number;
  total: number;
  sections: SessionSections;
  currentSection: 'new' | 'learning' | 'review';
  againRepeats: number;
}

export function SessionProgressIndicator({ 
  current, 
  total, 
  sections, 
  currentSection, 
  againRepeats 
}: SessionProgressIndicatorProps) {
  const percentage = total > 0 ? (current / total) * 100 : 0;
  
  const sectionCounts = {
    new: sections.new.length,
    learning: sections.learning.length,
    review: sections.review.length,
  };
  
  const getSectionProgress = (section: 'new' | 'learning' | 'review') => {
    const startIndex = section === 'new' ? 0 :
                     section === 'learning' ? sectionCounts.new :
                     sectionCounts.new + sectionCounts.learning;
    
    const completed = Math.max(0, Math.min(current - startIndex, sectionCounts[section]));
    
    return { completed, total: sectionCounts[section] };
  };

  // Calculate completion status
  const overallProgress = total > 0 ? Math.round(percentage) : 0;
  const remainingCards = Math.max(0, total - current);
  const estimatedTimeRemaining = remainingCards * 30; // 30 seconds per card estimate

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      {/* Overall progress */}
      <div className="flex justify-between text-sm mb-2" style={{ color: 'var(--kd-text-secondary)' }}>
        <span>Session Progress: {current} / {total} ({overallProgress}%)</span>
        <div className="flex gap-4">
          <span>Again: {againRepeats}</span>
          {remainingCards > 0 && (
            <span>~{Math.ceil(estimatedTimeRemaining / 60)}min remaining</span>
          )}
        </div>
      </div>
      
      {/* Main progress bar */}
      <div
        className="w-full rounded-full h-3 mb-4"
        style={{ backgroundColor: 'var(--kd-surface-2)' }}
      >
        <div
          className="h-3 rounded-full transition-all duration-300"
          style={{
            width: `${percentage}%`,
            backgroundColor: 'var(--kd-primary)',
          }}
        />
      </div>
      
      {/* Section breakdown */}
      <div className="grid grid-cols-3 gap-4 text-sm">
        {['new', 'learning', 'review'].map((section) => {
          const sectionKey = section as 'new' | 'learning' | 'review';
          const progress = getSectionProgress(sectionKey);
          const isActive = currentSection === sectionKey;
          const sectionPercentage = progress.total > 0 ? (progress.completed / progress.total) * 100 : 0;
          
          const sectionColors = {
            new: { bar: 'var(--kd-success)' },
            learning: { bar: 'var(--kd-warning)' },
            review: { bar: 'var(--kd-primary)' },
          };
          
          const colors = sectionColors[sectionKey];
          
          return (
            <div
              key={section}
              className="p-3 rounded-lg border-2 transition-all"
              style={{
                backgroundColor: isActive ? 'var(--kd-primary-bg)' : 'var(--kd-surface)',
                borderColor: isActive ? 'var(--kd-primary)' : 'transparent',
                color: isActive ? 'var(--kd-primary)' : 'var(--kd-text-secondary)'
              }}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium capitalize">
                  {isActive && '👉 '}{section}
                </span>
                <span className="text-xs">
                  {progress.completed}/{progress.total}
                </span>
              </div>
              
              {progress.total > 0 && (
                <div className="w-full rounded-full h-2" style={{ backgroundColor: 'var(--kd-surface-2)' }}>
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${sectionPercentage}%`,
                      backgroundColor: isActive ? colors.bar : 'var(--kd-divider)',
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}