import { ModalSubmitInteraction } from 'discord.js';
import buildService from '../../services/buildService.js';
import { createSuccessEmbed } from '../../utils/embeds.js';

export default {
  data: {
    customId: 'build_update_modal',
  },

  async execute(interaction: ModalSubmitInteraction): Promise<void> {
    // Extract build ID from custom ID (format: build_update_modal_123)
    const buildId = parseInt(interaction.customId.split('_')[3]);
    
    const build = await buildService.getBuild(buildId);
    if (!build || build.userId !== interaction.user.id) {
      await interaction.reply({
        content: 'Build not found or you don\'t have permission to update it.',
        ephemeral: true,
      });
      return;
    }

    const updates: any = {};
    
    const levelRaw = interaction.fields.getTextInputValue('current_level');
    const normalRaw = interaction.fields.getTextInputValue('normal_attack');
    const skillRaw = interaction.fields.getTextInputValue('skill_level');
    const burstRaw = interaction.fields.getTextInputValue('burst_level');

    const level = parseInt(levelRaw);
    const normal = parseInt(normalRaw);
    const skill = parseInt(skillRaw);
    const burst = parseInt(burstRaw);

    if (!isNaN(level) && level >= 1 && level <= 90) {
      updates.currentLevel = level;
    }
    if (!isNaN(normal) && normal >= 1 && normal <= 10) {
      updates.normalAttackLevel = normal;
    }
    if (!isNaN(skill) && skill >= 1 && skill <= 10) {
      updates.elementalSkillLevel = skill;
    }
    if (!isNaN(burst) && burst >= 1 && burst <= 10) {
      updates.elementalBurstLevel = burst;
    }

    await buildService.updateBuild(buildId, updates);

    const embed = createSuccessEmbed(
      'Build Updated',
      `Successfully updated **${build.characterName}**!\n\n` +
      `**Level:** ${updates.currentLevel || build.currentLevel}\n` +
      `**Talents:** ${updates.normalAttackLevel || build.normalAttackLevel}/` +
      `${updates.elementalSkillLevel || build.elementalSkillLevel}/` +
      `${updates.elementalBurstLevel || build.elementalBurstLevel}`
    );

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
