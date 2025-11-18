import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/connection.js';

// Type for todo category and recurring enums
export type TodoCategory = 'domain' | 'boss' | 'farming' | 'resin' | 'daily' | 'weekly' | 'other';
export type TodoRecurring = 'none' | 'daily' | 'weekly';

// TodoItem attributes interface
export interface TodoItemAttributes {
  id: number;
  userId: string;
  title: string;
  description: string | null;
  category: TodoCategory;
  completed: boolean;
  completedAt: Date | null;
  dueDate: Date | null;
  priority: number;
  recurring: TodoRecurring;
  linkedCharacter: string | null;
  resinCost: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Optional fields for creation
export interface TodoItemCreationAttributes extends Optional<TodoItemAttributes,
  'id' |
  'description' |
  'category' |
  'completed' |
  'completedAt' |
  'dueDate' |
  'priority' |
  'recurring' |
  'linkedCharacter' |
  'resinCost'
> {}

class TodoItem extends Model<TodoItemAttributes, TodoItemCreationAttributes> implements TodoItemAttributes {
  declare id: number;
  declare userId: string;
  declare title: string;
  declare description: string | null;
  declare category: TodoCategory;
  declare completed: boolean;
  declare completedAt: Date | null;
  declare dueDate: Date | null;
  declare priority: number;
  declare recurring: TodoRecurring;
  declare linkedCharacter: string | null;
  declare resinCost: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

TodoItem.init({
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
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  category: {
    type: DataTypes.ENUM('domain', 'boss', 'farming', 'resin', 'daily', 'weekly', 'other'),
    defaultValue: 'other',
  },
  completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  priority: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  recurring: {
    type: DataTypes.ENUM('none', 'daily', 'weekly'),
    defaultValue: 'none',
  },
  linkedCharacter: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Character name if related to a build',
  },
  resinCost: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  sequelize,
  tableName: 'todo_items',
  timestamps: true,
  indexes: [
    {
      fields: ['userId'],
    },
    {
      fields: ['completed'],
    },
    {
      fields: ['dueDate'],
    },
    {
      fields: ['category'],
    },
  ],
});

export default TodoItem;
