// Date utilities for mobile ThinqScribe - no external dependencies
export const formatDate = (date, format = 'MMM DD') => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid Date';
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const month = months[d.getMonth()];
  const day = d.getDate().toString().padStart(2, '0');
  const year = d.getFullYear();
  
  switch (format) {
    case 'MMM DD':
      return `${month} ${day}`;
    case 'MMM DD, YYYY':
      return `${month} ${day}, ${year}`;
    default:
      return `${month} ${day}`;
  }
};

export const getTimeAgo = (date) => {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now - then;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);
  
  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffWeeks < 4) return `${diffWeeks} weeks ago`;
  if (diffMonths < 12) return `${diffMonths} months ago`;
  return `${diffYears} years ago`;
};

export const getDaysUntilDate = (date) => {
  const now = new Date();
  const target = new Date(date);
  const diffMs = target - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const isOverdue = (date) => {
  const now = new Date();
  const target = new Date(date);
  return now > target;
};

export const getCurrentMonth = () => {
  return new Date().getMonth(); // 0-based month
};

export const getCurrentYear = () => {
  return new Date().getFullYear();
};

export const isDateInCurrentMonth = (date) => {
  const d = new Date(date);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
};

export default {
  formatDate,
  getTimeAgo,
  getDaysUntilDate,
  isOverdue,
  getCurrentMonth,
  getCurrentYear,
  isDateInCurrentMonth
};
