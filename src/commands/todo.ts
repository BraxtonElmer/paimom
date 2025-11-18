import { ChatInputCommandInteraction, AutocompleteInteraction } from 'discord.js';
import { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';
import todoService from '../services/todoService.js';
import { createInfoEmbed, createSuccessEmbed } from '../utils/embeds.js';
import { createActionButtons } from '../utils/components.js';
import { ButtonStyle } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('todo')
    .setDescription('Manage your farming to-do list')
    .addSubcommand(subcommand =>
      subcommand
        .setName('add')
        .setDescription('Add a new task to your to-do list')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('list')
        .setDescription('View your to-do list')
        .addStringOption(option =>
          option
            .setName('category')
            .setDescription('Filter by category')
            .addChoices(
              { name: 'All', value: 'all' },
              { name: 'Domain', value: 'domain' },
              { name: 'Boss', value: 'boss' },
              { name: 'Farming', value: 'farming' },
              { name: 'Resin', value: 'resin' },
              { name: 'Daily', value: 'daily' },
              { name: 'Weekly', value: 'weekly' }
            )
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('complete')
        .setDescription('Mark a task as complete')
        .addIntegerOption(option =>
          option
            .setName('task_id')
            .setDescription('Task ID from your todo list')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('delete')
        .setDescription('Delete a task')
        .addIntegerOption(option =>
          option
            .setName('task_id')
            .setDescription('Task ID to delete')
            .setRequired(true)
        )
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'add') {
      // Show modal for adding a todo
      const modal = new ModalBuilder()
        .setCustomId('todo_add_modal')
        .setTitle('Add New Task');

      const titleInput = new TextInputBuilder()
        .setCustomId('todo_title')
        .setLabel('Task Title')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Farm Crimson Witch artifacts')
        .setRequired(true)
        .setMaxLength(100);

      const descriptionInput = new TextInputBuilder()
        .setCustomId('todo_description')
        .setLabel('Description (Optional)')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('Need pyro goblet and crit circlet')
        .setRequired(false)
        .setMaxLength(500);

      const categoryInput = new TextInputBuilder()
        .setCustomId('todo_category')
        .setLabel('Category')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('domain/boss/farming/resin/daily/weekly/other')
        .setRequired(false)
        .setValue('farming');

      const resinInput = new TextInputBuilder()
        .setCustomId('todo_resin')
        .setLabel('Resin Cost (Optional)')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('20')
        .setRequired(false);

      const row1 = new ActionRowBuilder<TextInputBuilder>().addComponents(titleInput);
      const row2 = new ActionRowBuilder<TextInputBuilder>().addComponents(descriptionInput);
      const row3 = new ActionRowBuilder<TextInputBuilder>().addComponents(categoryInput);
      const row4 = new ActionRowBuilder<TextInputBuilder>().addComponents(resinInput);

      modal.addComponents(row1, row2, row3, row4);

      await interaction.showModal(modal);
    } else if (subcommand === 'list') {
      const category = interaction.options.getString('category') as any || 'all';
      
      let todos;
      if (category === 'all') {
        todos = await todoService.getUserTodos(interaction.user.id);
      } else {
        todos = await todoService.getTodosByCategory(interaction.user.id, category);
      }

      if (todos.length === 0) {
        await interaction.reply({
          content: 'Your to-do list is empty! Use `/todo add` to create a task.',
          ephemeral: true,
        });
        return;
      }

      const categoryEmojis = {
        domain: '[Domain]',
        boss: '[Boss]',
        farming: '[Farm]',
        resin: '[Resin]',
        daily: '[Daily]',
        weekly: '[Weekly]',
        other: '[Other]',
      };

      const todoList = todos.map(todo => {
        const emoji = categoryEmojis[todo.category] || '[Other]';
        const status = todo.completed ? '[X]' : '[ ]';
        const resinInfo = todo.resinCost > 0 ? ` (${todo.resinCost} resin)` : '';
        
        return `${status} **${todo.id}.** ${emoji} ${todo.title}${resinInfo}\n` +
               (todo.description ? `   *${todo.description}*\n` : '');
      }).join('\n');

      const embed = createInfoEmbed(
        `To-Do List ${category !== 'all' ? `(${category})` : ''}`,
        todoList + '\n\n*Use `/todo complete <id>` to mark tasks as done*'
      );

      await interaction.reply({ embeds: [embed] });
    } else if (subcommand === 'complete') {
      const taskId = interaction.options.getInteger('task_id');
      
      try {
        const todo = await todoService.completeTodo(taskId);
        
        if (todo.userId !== interaction.user.id) {
          await interaction.reply({
            content: 'You can only complete your own tasks!',
            ephemeral: true,
          });
          return;
        }

        const embed = createSuccessEmbed(
          'Task Completed',
          `Marked "${todo.title}" as complete!` +
          (todo.recurring !== 'none' ? `\n\nA new ${todo.recurring} task has been created.` : '')
        );

        await interaction.reply({ embeds: [embed], ephemeral: true });
      } catch (error) {
        await interaction.reply({
          content: 'Task not found or already completed.',
          ephemeral: true,
        });
      }
    } else if (subcommand === 'delete') {
      const taskId = interaction.options.getInteger('task_id');
      
      try {
        await todoService.deleteTodo(taskId);

        const embed = createSuccessEmbed(
          'Task Deleted',
          `Task deleted successfully.`
        );

        await interaction.reply({ embeds: [embed], ephemeral: true });
      } catch (error) {
        await interaction.reply({
          content: 'Task not found or you don\'t have permission to delete it.',
          ephemeral: true,
        });
      }
    }
  },
};
