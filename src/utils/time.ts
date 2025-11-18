import { DateTime } from 'luxon';
import config from '../config/config.js';

export interface TimeUntilReset {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export interface ResinRegeneration {
  currentResin: number;
  timeUntilFull: number;
}

export const getServerResetTime = (server: keyof typeof config.genshinServers): DateTime | null => {
  const serverConfig = config.genshinServers[server];
  if (!serverConfig) return null;
  
  // Parse the reset time (e.g., "04:00")
  const [hour, minute] = serverConfig.dailyResetTime.split(':').map(Number);
  
  // Get current time in the server's timezone
  const now = DateTime.now().setZone(serverConfig.timezone);
  
  // Set the reset time for today in the server's local timezone
  let resetTime = now.set({ hour, minute, second: 0, millisecond: 0 });
  
  // If reset time has passed today, get tomorrow's reset
  if (resetTime < now) {
    resetTime = resetTime.plus({ days: 1 });
  }
  
  // Return as UTC DateTime (luxon handles DST automatically)
  return resetTime.toUTC();
};

export const getWeeklyResetTime = (server: keyof typeof config.genshinServers): DateTime | null => {
  const serverConfig = config.genshinServers[server];
  if (!serverConfig) return null;
  
  // Parse the reset time
  const [hour, minute] = serverConfig.weeklyResetTime.split(':').map(Number);
  
  // Get current time in the server's timezone
  const now = DateTime.now().setZone(serverConfig.timezone);
  
  // Set the reset time for today
  let resetTime = now.set({ hour, minute, second: 0, millisecond: 0 });
  
  // Calculate days until next Monday (ISO weekday 1)
  const targetWeekday = serverConfig.weeklyResetDay; // 1 = Monday
  const currentWeekday = now.weekday; // luxon uses ISO: 1 = Monday, 7 = Sunday
  
  let daysUntilReset = (targetWeekday - currentWeekday + 7) % 7;
  
  // If it's the reset day but the time has passed, go to next week
  if (daysUntilReset === 0 && resetTime < now) {
    daysUntilReset = 7;
  }
  
  resetTime = resetTime.plus({ days: daysUntilReset });
  
  // Return as UTC DateTime (luxon handles DST automatically)
  return resetTime.toUTC();
};

export const getTimeUntilReset = (resetTime: DateTime): TimeUntilReset => {
  const now = DateTime.utc();
  const diff = resetTime.diff(now, ['days', 'hours', 'minutes', 'seconds']).toObject();
  
  return {
    days: Math.floor(diff.days || 0),
    hours: Math.floor(diff.hours || 0),
    minutes: Math.floor(diff.minutes || 0),
    seconds: Math.floor(diff.seconds || 0),
  };
};

export const formatTimeUntilReset = (timeUntil: TimeUntilReset): string => {
  const parts: string[] = [];
  
  if (timeUntil.days > 0) parts.push(`${timeUntil.days}d`);
  if (timeUntil.hours > 0) parts.push(`${timeUntil.hours}h`);
  if (timeUntil.minutes > 0) parts.push(`${timeUntil.minutes}m`);
  if (parts.length === 0) parts.push(`${timeUntil.seconds}s`);
  
  return parts.join(' ');
};

export const getCurrentDay = (server: keyof typeof config.genshinServers): string | null => {
  const serverConfig = config.genshinServers[server];
  if (!serverConfig) return null;
  
  const now = DateTime.now().setZone(serverConfig.timezone);
  return now.toFormat('EEEE'); // Returns day name like "Monday"
};

export const calculateResinRegeneration = (currentResin: number, lastUpdated: Date): ResinRegeneration => {
  const now = DateTime.utc();
  const lastUpdate = DateTime.fromJSDate(lastUpdated);
  const minutesPassed = now.diff(lastUpdate, 'minutes').minutes;
  
  const resinGained = Math.floor(minutesPassed / config.resin.regenRate);
  const newResin = Math.min(currentResin + resinGained, config.resin.max);
  
  return {
    currentResin: newResin,
    timeUntilFull: newResin >= config.resin.max ? 0 : (config.resin.max - newResin) * config.resin.regenRate,
  };
};

export const formatResinTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) return `${mins}m`;
  return `${hours}h ${mins}m`;
};
