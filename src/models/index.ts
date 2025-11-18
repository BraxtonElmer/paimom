import User from './User.js';
import TrackedBuild from './TrackedBuild.js';
import TodoItem from './TodoItem.js';
import Reminder from './Reminder.js';

// Define associations
User.hasMany(TrackedBuild, { foreignKey: 'userId', as: 'trackedBuilds' });
TrackedBuild.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(TodoItem, { foreignKey: 'userId', as: 'todoItems' });
TodoItem.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Reminder, { foreignKey: 'userId', as: 'reminders' });
Reminder.belongsTo(User, { foreignKey: 'userId' });

export { User, TrackedBuild, TodoItem, Reminder };

export const syncDatabase = async (force = false): Promise<void> => {
  try {
    await User.sync({ force });
    await TrackedBuild.sync({ force });
    await TodoItem.sync({ force });
    await Reminder.sync({ force });
    console.log('Database models synchronized');
  } catch (error) {
    console.error('[ERROR] Error synchronizing database:', error);
    throw error;
  }
};
