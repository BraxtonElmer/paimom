import cron, { ScheduledTask } from 'node-cron';
import { Client } from 'discord.js';
import { User } from '../models/index.js';
import reminderService from '../services/reminderService.js';
import { getServerResetTime, getWeeklyResetTime } from '../utils/time.js';
import logger from '../utils/logger.js';

export default class ResetNotificationJob {
  private client: Client;
  private jobs: ScheduledTask[];

  constructor(client: Client) {
    this.client = client;
    this.jobs = [];
  }

  start(): void {
    // Check every hour if we need to schedule reset notifications
    const job = cron.schedule('0 * * * *', async () => {
      try {
        await this.scheduleResetNotifications();
      } catch (error) {
        logger.error('Error scheduling reset notifications:', error);
      }
    });

    this.jobs.push(job);
    
    // Run immediately on startup
    this.scheduleResetNotifications();
    
    logger.info('Reset notification job started');
  }

  async scheduleResetNotifications(): Promise<void> {
    const users = await User.findAll({
      where: {
        notificationsEnabled: true,
      },
    });

    for (const user of users) {
      try {
        // Schedule daily reset notifications
        if (user.dailyResetNotifications) {
          await this.scheduleDailyReset(user);
        }

        // Schedule weekly reset notifications
        if (user.weeklyResetNotifications) {
          await this.scheduleWeeklyReset(user);
        }
      } catch (error) {
        logger.error(`Error scheduling notifications for user ${user.id}:`, error);
      }
    }
  }

  async scheduleDailyReset(user: User): Promise<void> {
    const resetTime = getServerResetTime(user.genshinServer);
    
    if (!resetTime) {
      logger.warn(`Failed to get reset time for server ${user.genshinServer}`);
      return;
    }
    
    // Check if reminder already exists for this reset
    const existingReminder = await reminderService.getUserReminders(user.id);
    const alreadyScheduled = existingReminder.some(r => 
      r.type === 'daily_reset' && 
      Math.abs(new Date(r.scheduledTime).getTime() - resetTime.toJSDate().getTime()) < 60000
    );

    if (!alreadyScheduled) {
      await reminderService.createDailyResetReminder(user.id, user.genshinServer);
      logger.info(`Scheduled daily reset reminder for user ${user.id}`);
    }
  }

  async scheduleWeeklyReset(user: User): Promise<void> {
    const resetTime = getWeeklyResetTime(user.genshinServer);
    
    if (!resetTime) {
      logger.warn(`Failed to get weekly reset time for server ${user.genshinServer}`);
      return;
    }
    
    // Check if reminder already exists
    const existingReminders = await reminderService.getUserReminders(user.id);
    const alreadyScheduled = existingReminders.some(r => 
      r.type === 'weekly_reset' && 
      Math.abs(new Date(r.scheduledTime).getTime() - resetTime.toJSDate().getTime()) < 60000
    );

    if (!alreadyScheduled) {
      await reminderService.createWeeklyResetReminder(user.id, user.genshinServer);
      logger.info(`Scheduled weekly reset reminder for user ${user.id}`);
    }
  }

  stop(): void {
    for (const job of this.jobs) {
      job.stop();
    }
    logger.info('Reset notification job stopped');
  }
}
