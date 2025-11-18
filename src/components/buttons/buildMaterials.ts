import { ButtonInteraction, ModalSubmitInteraction } from 'discord.js';
import buildService from '../../services/buildService.js';
import { createInfoEmbed } from '../../utils/embeds.js';
import { getCharacter } from '../../data/characters.js';
import { getDomainsByDay, Domain } from '../../data/domains.js';

export default {
  data: {
    customId: 'build_materials',
  },

  async execute(interaction: ButtonInteraction | ModalSubmitInteraction): Promise<void> {
    // Extract build ID from custom ID (format: build_materials_123)
    const buildId = parseInt(interaction.customId.split('_')[2]);
    
    const build = await buildService.getBuild(buildId);
    if (!build || build.userId !== interaction.user.id) {
      await interaction.reply({
        content: 'Build not found or you don\'t have permission to view it.',
        ephemeral: true,
      });
      return;
    }

    const character = getCharacter(build.characterName);
    if (!character) {
      await interaction.reply({
        content: 'Character data not found.',
        ephemeral: true,
      });
      return;
    }

    const talentDomain = (getDomainsByDay as any)(character.talentBooks);
    
    const domainInfo = talentDomain 
      ? `**Talent Domain:** ${talentDomain.name}\n` +
        `**Available:** ${character.talentDays.join(', ')}\n` +
        `**Location:** ${talentDomain.location}\n\n`
      : '';

    const embed = createInfoEmbed(
      `${character.name} - Domain Schedule`,
      domainInfo +
      `**Talent Materials:** ${character.talentBooks}\n` +
      `**Weekly Boss:** ${character.weeklyBoss}\n` +
      `**Boss Material:** ${character.bossMaterial}\n` +
      `**Local Specialty:** ${character.localSpecialty}\n\n` +
      `Use \`/domain schedule\` to see all available domains today!`
    );

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
