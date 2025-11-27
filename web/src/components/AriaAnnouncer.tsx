/**
 * AriaAnnouncer - Screen reader announcement component
 * Provides a global ARIA live region for announcing dynamic updates
 * Usage: Call useAriaAnnounce() hook to announce messages
 */
import { useEffect, useState } from 'react';

let announceCallback: ((message: string) => void) | null = null;

/**
 * Hook to announce messages to screen readers
 * @example
 * const announce = useAriaAnnounce();
 * announce('Theme changed to Sakura Night');
 */
export function useAriaAnnounce() {
  return (message: string) => {
    if (announceCallback) {
      announceCallback(message);
    }
  };
}

/**
 * Global ARIA live region component
 * Must be mounted once at app root level
 */
export function AriaAnnouncer() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    announceCallback = (newMessage: string) => {
      // Clear first to ensure announcement fires even for repeated messages
      setMessage('');
      setTimeout(() => setMessage(newMessage), 50);
    };

    return () => {
      announceCallback = null;
    };
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}
