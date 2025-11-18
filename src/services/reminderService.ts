import { Op } from 'sequelize';
import { Reminder } from '../models/index.js';
import { ReminderType } from '../models/Reminder.js';
import { GenshinServersConfig } from '../config/config.js';
import { DateTime } from 'luxon';
import logger from '../utils/logger.js';

interface CreateReminderData {
  type: ReminderType;
  title: string;
  message?: string | null;
  scheduledTime: Date;
  recurring?: boolean;
  recurringPattern?: string | null;
  metadata?: Record<string, any>;
}

export class ReminderService {
  async createReminder(userId: string, data: CreateReminderData): Promise<Reminder> {
    try {
      const reminder = await Reminder.create({
        userId,
        type: data.type,
        title: data.title,
        message: data.message || null,
        scheduledTime: data.scheduledTime,
        recurring: data.recurring || false,
        recurringPattern: data.recurringPattern || null,
        metadata: data.metadata || {},
      });

      logger.info(`Created reminder for user ${userId}: ${data.title}`);
      return reminder;
    } catch (error) {
      logger.error(`Error creating reminder for user ${userId}:`, error);
      throw error;
    }
  }

  async getUserReminders(userId: string): Promise<Reminder[]> {
    try {
      return await Reminder.findAll({
        where: {
          userId,
          sent: false,
        },
        order: [['scheduledTime', 'ASC']],
      });
    } catch (error) {
      logger.error(`Error getting reminders for user ${userId}:`, error);
      throw error;
    }
  }

  async getPendingReminders(): Promise<Reminder[]> {
    try {
      const now = new Date();
      
      return await Reminder.findAll({
        where: {
          sent: false,
          scheduledTime: {
            [Op.lte]: now,
          },
        },
      });
    } catch (error) {
      logger.error('Error getting pending reminders:', error);
      throw error;
    }
  }

  async markReminderAsSent(reminderId: number): Promise<Reminder> {
    try {
      const reminder = await Reminder.findByPk(reminderId);
      if (!reminder) {
        throw new Error('Reminder not found');
      }

      await reminder.update({
        sent: true,
        sentAt: new Date(),
      });

      // If recurring, create next reminder
      if (reminder.recurring && reminder.recurringPattern) {
        await this.createRecurringReminder(reminder);
      }

      return reminder;
    } catch (error) {
      logger.error(`Error marking reminder ${reminderId} as sent:`, error);
      throw error;
    }
  }

  async createRecurringReminder(originalReminder: Reminder): Promise<Reminder> {
    try {
      // Calculate next scheduled time based on pattern
      // This is a simplified version - you can expand with cron parsing
      const nextTime = DateTime.fromJSDate(originalReminder.scheduledTime)
        .plus({ days: 1 })
        .toJSDate();

      return await Reminder.create({
        userId: originalReminder.userId,
        type: originalReminder.type,
        title: originalReminder.title,
        message: originalReminder.message,
        scheduledTime: nextTime,
        recurring: originalReminder.recurring,
        recurringPattern: originalReminder.recurringPattern,
        metadata: originalReminder.metadata,
      });
    } catch (error) {
      logger.error('Error creating recurring reminder:', error);
      throw error;
    }
  }

  async deleteReminder(reminderId: number): Promise<boolean> {
    try {
      const reminder = await Reminder.findByPk(reminderId);
      if (!reminder) {
        throw new Error('Reminder not found');
      }

      await reminder.destroy();
      logger.info(`Deleted reminder ${reminderId}`);
      return true;
    } catch (error) {
      logger.error(`Error deleting reminder ${reminderId}:`, error);
      throw error;
    }
  }

  async createDailyResetReminder(userId: string, server: keyof GenshinServersConfig): Promise<Reminder> {
    try {
      const { getServerResetTime } = await import('../utils/time.js');
      const resetTime = getServerResetTime(server);

      if (!resetTime) {
        throw new Error(`Invalid server: ${server}`);
      }

      return await this.createReminder(userId, {
        type: 'daily_reset',
        title: 'Daily Reset',
        message: 'Daily commissions and resin have reset!',
        scheduledTime: resetTime.toJSDate(),
        recurring: true,
        metadata: { server },
      });
    } catch (error) {
      logger.error(`Error creating daily reset reminder for user ${userId}:`, error);
      throw error;
    }
  }

  async createWeeklyResetReminder(userId: string, server: keyof GenshinServersConfig): Promise<Reminder> {
    try {
      const { getWeeklyResetTime } = await import('../utils/time.js');
      const resetTime = getWeeklyResetTime(server);

      if (!resetTime) {
        throw new Error(`Invalid server: ${server}`);
      }

      return await this.createReminder(userId, {
        type: 'weekly_reset',
        title: 'Weekly Reset',
        message: 'Weekly bosses and reputation have reset!',
        scheduledTime: resetTime.toJSDate(),
        recurring: true,
        metadata: { server },
      });
    } catch (error) {
      logger.error(`Error creating weekly reset reminder for user ${userId}:`, error);
      throw error;
    }
  }
}

export default new ReminderService();
