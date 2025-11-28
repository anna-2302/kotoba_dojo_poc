import { useState } from 'react';
import type { SessionSections, SessionMeta } from '../api/types';

interface SessionStatsDetailsProps {
  sections: SessionSections;
  meta: SessionMeta;
  completedCards: number;
  againRepeats: number;
  currentSection: 'new' | 'learning' | 'review';
}

export function SessionStatsDetails({ 
  sections, 
  meta, 
  completedCards, 
  againRepeats, 
  currentSection 
}: SessionStatsDetailsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const totalCards = sections.new.length + sections.learning.length + sections.review.length;
  const progressPercentage = totalCards > 0 ? (completedCards / totalCards) * 100 : 0;
  
  // Calculate section-specific stats
  const sectionStats = {
    new: {
      total: sections.new.length,
      completed: currentSection === 'new' ? Math.min(completedCards, sections.new.length) :
                 completedCards >= sections.new.length ? sections.new.length : completedCards
    },
    learning: {
      total: sections.learning.length,
      completed: currentSection === 'learning' ? 
                 Math.min(Math.max(0, completedCards - sections.new.length), sections.learning.length) :
                 completedCards >= sections.new.length + sections.learning.length ? sections.learning.length :
                 Math.max(0, Math.min(completedCards - sections.new.length, sections.learning.length))
    },
    review: {
      total: sections.review.length,
      completed: currentSection === 'review' ? 
                 Math.min(Math.max(0, completedCards - sections.new.length - sections.learning.length), sections.review.length) :
                 Math.max(0, Math.min(completedCards - sections.new.length - sections.learning.length, sections.review.length))
    }
  };

  // Calculate performance metrics
  const accuracyRate = (completedCards + againRepeats) > 0 ? 
    ((completedCards) / (completedCards + againRepeats) * 100) : 100;
  
  const averageTime = 30; // Placeholder - could be calculated from actual timing data

  if (!isExpanded) {
    return (
      <div className="w-full max-w-4xl mx-auto mb-4">
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full p-3 rounded-lg transition-all text-left focus:outline-none"
          style={{ 
            backgroundColor: 'var(--kd-surface)', 
            borderColor: 'var(--kd-divider)',
            border: '1px solid'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--kd-surface-2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--kd-surface)';
          }}
          onFocus={(e) => {
            e.currentTarget.style.outline = '2px solid var(--kd-focus-ring)';
            e.currentTarget.style.outlineOffset = '2px';
          }}
          onBlur={(e) => {
            e.currentTarget.style.outline = 'none';
          }}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="text-lg">📊</span>
              <div>
                <div className="font-medium" style={{ color: 'var(--kd-text-primary)' }}>
                  Session Statistics
                </div>
                <div className="text-sm" style={{ color: 'var(--kd-text-secondary)' }}>
                  {Math.round(progressPercentage)}% complete • {Math.round(accuracyRate)}% accuracy
                </div>
              </div>
            </div>
            <div className="text-sm" style={{ color: 'var(--kd-text-muted)' }}>
              Click to expand ▼
            </div>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto mb-6">
      <div className="rounded-lg border" style={{ 
        backgroundColor: 'var(--kd-surface)', 
        borderColor: 'var(--kd-divider)' 
      }}>
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b" style={{ borderColor: 'var(--kd-divider)' }}>
          <div className="flex items-center gap-3">
            <span className="text-lg">📊</span>
            <h3 className="font-semibold" style={{ color: 'var(--kd-text-primary)' }}>
              Detailed Session Statistics
            </h3>
          </div>
          <button
            onClick={() => setIsExpanded(false)}
            className="p-1 rounded transition-colors"
            style={{ color: 'var(--kd-text-secondary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--kd-surface-2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            ▲ Collapse
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Overall Progress */}
          <div>
            <h4 className="font-medium mb-3" style={{ color: 'var(--kd-text-primary)' }}>
              Overall Progress
            </h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'var(--kd-surface-2)' }}>
                <div className="text-2xl font-bold" style={{ color: 'var(--kd-primary)' }}>
                  {Math.round(progressPercentage)}%
                </div>
                <div style={{ color: 'var(--kd-text-secondary)' }}>Complete</div>
              </div>
              <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'var(--kd-surface-2)' }}>
                <div className="text-2xl font-bold" style={{ color: 'var(--kd-success)' }}>
                  {Math.round(accuracyRate)}%
                </div>
                <div style={{ color: 'var(--kd-text-secondary)' }}>Accuracy</div>
              </div>
              <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'var(--kd-surface-2)' }}>
                <div className="text-2xl font-bold" style={{ color: 'var(--kd-warning)' }}>
                  {averageTime}s
                </div>
                <div style={{ color: 'var(--kd-text-secondary)' }}>Avg. Time</div>
              </div>
            </div>
          </div>

          {/* Section Breakdown */}
          <div>
            <h4 className="font-medium mb-3" style={{ color: 'var(--kd-text-primary)' }}>
              Section Breakdown
            </h4>
            <div className="grid grid-cols-3 gap-4">
              {(['new', 'learning', 'review'] as const).map((section) => {
                const stats = sectionStats[section];
                const sectionPercentage = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
                const isActive = currentSection === section;
                
                const sectionColors = {
                  new: { main: 'var(--kd-success)', bg: 'rgba(34, 197, 94, 0.1)' },
                  learning: { main: 'var(--kd-warning)', bg: 'rgba(251, 191, 36, 0.1)' },
                  review: { main: 'var(--kd-primary)', bg: 'rgba(59, 130, 246, 0.1)' },
                };
                
                return (
                  <div 
                    key={section}
                    className="p-4 rounded-lg border-2"
                    style={{
                      backgroundColor: isActive ? sectionColors[section].bg : 'var(--kd-surface-2)',
                      borderColor: isActive ? sectionColors[section].main : 'var(--kd-divider)',
                      boxShadow: isActive ? `0 0 0 2px ${sectionColors[section].main}40` : 'none'
                    }}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium capitalize" style={{ 
                        color: isActive ? sectionColors[section].main : 'var(--kd-text-primary)' 
                      }}>
                        {isActive && '👉 '}{section}
                      </span>
                      <span className="text-sm" style={{ color: 'var(--kd-text-secondary)' }}>
                        {stats.completed}/{stats.total}
                      </span>
                    </div>
                    
                    <div className="mb-2 rounded-full h-2" style={{ backgroundColor: 'var(--kd-divider)' }}>
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${sectionPercentage}%`,
                          backgroundColor: sectionColors[section].main,
                        }}
                      />
                    </div>
                    
                    <div className="text-xs" style={{ color: 'var(--kd-text-muted)' }}>
                      {Math.round(sectionPercentage)}% complete
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Deck Distribution (if available) */}
          {meta.deck_order.length > 1 && (
            <div>
              <h4 className="font-medium mb-3" style={{ color: 'var(--kd-text-primary)' }}>
                Deck Distribution
              </h4>
              <div className="space-y-2">
                {meta.deck_order.map((deckName, index) => (
                  <div key={deckName} className="flex justify-between items-center p-2 rounded" style={{ backgroundColor: 'var(--kd-surface-2)' }}>
                    <span className="text-sm" style={{ color: 'var(--kd-text-primary)' }}>
                      📚 {deckName}
                    </span>
                    <div className="text-sm" style={{ color: 'var(--kd-text-secondary)' }}>
                      Position {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Session Limits */}
          <div>
            <h4 className="font-medium mb-3" style={{ color: 'var(--kd-text-primary)' }}>
              Daily Limits
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between p-2 rounded" style={{ backgroundColor: 'var(--kd-surface-2)' }}>
                <span style={{ color: 'var(--kd-text-secondary)' }}>New Cards Limit:</span>
                <span style={{ color: 'var(--kd-text-primary)' }}>{meta.global_limits.new_per_day || 'No limit'}</span>
              </div>
              <div className="flex justify-between p-2 rounded" style={{ backgroundColor: 'var(--kd-surface-2)' }}>
                <span style={{ color: 'var(--kd-text-secondary)' }}>Review Limit:</span>
                <span style={{ color: 'var(--kd-text-primary)' }}>{meta.global_limits.review_per_day || 'No limit'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}