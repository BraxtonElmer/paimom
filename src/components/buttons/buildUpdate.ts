import { ButtonInteraction } from 'discord.js';
import {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} from 'discord.js';
import buildService from '../../services/buildService.js';

export default {
  data: {
    customId: 'build_update',
  },

  async execute(interaction: ButtonInteraction): Promise<void> {
    // Extract build ID from custom ID (format: build_update_123)
    const buildId = parseInt(interaction.customId.split('_')[2]);
    
    const build = await buildService.getBuild(buildId);
    if (!build || build.userId !== interaction.user.id) {
      await interaction.reply({
        content: 'Build not found or you don\'t have permission to update it.',
        ephemeral: true,
      });
      return;
    }

    // Create modal for updating build
    const modal = new ModalBuilder()
      .setCustomId(`build_update_modal_${buildId}`)
      .setTitle(`Update ${build.characterName} Build`);

    const levelInput = new TextInputBuilder()
      .setCustomId('current_level')
      .setLabel('Current Level')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder(`Current: ${build.currentLevel}`)
      .setRequired(false)
      .setValue(build.currentLevel.toString());

    const normalAttackInput = new TextInputBuilder()
      .setCustomId('normal_attack')
      .setLabel('Normal Attack Level')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder(`Current: ${build.normalAttackLevel}`)
      .setRequired(false)
      .setValue(build.normalAttackLevel.toString());

    const skillInput = new TextInputBuilder()
      .setCustomId('skill_level')
      .setLabel('Elemental Skill Level')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder(`Current: ${build.elementalSkillLevel}`)
      .setRequired(false)
      .setValue(build.elementalSkillLevel.toString());

    const burstInput = new TextInputBuilder()
      .setCustomId('burst_level')
      .setLabel('Elemental Burst Level')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder(`Current: ${build.elementalBurstLevel}`)
      .setRequired(false)
      .setValue(build.elementalBurstLevel.toString());

    const row1 = new ActionRowBuilder<TextInputBuilder>().addComponents(levelInput);
    const row2 = new ActionRowBuilder<TextInputBuilder>().addComponents(normalAttackInput);
    const row3 = new ActionRowBuilder<TextInputBuilder>().addComponents(skillInput);
    const row4 = new ActionRowBuilder<TextInputBuilder>().addComponents(burstInput);

    modal.addComponents(row1, row2, row3, row4);

    await interaction.showModal(modal);
  },
};
