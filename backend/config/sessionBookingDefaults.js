const DEFAULT_SESSION_BOOKING_CONFIG = {
  isActive: true,
  sessionName: 'TWC: Strength + Core',
  durationMinutes: 45,
  description: 'Train with Cain adult strength training with a core focus.',
  timezone: 'Asia/Calcutta',
  slots: [
    { time: '14:45', label: '02:45 PM', capacity: 10, isActive: true },
    { time: '15:45', label: '03:45 PM', capacity: 7, isActive: true },
    { time: '16:45', label: '04:45 PM', capacity: 10, isActive: true },
    { time: '19:00', label: '07:00 PM', capacity: 8, isActive: true },
  ],
  blockedDates: [],
};

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

const normalizeTimeToLabel = (timeValue = '') => {
  const value = String(timeValue || '').trim();
  const match = value.match(TIME_PATTERN);
  if (!match) {
    return value;
  }

  const hours = Number(match[1]);
  const minutes = match[2];
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const twelveHour = hours % 12 === 0 ? 12 : hours % 12;
  return `${String(twelveHour).padStart(2, '0')}:${minutes} ${suffix}`;
};

module.exports = {
  DEFAULT_SESSION_BOOKING_CONFIG,
  TIME_PATTERN,
  normalizeTimeToLabel,
};
