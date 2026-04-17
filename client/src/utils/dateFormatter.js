/**
 * formatRelativeTime — returns a human-readable relative time string.
 *
 * @param {Date | string | number} date - The date to format
 * @returns {string} e.g. "just now", "2 minutes ago", "3 hours ago", "yesterday", "Apr 15"
 *
 * @example
 *   formatRelativeTime(new Date(Date.now() - 5 * 60 * 1000)) // "5 minutes ago"
 */
export function formatRelativeTime(date) {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diffMs = now - then;

  if (isNaN(then)) return 'Unknown time';

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 10) return 'just now';
  if (seconds < 60) return `${seconds} seconds ago`;
  if (minutes === 1) return '1 minute ago';
  if (minutes < 60) return `${minutes} minutes ago`;
  if (hours === 1) return '1 hour ago';
  if (hours < 24) return `${hours} hours ago`;
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;

  // Older than a week — show the date
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * formatTimestamp — returns a short HH:MM time string for chat bubbles.
 * @param {Date | string | number} date
 * @returns {string} e.g. "14:32"
 */
export function formatTimestamp(date) {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}
