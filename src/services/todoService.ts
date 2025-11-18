import { Op } from 'sequelize';
import { TodoItem } from '../models/index.js';
import { TodoCategory, TodoRecurring } from '../models/TodoItem.js';
import logger from '../utils/logger.js';

interface CreateTodoData {
  title: string;
  description?: string | null;
  category?: TodoCategory;
  priority?: number;
  recurring?: TodoRecurring;
  linkedCharacter?: string | null;
  resinCost?: number;
  dueDate?: Date | null;
}

interface TodoUpdates {
  title?: string;
  description?: string | null;
  category?: TodoCategory;
  priority?: number;
  recurring?: TodoRecurring;
  linkedCharacter?: string | null;
  resinCost?: number;
  dueDate?: Date | null;
  completed?: boolean;
  completedAt?: Date | null;
}

export class TodoService {
  async createTodo(userId: string, data: CreateTodoData): Promise<TodoItem> {
    try {
      const todo = await TodoItem.create({
        userId,
        title: data.title,
        description: data.description || null,
        category: data.category || 'other',
        priority: data.priority || 0,
        recurring: data.recurring || 'none',
        linkedCharacter: data.linkedCharacter || null,
        resinCost: data.resinCost || 0,
        dueDate: data.dueDate || null,
      });

      logger.info(`Created todo for user ${userId}: ${data.title}`);
      return todo;
    } catch (error) {
      logger.error(`Error creating todo for user ${userId}:`, error);
      throw error;
    }
  }

  async getUserTodos(userId: string, includeCompleted: boolean = false): Promise<TodoItem[]> {
    try {
      const where: any = { userId };
      
      if (!includeCompleted) {
        where.completed = false;
      }

      return await TodoItem.findAll({
        where,
        order: [
          ['completed', 'ASC'],
          ['priority', 'DESC'],
          ['dueDate', 'ASC'],
          ['createdAt', 'ASC'],
        ],
      });
    } catch (error) {
      logger.error(`Error getting todos for user ${userId}:`, error);
      throw error;
    }
  }

  async getTodosByCategory(userId: string, category: TodoCategory): Promise<TodoItem[]> {
    try {
      return await TodoItem.findAll({
        where: {
          userId,
          category,
          completed: false,
        },
        order: [['priority', 'DESC'], ['createdAt', 'ASC']],
      });
    } catch (error) {
      logger.error(`Error getting todos by category for user ${userId}:`, error);
      throw error;
    }
  }

  async completeTodo(todoId: number): Promise<TodoItem> {
    try {
      const todo = await TodoItem.findByPk(todoId);
      if (!todo) {
        throw new Error('Todo not found');
      }

      await todo.update({
        completed: true,
        completedAt: new Date(),
      });

      // Handle recurring todos
      if (todo.recurring !== 'none') {
        await this.createRecurringTodo(todo);
      }

      logger.info(`Completed todo ${todoId}`);
      return todo;
    } catch (error) {
      logger.error(`Error completing todo ${todoId}:`, error);
      throw error;
    }
  }

  async createRecurringTodo(originalTodo: TodoItem): Promise<TodoItem> {
    try {
      const newDueDate = new Date();
      
      if (originalTodo.recurring === 'daily') {
        newDueDate.setDate(newDueDate.getDate() + 1);
      } else if (originalTodo.recurring === 'weekly') {
        newDueDate.setDate(newDueDate.getDate() + 7);
      }

      return await TodoItem.create({
        userId: originalTodo.userId,
        title: originalTodo.title,
        description: originalTodo.description,
        category: originalTodo.category,
        priority: originalTodo.priority,
        recurring: originalTodo.recurring,
        linkedCharacter: originalTodo.linkedCharacter,
        resinCost: originalTodo.resinCost,
        dueDate: newDueDate,
      });
    } catch (error) {
      logger.error('Error creating recurring todo:', error);
      throw error;
    }
  }

  async updateTodo(todoId: number, updates: TodoUpdates): Promise<TodoItem> {
    try {
      const todo = await TodoItem.findByPk(todoId);
      if (!todo) {
        throw new Error('Todo not found');
      }

      await todo.update(updates);
      logger.info(`Updated todo ${todoId}`);
      return todo;
    } catch (error) {
      logger.error(`Error updating todo ${todoId}:`, error);
      throw error;
    }
  }

  async deleteTodo(todoId: number): Promise<boolean> {
    try {
      const todo = await TodoItem.findByPk(todoId);
      if (!todo) {
        throw new Error('Todo not found');
      }

      await todo.destroy();
      logger.info(`Deleted todo ${todoId}`);
      return true;
    } catch (error) {
      logger.error(`Error deleting todo ${todoId}:`, error);
      throw error;
    }
  }

  async getOverdueTodos(userId: string): Promise<TodoItem[]> {
    try {
      return await TodoItem.findAll({
        where: {
          userId,
          completed: false,
          dueDate: {
            [Op.lt]: new Date(),
          },
        },
        order: [['dueDate', 'ASC']],
      });
    } catch (error) {
      logger.error(`Error getting overdue todos for user ${userId}:`, error);
      throw error;
    }
  }
}

export default new TodoService();
