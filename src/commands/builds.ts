import { ChatInputCommandInteraction, AutocompleteInteraction } from 'discord.js';
import { SlashCommandBuilder } from 'discord.js';
import buildService from '../services/buildService.js';
import { getCharacter } from '../data/characters.js';
import { createEmbed, getElementColor, createInfoEmbed } from '../utils/embeds.js';
import { createPaginationButtons, createActionButtons } from '../utils/components.js';
import { ButtonStyle } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('builds')
    .setDescription('Manage your tracked character builds')
    .addSubcommand(subcommand =>
      subcommand
        .setName('list')
        .setDescription('View all your tracked builds')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('details')
        .setDescription('View detailed build progress and materials')
        .addIntegerOption(option =>
          option
            .setName('build_id')
            .setDescription('Build ID from your builds list')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('update')
        .setDescription('Update your build progress')
        .addIntegerOption(option =>
          option
            .setName('build_id')
            .setDescription('Build ID to update')
            .setRequired(true)
        )
        .addIntegerOption(option =>
          option
            .setName('current_level')
            .setDescription('New current level')
            .setMinValue(1)
            .setMaxValue(90)
        )
        .addIntegerOption(option =>
          option
            .setName('normal_attack')
            .setDescription('Normal attack level')
            .setMinValue(1)
            .setMaxValue(10)
        )
        .addIntegerOption(option =>
          option
            .setName('skill')
            .setDescription('Elemental skill level')
            .setMinValue(1)
            .setMaxValue(10)
        )
        .addIntegerOption(option =>
          option
            .setName('burst')
            .setDescription('Elemental burst level')
            .setMinValue(1)
            .setMaxValue(10)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('delete')
        .setDescription('Stop tracking a character build')
        .addIntegerOption(option =>
          option
            .setName('build_id')
            .setDescription('Build ID to delete')
            .setRequired(true)
        )
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'list') {
      const builds = await buildService.getUserBuilds(interaction.user.id);

      if (builds.length === 0) {
        await interaction.reply({
          content: 'You don\'t have any tracked builds yet! Use `/character track` to start tracking a character.',
          ephemeral: true,
        });
        return;
      }

      const buildList = builds.map((build, index) => {
        const character = getCharacter(build.characterName);
        const progress = Math.round((build.currentLevel / build.targetLevel) * 100);
        
        return `**${index + 1}. ${build.characterName}** (ID: ${build.id})\n` +
               `Level: ${build.currentLevel}/${build.targetLevel} (${progress}%)\n` +
               `Talents: ${build.normalAttackLevel}/${build.elementalSkillLevel}/${build.elementalBurstLevel}\n` +
               `Priority: ${'⭐'.repeat(build.priority || 1)}`;
      }).join('\n\n');

      const embed = createInfoEmbed(
        'Your Tracked Builds',
        buildList + '\n\n*Use `/builds details <id>` to see material requirements*'
      );

      await interaction.reply({ embeds: [embed] });
    } else if (subcommand === 'details') {
      const buildId = interaction.options.getInteger('build_id');
      const build = await buildService.getBuild(buildId);

      if (!build || build.userId !== interaction.user.id) {
        await interaction.reply({
          content: 'Build not found or you don\'t have permission to view it.',
          ephemeral: true,
        });
        return;
      }

      const materials = await buildService.calculateRequiredMaterials(buildId);
      const character = materials.character;

      const ascensionInfo = `**Mora:** ${materials.ascension.mora.toLocaleString()}\n` +
        `**Gems:** ${materials.ascension.gems.sliver}/${materials.ascension.gems.fragment}/${materials.ascension.gems.chunk}/${materials.ascension.gems.gemstone}\n` +
        `**Boss Material:** ${materials.ascension.bossMaterial}x ${character.bossMaterial}\n` +
        `**Local Specialty:** ${materials.ascension.localSpecialty}x ${character.localSpecialty}`;

      const talentInfo = `**Mora:** ${materials.talents.mora.toLocaleString()}\n` +
        `**Books:** ${materials.talents.books.teaching}/${materials.talents.books.guide}/${materials.talents.books.philosophies}\n` +
        `**Weekly Boss:** ${materials.talents.weeklyBoss}x ${character.weeklyBoss}\n` +
        `**Crowns:** ${materials.talents.crown}`;

      const embed = createEmbed({
        title: `${character.name} - Build Details`,
        description: `**Current Level:** ${build.currentLevel} → **Target:** ${build.targetLevel}\n` +
                    `**Talents:** ${build.normalAttackLevel}/${build.elementalSkillLevel}/${build.elementalBurstLevel}`,
        color: getElementColor(character.element),
        fields: [
          {
            name: 'Ascension Materials Needed',
            value: ascensionInfo,
            inline: false,
          },
          {
            name: 'Talent Materials Needed',
            value: talentInfo,
            inline: false,
          },
          {
            name: 'Total Mora Required',
            value: materials.total.mora.toLocaleString(),
            inline: false,
          },
        ],
      });

      const buttons = createActionButtons([
        {
          customId: `build_update_${buildId}`,
          label: 'Update Progress',
          style: ButtonStyle.Primary,
        },
        {
          customId: `build_materials_${buildId}`,
          label: 'Domain Schedule',
          style: ButtonStyle.Secondary,
        },
      ]);

      await interaction.reply({ embeds: [embed], components: [buttons] });
    } else if (subcommand === 'update') {
      const buildId = interaction.options.getInteger('build_id');
      const build = await buildService.getBuild(buildId);

      if (!build || build.userId !== interaction.user.id) {
        await interaction.reply({
          content: 'Build not found or you don\'t have permission to update it.',
          ephemeral: true,
        });
        return;
      }

      const updates: any = {};
      const currentLevel = interaction.options.getInteger('current_level');
      const normalAttack = interaction.options.getInteger('normal_attack');
      const skill = interaction.options.getInteger('skill');
      const burst = interaction.options.getInteger('burst');

      if (currentLevel !== null) updates.currentLevel = currentLevel;
      if (normalAttack !== null) updates.normalAttackLevel = normalAttack;
      if (skill !== null) updates.elementalSkillLevel = skill;
      if (burst !== null) updates.elementalBurstLevel = burst;

      await buildService.updateBuild(buildId, updates);

      const embed = createEmbed({
        title: 'Build Updated',
        description: `Successfully updated your **${build.characterName}** build progress!`,
        color: 0x57F287,
      });

      await interaction.reply({ embeds: [embed], ephemeral: true });
    } else if (subcommand === 'delete') {
      const buildId = interaction.options.getInteger('build_id');
      const build = await buildService.getBuild(buildId);

      if (!build || build.userId !== interaction.user.id) {
        await interaction.reply({
          content: 'Build not found or you don\'t have permission to delete it.',
          ephemeral: true,
        });
        return;
      }

      await buildService.deleteBuild(buildId);

      const embed = createEmbed({
        title: 'Build Deleted',
        description: `Stopped tracking **${build.characterName}**.`,
        color: 0xED4245,
      });

      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};
