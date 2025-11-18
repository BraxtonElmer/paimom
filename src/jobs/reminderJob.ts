import cron, { ScheduledTask } from 'node-cron';
import { Op } from 'sequelize';
import { Client, User as DiscordUser } from 'discord.js';
import { Reminder } from '../models/index.js';
import reminderService from '../services/reminderService.js';
import logger from '../utils/logger.js';

export default class ReminderJob {
  private client: Client;
  private job: ScheduledTask | null;

  constructor(client: Client) {
    this.client = client;
    this.job = null;
  }

  start(): void {
    // Check for pending reminders every minute
    this.job = cron.schedule('* * * * *', async () => {
      try {
        await this.processReminders();
      } catch (error) {
        logger.error('Error processing reminders:', error);
      }
    });

    logger.info('Reminder job started');
  }

  async processReminders(): Promise<void> {
    const now = new Date();
    
    const pendingReminders = await Reminder.findAll({
      where: {
        sent: false,
        scheduledTime: {
          [Op.lte]: now,
        },
      },
    });

    for (const reminder of pendingReminders) {
      try {
        await this.sendReminder(reminder);
        await reminderService.markReminderAsSent(reminder.id);
      } catch (error) {
        logger.error(`Error sending reminder ${reminder.id}:`, error);
      }
    }
  }

  async sendReminder(reminder: Reminder): Promise<void> {
    try {
      const user: DiscordUser = await this.client.users.fetch(reminder.userId);
      
      let message = `**Reminder: ${reminder.title}**\n\n`;
      
      if (reminder.message) {
        message += `${reminder.message}\n\n`;
      }

      if (reminder.type === 'daily_reset') {
        message += 'Daily commissions, resin, and domains have reset!\n';
        message += 'Don\'t forget to:\n';
        message += '• Complete daily commissions\n';
        message += '• Use your resin\n';
        message += '• Check expedition rewards\n';
        message += '• Complete battle pass tasks';
      } else if (reminder.type === 'weekly_reset') {
        message += 'Weekly bosses and activities have reset!\n';
        message += 'Don\'t forget to:\n';
        message += '• Fight weekly bosses (30 resin)\n';
        message += '• Collect reputation rewards\n';
        message += '• Complete weekly battle pass tasks\n';
        message += '• Buy from the teapot traveling salesman';
      } else if (reminder.type === 'domain') {
        const domainName = reminder.metadata?.domain || 'Unknown';
        message += `The domain **${domainName}** is now available!`;
      } else if (reminder.type === 'resin') {
        message += 'Your resin should be full or nearly full!';
      }

      await user.send(message);
      logger.info(`Sent reminder to user ${reminder.userId}: ${reminder.title}`);
    } catch (error) {
      logger.error(`Failed to send reminder to user ${reminder.userId}:`, error);
      // User might have DMs disabled or blocked the bot
    }
  }

  stop(): void {
    if (this.job) {
      this.job.stop();
      logger.info('Reminder job stopped');
    }
  }
}
