import { User } from '../models/index.js';
import { GenshinServer } from '../models/User.js';
import logger from '../utils/logger.js';

interface NotificationSettings {
  notificationsEnabled?: boolean;
  dailyResetNotifications?: boolean;
  weeklyResetNotifications?: boolean;
  notificationChannel?: string | null;
}

export class UserService {
  async getOrCreateUser(userId: string): Promise<User> {
    try {
      const [user, created] = await User.findOrCreate({
        where: { id: userId },
        defaults: {
          id: userId,
          genshinServer: 'na',
          notificationsEnabled: true,
          dailyResetNotifications: true,
          weeklyResetNotifications: true,
        },
      });
      
      if (created) {
        logger.info(`Created new user: ${userId}`);
      }
      
      return user;
    } catch (error) {
      logger.error(`Error getting/creating user ${userId}:`, error);
      throw error;
    }
  }

  async updateServer(userId: string, server: GenshinServer): Promise<User> {
    try {
      const user = await this.getOrCreateUser(userId);
      await user.update({ genshinServer: server });
      logger.info(`Updated server for user ${userId} to ${server}`);
      return user;
    } catch (error) {
      logger.error(`Error updating server for user ${userId}:`, error);
      throw error;
    }
  }

  async updateNotificationSettings(userId: string, settings: NotificationSettings): Promise<User> {
    try {
      const user = await this.getOrCreateUser(userId);
      await user.update(settings);
      logger.info(`Updated notification settings for user ${userId}`);
      return user;
    } catch (error) {
      logger.error(`Error updating notification settings for user ${userId}:`, error);
      throw error;
    }
  }

  async updateResin(userId: string, amount: number): Promise<User> {
    try {
      const user = await this.getOrCreateUser(userId);
      await user.update({
        resinAmount: amount,
        resinLastUpdated: new Date(),
      });
      return user;
    } catch (error) {
      logger.error(`Error updating resin for user ${userId}:`, error);
      throw error;
    }
  }

  async getUsersByServer(server: GenshinServer): Promise<User[]> {
    try {
      return await User.findAll({
        where: {
          genshinServer: server,
          notificationsEnabled: true,
        },
      });
    } catch (error) {
      logger.error(`Error getting users by server ${server}:`, error);
      throw error;
    }
  }

  async getAllUsersWithNotifications(): Promise<User[]> {
    try {
      return await User.findAll({
        where: {
          notificationsEnabled: true,
        },
      });
    } catch (error) {
      logger.error('Error getting all users with notifications:', error);
      throw error;
    }
  }
}

export default new UserService();
