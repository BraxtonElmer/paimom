import { ModalSubmitInteraction } from 'discord.js';
import todoService from '../../services/todoService.js';
import { createSuccessEmbed } from '../../utils/embeds.js';
import type { TodoCategory } from '../../models/TodoItem.js';

export default {
  data: {
    customId: 'todo_add_modal',
  },

  async execute(interaction: ModalSubmitInteraction): Promise<void> {
    const title = interaction.fields.getTextInputValue('todo_title');
    const description = interaction.fields.getTextInputValue('todo_description') || null;
    const categoryRaw = interaction.fields.getTextInputValue('todo_category') || 'other';
    const resinRaw = interaction.fields.getTextInputValue('todo_resin') || '0';

    // Validate category
    const validCategories = ['domain', 'boss', 'farming', 'resin', 'daily', 'weekly', 'other'];
    const category = (validCategories.includes(categoryRaw.toLowerCase()) 
      ? categoryRaw.toLowerCase() 
      : 'other') as TodoCategory;

    // Parse resin cost
    const resinCost = parseInt(resinRaw) || 0;

    await todoService.createTodo(interaction.user.id, {
      title,
      description,
      category,
      resinCost,
    });

    const embed = createSuccessEmbed(
      'Task Added',
      `Added "${title}" to your to-do list!\n\n` +
      `**Category:** ${category}\n` +
      (resinCost > 0 ? `**Resin Cost:** ${resinCost}` : '')
    );

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
