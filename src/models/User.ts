import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/connection.js';

// Type for Genshin server enum
export type GenshinServer = 'asia' | 'na' | 'eu' | 'tw';

// User attributes interface
export interface UserAttributes {
  id: string; // Discord user ID
  genshinUid: string | null; // Genshin Impact UID for Enka lookups
  genshinServer: GenshinServer;
  notificationsEnabled: boolean;
  dailyResetNotifications: boolean;
  weeklyResetNotifications: boolean;
  notificationChannel: string | null;
  resinLastUpdated: Date | null;
  resinAmount: number;
  timezone: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Optional fields for creation (fields with defaults or auto-generated)
export interface UserCreationAttributes extends Optional<UserAttributes, 
  'genshinUid' |
  'genshinServer' | 
  'notificationsEnabled' | 
  'dailyResetNotifications' | 
  'weeklyResetNotifications' | 
  'notificationChannel' | 
  'resinLastUpdated' | 
  'resinAmount' | 
  'timezone'
> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  declare id: string;
  declare genshinUid: string | null;
  declare genshinServer: GenshinServer;
  declare notificationsEnabled: boolean;
  declare dailyResetNotifications: boolean;
  declare weeklyResetNotifications: boolean;
  declare notificationChannel: string | null;
  declare resinLastUpdated: Date | null;
  declare resinAmount: number;
  declare timezone: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

User.init({
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    comment: 'Discord user ID',
  },
  genshinUid: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Genshin Impact UID for Enka.Network lookups',
  },
  genshinServer: {
    type: DataTypes.ENUM('asia', 'na', 'eu', 'tw'),
    allowNull: false,
    defaultValue: 'na',
  },
  notificationsEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  dailyResetNotifications: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  weeklyResetNotifications: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  notificationChannel: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Channel ID for notifications, null for DM',
  },
  resinLastUpdated: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  resinAmount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 160,
    },
  },
  timezone: {
    type: DataTypes.STRING,
    defaultValue: 'UTC',
  },
}, {
  sequelize,
  tableName: 'users',
  timestamps: true,
  indexes: [
    {
      fields: ['genshinServer'],
    },
  ],
});

export default User;
