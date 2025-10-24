export const formatLongDate = (date: Date | string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatUppercaseDate = (date: Date | string): string => {
  const dateObj = new Date(date);

  const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
  const dateStr = dateObj.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return `${dayOfWeek} ${dateStr}`;
};

export const formatTime = (date: Date | string): string => {
  return new Date(date).toLocaleDateString('en-US', { hour: '2-digit', minute: '2-digit' });
};

export const getTimeOfDayGreeting = (hour?: number): string => {
  const currentHour = hour ?? new Date().getHours();

  if (currentHour < 12) return 'Good Morning';
  if (currentHour < 17) return 'Good Afternoon';

  return 'Good Evening';
};
