import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js';
import { Command } from '../index.js';
import { fetchUserProfile, getArtifactSetByName, getAllArtifactSets, calculateCritValue } from '../services/enkaService.js';
import { User } from '../models/index.js';
import logger from '../utils/logger.js';
import { Character, Artifact } from 'enka-network-api';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('artifacts')
    .setDescription('View and analyze artifact builds')
    .addSubcommand(subcommand =>
      subcommand
        .setName('view')
        .setDescription('View artifacts of a character from your profile')
        .addStringOption(option =>
          option
            .setName('uid')
            .setDescription('Genshin Impact UID (or leave empty to use linked UID)')
            .setRequired(false)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('set')
        .setDescription('Get info about an artifact set')
        .addStringOption(option =>
          option
            .setName('name')
            .setDescription('Name of the artifact set')
            .setRequired(true)
            .setAutocomplete(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('list')
        .setDescription('List all artifact sets')
    ) as SlashCommandBuilder,

  async autocomplete(interaction) {
    const focusedValue = interaction.options.getFocused().toLowerCase();
    
    try {
      const allSets = getAllArtifactSets();
      const filtered = allSets
        .map(s => s.name.get('en') || '')
        .filter(name => name.toLowerCase().includes(focusedValue))
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
      case 'view':
        await handleView(interaction);
        break;
      case 'set':
        await handleSet(interaction);
        break;
      case 'list':
        await handleList(interaction);
        break;
    }
  },
};

async function handleView(interaction: ChatInputCommandInteraction) {
  let uid = interaction.options.getString('uid');

  // If no UID provided, try to get linked UID
  if (!uid) {
    const user = await User.findByPk(interaction.user.id);
    if (!user?.genshinUid) {
      await interaction.reply({
        content: 'No UID provided and you have not linked a Genshin UID. Use `/profile link` to link your UID or provide one directly.',
        ephemeral: true,
      });
      return;
    }
    uid = user.genshinUid;
  }

  // Validate UID format
  if (!/^\d{9,10}$/.test(uid)) {
    await interaction.reply({
      content: 'Invalid UID format. Please provide a valid 9-10 digit Genshin Impact UID.',
      ephemeral: true,
    });
    return;
  }

  await interaction.deferReply();

  try {
    const profile = await fetchUserProfile(uid);

    if (!profile) {
      await interaction.editReply({
        content: `Could not find a profile for UID **${uid}**. Make sure the UID is correct and the profile is public.`,
      });
      return;
    }

    if (!profile.showCharacterDetails || !profile.characters || profile.characters.length === 0) {
      await interaction.editReply({
        content: `Profile **${profile.nickname}** (UID: ${uid}) does not have any detailed character builds on display.`,
      });
      return;
    }

    // Build character selection menu
    const selectOptions = profile.characters.map((char, index) => {
      const name = char.characterData.name.get('en') || 'Unknown';
      const element = char.characterData.element?.name.get('en') || '?';
      const cv = calculateCritValue(char);
      
      return new StringSelectMenuOptionBuilder()
        .setLabel(`${name}`)
        .setDescription(`${element} | CV: ${(cv * 100).toFixed(1)}`)
        .setValue(index.toString());
    });

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId(`artifacts_select_${uid}`)
      .setPlaceholder('Select a character to view artifacts')
      .addOptions(selectOptions);

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

    // Show first character's artifacts by default
    const embed = createArtifactEmbed(profile.characters[0], profile.nickname, uid);

    await interaction.editReply({
      embeds: [embed],
      components: [row],
    });

  } catch (error: any) {
    logger.error('[Artifacts] Error fetching artifacts:', error);
    await interaction.editReply({
      content: 'An error occurred while fetching artifact data. Please try again later.',
    });
  }
}

async function handleSet(interaction: ChatInputCommandInteraction) {
  const name = interaction.options.getString('name', true);
  
  await interaction.deferReply();

  try {
    const set = getArtifactSetByName(name);

    if (!set) {
      await interaction.editReply({
        content: `Could not find an artifact set named "${name}".`,
      });
      return;
    }

    const setName = set.name.get('en') || 'Unknown';
    
    const embed = new EmbedBuilder()
      .setColor(0xFFD700)
      .setTitle(setName);

    // Add set bonuses
    const bonuses = set.setBonus;
    if (bonuses && bonuses.length > 0) {
      for (const bonus of bonuses) {
        const description = bonus.description.get('en') || 'No description';
        embed.addFields({
          name: `${bonus.needCount}-Piece Bonus`,
          value: description,
          inline: false,
        });
      }
    }

    // Try to add set icon - use first artifact piece icon
    try {
      if (set.icon?.url) {
        embed.setThumbnail(set.icon.url);
      }
    } catch (e) {
      // Ignore
    }

    embed.setFooter({ text: 'Data from Enka.Network' })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });

  } catch (error: any) {
    logger.error('[Artifacts] Error fetching artifact set:', error);
    await interaction.editReply({
      content: 'An error occurred while fetching artifact set data.',
    });
  }
}

async function handleList(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  try {
    const sets = getAllArtifactSets();
    
    // Group by set bonus type (2pc only, 4pc available)
    const fourPieceSets = sets.filter(s => s.setBonus.length > 1);
    
    // Sort alphabetically
    fourPieceSets.sort((a, b) => {
      const nameA = a.name.get('en') || '';
      const nameB = b.name.get('en') || '';
      return nameA.localeCompare(nameB);
    });

    // Create embed with sets
    const embed = new EmbedBuilder()
      .setColor(0xFFD700)
      .setTitle('Artifact Sets')
      .setDescription(`Found ${fourPieceSets.length} artifact sets with 4-piece bonuses`);

    // Split into chunks for fields (max 1024 chars per field)
    const setNames = fourPieceSets.map(s => s.name.get('en') || 'Unknown');
    const chunks: string[][] = [];
    let currentChunk: string[] = [];
    let currentLength = 0;

    for (const name of setNames) {
      if (currentLength + name.length + 2 > 900) {
        chunks.push(currentChunk);
        currentChunk = [name];
        currentLength = name.length + 2;
      } else {
        currentChunk.push(name);
        currentLength += name.length + 2;
      }
    }
    if (currentChunk.length > 0) {
      chunks.push(currentChunk);
    }

    // Add fields for each chunk
    chunks.forEach((chunk, index) => {
      embed.addFields({
        name: index === 0 ? 'Sets' : '\u200B',
        value: chunk.join(', '),
        inline: false,
      });
    });

    embed.setFooter({ text: 'Use /artifacts set <name> for details' })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });

  } catch (error: any) {
    logger.error('[Artifacts] Error listing artifact sets:', error);
    await interaction.editReply({
      content: 'An error occurred while listing artifact sets.',
    });
  }
}

export function createArtifactEmbed(character: Character, nickname: string, uid: string): EmbedBuilder {
  const charData = character.characterData;
  const name = charData.name.get('en') || 'Unknown';
  const artifacts = character.artifacts;
  
  const embed = new EmbedBuilder()
    .setColor(0xFFD700)
    .setTitle(`${name}'s Artifacts`);

  // Try to add character icon
  try {
    const iconUrl = charData.icon.url;
    if (iconUrl) {
      embed.setThumbnail(iconUrl);
    }
  } catch (e) {
    // Ignore
  }

  // Calculate and show total CV
  const cv = calculateCritValue(character);
  embed.setDescription(`Total Crit Value: **${(cv * 100).toFixed(1)}**`);

  // Artifact slot names
  const slotNames: Record<string, string> = {
    'EQUIP_BRACER': 'Flower',
    'EQUIP_NECKLACE': 'Plume',
    'EQUIP_SHOES': 'Sands',
    'EQUIP_RING': 'Goblet',
    'EQUIP_DRESS': 'Circlet',
  };

  // Show each artifact
  for (const artifact of artifacts) {
    const slotType = artifact.artifactData.equipType;
    const slotName = slotNames[slotType] || slotType;
    const setName = artifact.artifactData.set.name.get('en') || 'Unknown';
    const mainStatName = artifact.mainstat.fightPropName.get('en') || 'Unknown';
    const mainStatValue = artifact.mainstat.valueText;
    
    // Build substat string
    const substats = artifact.substats.total;
    const substatLines = substats.map(sub => {
      const subName = sub.fightPropName.get('en') || 'Unknown';
      const shortName = subName.replace('CRIT ', '').replace('Energy Recharge', 'ER');
      return `${shortName}: ${sub.valueText}`;
    });

    const fieldValue = [
      `**${setName}** (+${artifact.level})`,
      `Main: ${mainStatName} ${mainStatValue}`,
      substatLines.join(' | '),
    ].join('\n');

    embed.addFields({
      name: slotName,
      value: fieldValue,
      inline: true,
    });
  }

  // Add set bonuses
  const setCounts = new Map<string, number>();
  for (const artifact of artifacts) {
    const setName = artifact.artifactData.set.name.get('en') || 'Unknown';
    setCounts.set(setName, (setCounts.get(setName) || 0) + 1);
  }

  const activeSetBonuses: string[] = [];
  for (const [setName, count] of setCounts) {
    if (count >= 4) {
      activeSetBonuses.push(`${setName} (4pc)`);
    } else if (count >= 2) {
      activeSetBonuses.push(`${setName} (2pc)`);
    }
  }

  if (activeSetBonuses.length > 0) {
    embed.addFields({
      name: 'Active Set Bonuses',
      value: activeSetBonuses.join('\n'),
      inline: false,
    });
  }

  embed.setFooter({ text: `${nickname} | UID: ${uid}` })
    .setTimestamp();

  return embed;
}

export default command;
