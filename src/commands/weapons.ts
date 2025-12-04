import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js';
import { Command } from '../index.js';
import { getAllWeapons, getWeaponByName } from '../services/enkaService.js';
import logger from '../utils/logger.js';
import { WeaponData } from 'enka-network-api';

// Weapon type display names and colors
const weaponTypes: Record<string, { name: string; color: number }> = {
  'WEAPON_SWORD_ONE_HAND': { name: 'Sword', color: 0x4A90D9 },
  'WEAPON_CLAYMORE': { name: 'Claymore', color: 0xD94A4A },
  'WEAPON_POLE': { name: 'Polearm', color: 0x4AD9A3 },
  'WEAPON_BOW': { name: 'Bow', color: 0x9B59B6 },
  'WEAPON_CATALYST': { name: 'Catalyst', color: 0xF39C12 },
};

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('weapons')
    .setDescription('Browse and search weapon information')
    .addSubcommand(subcommand =>
      subcommand
        .setName('search')
        .setDescription('Search for a weapon by name')
        .addStringOption(option =>
          option
            .setName('name')
            .setDescription('Name of the weapon')
            .setRequired(true)
            .setAutocomplete(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('list')
        .setDescription('List weapons by type and rarity')
        .addStringOption(option =>
          option
            .setName('type')
            .setDescription('Weapon type')
            .setRequired(false)
            .addChoices(
              { name: 'Sword', value: 'WEAPON_SWORD_ONE_HAND' },
              { name: 'Claymore', value: 'WEAPON_CLAYMORE' },
              { name: 'Polearm', value: 'WEAPON_POLE' },
              { name: 'Bow', value: 'WEAPON_BOW' },
              { name: 'Catalyst', value: 'WEAPON_CATALYST' },
            )
        )
        .addIntegerOption(option =>
          option
            .setName('rarity')
            .setDescription('Weapon rarity (stars)')
            .setRequired(false)
            .addChoices(
              { name: '5 Star', value: 5 },
              { name: '4 Star', value: 4 },
              { name: '3 Star', value: 3 },
            )
        )
    ) as SlashCommandBuilder,

  async autocomplete(interaction) {
    const focusedValue = interaction.options.getFocused().toLowerCase();
    
    try {
      const allWeapons = getAllWeapons();
      const filtered = allWeapons
        .map(w => w.name.get('en') || '')
        .filter(name => name && name.toLowerCase().includes(focusedValue))
        .slice(0, 25);
      
      await interaction.respond(
        filtered.map(name => ({ name, value: name }))
      );
    } catch (error) {
      await interaction.respond([]);
    }
  },

  async execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case 'search':
        await handleSearch(interaction);
        break;
      case 'list':
        await handleList(interaction);
        break;
    }
  },
};

async function handleSearch(interaction: ChatInputCommandInteraction) {
  const name = interaction.options.getString('name', true);
  
  await interaction.deferReply();

  try {
    const weapon = getWeaponByName(name);

    if (!weapon) {
      await interaction.editReply({
        content: `Could not find a weapon named "${name}".`,
      });
      return;
    }

    const embed = createWeaponEmbed(weapon);
    await interaction.editReply({ embeds: [embed] });

  } catch (error: any) {
    logger.error('[Weapons] Error searching weapon:', error);
    await interaction.editReply({
      content: 'An error occurred while searching for the weapon.',
    });
  }
}

async function handleList(interaction: ChatInputCommandInteraction) {
  const weaponType = interaction.options.getString('type');
  const rarity = interaction.options.getInteger('rarity');
  
  await interaction.deferReply();

  try {
    let weapons = getAllWeapons();
    
    // Filter by type if specified
    if (weaponType) {
      weapons = weapons.filter(w => w.weaponType === weaponType);
    }
    
    // Filter by rarity if specified
    if (rarity) {
      weapons = weapons.filter(w => w.stars === rarity);
    }
    
    // Sort by rarity (descending) then name
    weapons.sort((a, b) => {
      if (a.stars !== b.stars) return b.stars - a.stars;
      const nameA = a.name.get('en') || '';
      const nameB = b.name.get('en') || '';
      return nameA.localeCompare(nameB);
    });

    // Build title
    let title = 'Weapons';
    const filters: string[] = [];
    if (weaponType) {
      filters.push(weaponTypes[weaponType]?.name || weaponType);
    }
    if (rarity) {
      filters.push(`${rarity}-Star`);
    }
    if (filters.length > 0) {
      title += ` (${filters.join(', ')})`;
    }

    const embed = new EmbedBuilder()
      .setColor(0xFFD700)
      .setTitle(title)
      .setDescription(`Found ${weapons.length} weapons`);

    // Group weapons by type for display
    if (!weaponType) {
      // Show grouped by type
      for (const [type, typeInfo] of Object.entries(weaponTypes)) {
        const typeWeapons = weapons.filter(w => w.weaponType === type);
        if (typeWeapons.length > 0) {
          const weaponList = typeWeapons
            .slice(0, 15)
            .map(w => {
              const name = w.name.get('en') || 'Unknown';
              return `${'★'.repeat(w.stars)} ${name}`;
            })
            .join('\n');
          
          embed.addFields({
            name: `${typeInfo.name} (${typeWeapons.length})`,
            value: weaponList + (typeWeapons.length > 15 ? `\n...and ${typeWeapons.length - 15} more` : ''),
            inline: true,
          });
        }
      }
    } else {
      // Show single type list
      const weaponList = weapons
        .slice(0, 25)
        .map(w => {
          const name = w.name.get('en') || 'Unknown';
          return `${'★'.repeat(w.stars)} ${name}`;
        })
        .join('\n');
      
      embed.addFields({
        name: 'Weapons',
        value: weaponList || 'No weapons found',
        inline: false,
      });
      
      if (weapons.length > 25) {
        embed.setFooter({ text: `Showing 25 of ${weapons.length} weapons` });
      }
    }

    embed.setTimestamp();

    await interaction.editReply({ embeds: [embed] });

  } catch (error: any) {
    logger.error('[Weapons] Error listing weapons:', error);
    await interaction.editReply({
      content: 'An error occurred while listing weapons.',
    });
  }
}

function createWeaponEmbed(weapon: WeaponData): EmbedBuilder {
  const name = weapon.name.get('en') || 'Unknown';
  const description = weapon.description.get('en') || 'No description';
  const weaponType = weaponTypes[weapon.weaponType] || { name: weapon.weaponType, color: 0x5865F2 };
  
  const embed = new EmbedBuilder()
    .setColor(weaponType.color)
    .setTitle(name)
    .setDescription(`${'★'.repeat(weapon.stars)} | ${weaponType.name}`);

  // Add weapon icon
  try {
    const iconUrl = weapon.icon.url;
    if (iconUrl) {
      embed.setThumbnail(iconUrl);
    }
  } catch (e) {
    // Ignore
  }

  // Base stats at level 90
  try {
    const maxStats = weapon.getStats(6, 90); // Max ascension, level 90
    if (maxStats && maxStats.length > 0) {
      const statLines = maxStats.map(stat => {
        const statName = stat.fightPropName.get('en') || 'Unknown';
        return `${statName}: ${stat.valueText}`;
      });
      
      embed.addFields({
        name: 'Base Stats (Lv.90)',
        value: statLines.join('\n'),
        inline: true,
      });
    }
  } catch (e) {
    // Stats might not be available
  }

  // Refinement effect
  try {
    const refinements = weapon.refinements;
    if (refinements && refinements.length > 0) {
      const r1 = refinements[0];
      const effectName = r1.name.get('en') || 'Passive';
      const effectDesc = r1.description.get('en') || 'No description';
      
      embed.addFields({
        name: effectName,
        value: effectDesc.length > 1024 ? effectDesc.slice(0, 1021) + '...' : effectDesc,
        inline: false,
      });
      
      // Show R5 if available and different
      if (refinements.length >= 5) {
        const r5 = refinements[4];
        const r5Desc = r5.description.get('en') || '';
        if (r5Desc && r5Desc !== effectDesc) {
          embed.addFields({
            name: 'R5 Effect',
            value: r5Desc.length > 1024 ? r5Desc.slice(0, 1021) + '...' : r5Desc,
            inline: false,
          });
        }
      }
    }
  } catch (e) {
    // Refinements might not be available
  }

  // Lore/Description
  if (description && description.length < 1024) {
    embed.addFields({
      name: 'Description',
      value: description,
      inline: false,
    });
  }

  embed.setFooter({ text: 'Data from Enka.Network' })
    .setTimestamp();

  return embed;
}

export default command;
