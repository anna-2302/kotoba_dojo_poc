import React from 'react';
import type { Card } from '../api';

interface CardListProps {
  cards: Card[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onEdit: (card: Card) => void;
  onSuspendToggle: (card: Card) => void;
  onDelete?: (card: Card) => void;
}

export const CardList: React.FC<CardListProps> = ({
  cards,
  selectedId,
  onSelect,
  onEdit,
  onSuspendToggle,
  onDelete,
}) => {
  if (cards.length === 0) {
    return (
      <div className="rounded-lg p-12 text-center" style={{ backgroundColor: 'var(--kd-surface)', boxShadow: 'var(--kd-shadow-md)' }}>
        <div className="text-5xl mb-4" style={{ color: 'var(--kd-text-muted)' }}>📭</div>
        <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--kd-text-primary)' }}>
          No cards found
        </h3>
        <p style={{ color: 'var(--kd-text-secondary)' }}>
          Try adjusting your filters or search query
        </p>
      </div>
    );
  }

  const getStateColor = (state: string) => {
    switch (state) {
      case 'new':
        return { bg: 'var(--kd-success)', color: 'var(--kd-text-inverse)', opacity: '0.9' };
      case 'learning':
        return { bg: 'var(--kd-warning)', color: 'var(--kd-text-inverse)', opacity: '0.9' };
      case 'review':
        return { bg: 'var(--kd-info)', color: 'var(--kd-text-inverse)', opacity: '0.9' };
      default:
        return { bg: 'var(--kd-surface-2)', color: 'var(--kd-text-primary)', opacity: '1' };
    }
  };

  return (
    <div className="rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--kd-surface)', boxShadow: 'var(--kd-shadow-md)' }}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead style={{ backgroundColor: 'var(--kd-surface-2)' }}>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--kd-text-secondary)' }}>
                Front
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--kd-text-secondary)' }}>
                Back
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--kd-text-secondary)' }}>
                State
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--kd-text-secondary)' }}>
                Tags
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--kd-text-secondary)' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody style={{ borderTop: '1px solid var(--kd-divider)' }}>
            {cards.map(card => {
              const stateColor = getStateColor(card.state);
              const isSelected = selectedId === card.id;
              return (
                <tr
                  key={card.id}
                  onClick={() => onSelect(card.id)}
                  className="cursor-pointer transition-colors"
                  style={{
                    backgroundColor: isSelected ? 'var(--kd-hover)' : 'transparent',
                    opacity: card.suspended ? 0.5 : 1,
                    borderTop: '1px solid var(--kd-divider)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = 'var(--kd-hover)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--kd-text-primary)' }}>
                    <div className="max-w-xs truncate">
                      {card.front}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--kd-text-primary)' }}>
                    <div className="max-w-xs truncate">
                      {card.back}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                      style={{
                        backgroundColor: stateColor.bg,
                        color: stateColor.color,
                        opacity: stateColor.opacity
                      }}
                    >
                      {card.suspended ? 'Suspended' : card.state}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex flex-wrap gap-1">
                      {card.tags.slice(0, 3).map(tag => {
                        const tagName = typeof tag === 'string' ? tag : (tag as any).name;
                        const tagKey = typeof tag === 'string' ? tag : (tag as any).id;
                        return (
                          <span
                            key={tagKey}
                            className="px-2 py-1 text-xs rounded"
                            style={{
                              backgroundColor: 'var(--kd-surface-2)',
                              color: 'var(--kd-text-secondary)'
                            }}
                          >
                            {tagName}
                          </span>
                        );
                      })}
                      {card.tags.length > 3 && (
                        <span className="px-2 py-1 text-xs" style={{ color: 'var(--kd-text-muted)' }}>
                          +{card.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(card);
                        }}
                        style={{ color: 'var(--kd-link)' }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--kd-link-hover)')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--kd-link)')}
                        title="Edit (Enter)"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSuspendToggle(card);
                        }}
                        style={{ color: 'var(--kd-text-secondary)' }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--kd-text-primary)')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--kd-text-secondary)')}
                        title={`${card.suspended ? 'Resume' : 'Suspend'} (S)`}
                      >
                        {card.suspended ? 'Resume' : 'Suspend'}
                      </button>
                      {onDelete && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(card);
                          }}
                          style={{ color: 'var(--kd-danger)' }}
                          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
                          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                          title="Delete (D)"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
