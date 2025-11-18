import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/connection.js';

// Type for reminder enum
export type ReminderType = 'daily_reset' | 'weekly_reset' | 'domain' | 'resin' | 'custom';

// Reminder attributes interface
export interface ReminderAttributes {
  id: number;
  userId: string;
  type: ReminderType;
  title: string;
  message: string | null;
  scheduledTime: Date;
  sent: boolean;
  sentAt: Date | null;
  recurring: boolean;
  recurringPattern: string | null;
  metadata: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

// Optional fields for creation
export interface ReminderCreationAttributes extends Optional<ReminderAttributes,
  'id' |
  'message' |
  'sent' |
  'sentAt' |
  'recurring' |
  'recurringPattern' |
  'metadata'
> {}

class Reminder extends Model<ReminderAttributes, ReminderCreationAttributes> implements ReminderAttributes {
  declare id: number;
  declare userId: string;
  declare type: ReminderType;
  declare title: string;
  declare message: string | null;
  declare scheduledTime: Date;
  declare sent: boolean;
  declare sentAt: Date | null;
  declare recurring: boolean;
  declare recurringPattern: string | null;
  declare metadata: Record<string, any>;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Reminder.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  type: {
    type: DataTypes.ENUM('daily_reset', 'weekly_reset', 'domain', 'resin', 'custom'),
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  scheduledTime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  sent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  sentAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  recurring: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  recurringPattern: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Cron pattern for recurring reminders',
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Additional data like domain name, character, etc.',
  },
}, {
  sequelize,
  tableName: 'reminders',
  timestamps: true,
  indexes: [
    {
      fields: ['userId'],
    },
    {
      fields: ['scheduledTime'],
    },
    {
      fields: ['sent'],
    },
    {
      fields: ['type'],
    },
  ],
});

export default Reminder;
