import { ChatInputCommandInteraction, AutocompleteInteraction } from 'discord.js';
import { SlashCommandBuilder, AttachmentBuilder } from 'discord.js';
import { getCharacter, getAllCharacterNames } from '../data/characters.js';
import { createEmbed, getElementColor, getRarityEmoji } from '../utils/embeds.js';
import buildService from '../services/buildService.js';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
  data: new SlashCommandBuilder()
    .setName('character')
    .setDescription('View character information and builds')
    .addSubcommand(subcommand =>
      subcommand
        .setName('info')
        .setDescription('View detailed character information')
        .addStringOption(option =>
          option
            .setName('name')
            .setDescription('Character name')
            .setRequired(true)
            .setAutocomplete(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('build')
        .setDescription('View recommended character builds')
        .addStringOption(option =>
          option
            .setName('name')
            .setDescription('Character name')
            .setRequired(true)
            .setAutocomplete(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('track')
        .setDescription('Start tracking a character build')
        .addStringOption(option =>
          option
            .setName('name')
            .setDescription('Character name')
            .setRequired(true)
            .setAutocomplete(true)
        )
        .addIntegerOption(option =>
          option
            .setName('current_level')
            .setDescription('Current character level')
            .setMinValue(1)
            .setMaxValue(90)
        )
        .addIntegerOption(option =>
          option
            .setName('target_level')
            .setDescription('Target character level')
            .setMinValue(1)
            .setMaxValue(90)
        )
    ),

  async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
    const focusedValue = interaction.options.getFocused().toLowerCase();
    const characters = getAllCharacterNames();
    const filtered = characters.filter(name => 
      name.toLowerCase().includes(focusedValue)
    ).slice(0, 25);

    await interaction.respond(
      filtered.map(name => ({ name, value: name }))
    );
  },

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const subcommand = interaction.options.getSubcommand();
    const characterName = interaction.options.getString('name');
    const character = getCharacter(characterName);

    if (!character) {
      await interaction.reply({
        content: 'Character not found. Please use autocomplete to select a valid character.',
        ephemeral: true,
      });
      return;
    }

    if (subcommand === 'info') {
      // Prepare character image if it exists
      const imagePath = join(__dirname, '../../assets/characters', character.imageUrl.split('/').pop());
      const hasImage = existsSync(imagePath);
      
      const embed = createEmbed({
        title: `${character.name} ${getRarityEmoji(character.rarity)}`,
        description: `**Element:** ${character.element}\n**Weapon:** ${character.weapon}\n**Region:** ${character.region || 'Unknown'}`,
        color: getElementColor(character.element),
        fields: [
          {
            name: 'Ascension Materials',
            value: `• ${character.ascensionMaterial}\n` +
                   `• ${character.localSpecialty}\n` +
                   `• ${character.commonMaterial}\n` +
                   `• ${character.bossMaterial}`,
            inline: true,
          },
          {
            name: 'Talent Materials',
            value: `• ${character.talentBooks}\n` +
                   `• Available: ${character.talentDays.join(', ')}\n` +
                   `• ${character.weeklyBoss}`,
            inline: true,
          },
          {
            name: 'Recommended Weapons',
            value: character.recommendedWeapons.slice(0, 4).map(w => `• ${w}`).join('\n'),
            inline: false,
          },
        ],
      });

      // Add thumbnail if image exists
      if (hasImage) {
        embed.setThumbnail(`attachment://${character.imageUrl.split('/').pop()}`);
        const attachment = new AttachmentBuilder(imagePath);
        await interaction.reply({ embeds: [embed], files: [attachment] });
      } else {
        await interaction.reply({ embeds: [embed] });
      }
    } else if (subcommand === 'build') {
      const artifactInfo = character.recommendedArtifacts.map(set => {
        if (set.alternative) {
          return `• ${set.pieces}pc ${set.set} / ${set.altPieces}pc ${set.alternative}`;
        }
        return `• ${set.pieces}pc ${set.set}`;
      }).join('\n');

      const teamComps = character.teams.map((team, index) => 
        `**Team ${index + 1}:** ${team.join(' • ')}`
      ).join('\n');

      // Prepare character image if it exists
      const imagePath = join(__dirname, '../../assets/characters', character.imageUrl.split('/').pop());
      const hasImage = existsSync(imagePath);

      const embed = createEmbed({
        title: `${character.name} - Build Guide`,
        color: getElementColor(character.element),
        fields: [
          {
            name: '🎭 Artifacts',
            value: artifactInfo,
            inline: false,
          },
          {
            name: '📊 Main Stats',
            value: `• **Sands:** ${character.mainStats.sands}\n` +
                   `• **Goblet:** ${character.mainStats.goblet}\n` +
                   `• **Circlet:** ${character.mainStats.circlet}`,
            inline: true,
          },
          {
            name: '🎯 Substats',
            value: character.substats.map(s => `• ${s}`).join('\n'),
            inline: true,
          },
          {
            name: '👥 Team Compositions',
            value: teamComps,
            inline: false,
          },
        ],
      });

      // Add thumbnail if image exists
      if (hasImage) {
        embed.setThumbnail(`attachment://${character.imageUrl.split('/').pop()}`);
        const attachment = new AttachmentBuilder(imagePath);
        await interaction.reply({ embeds: [embed], files: [attachment] });
      } else {
        await interaction.reply({ embeds: [embed] });
      }
    } else if (subcommand === 'track') {
      const currentLevel = interaction.options.getInteger('current_level') || 1;
      const targetLevel = interaction.options.getInteger('target_level') || 90;

      if (currentLevel >= targetLevel) {
        await interaction.reply({
          content: 'Current level must be less than target level.',
          ephemeral: true,
        });
        return;
      }

      const build = await buildService.trackCharacter(interaction.user.id, character.name, {
        currentLevel,
        targetLevel,
      });

      const embed = createEmbed({
        title: 'Now Tracking',
        description: `Started tracking **${character.name}**!\n\n` +
                    `**Current Level:** ${currentLevel}\n` +
                    `**Target Level:** ${targetLevel}\n\n` +
                    `Use \`/builds list\` to view all your tracked characters.`,
        color: getElementColor(character.element),
      });

      await interaction.reply({ embeds: [embed] });
    }
  },
};
