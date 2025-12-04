import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { Command } from '../index.js';
import { fetchUserProfile, calculateCritValue, getArtifactSetBonuses, getImageUrl } from '../services/enkaService.js';
import { User } from '../models/index.js';
import logger from '../utils/logger.js';
import { Character, DetailedGenshinUser } from 'enka-network-api';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('showcase')
    .setDescription('View detailed character builds from Enka.Network')
    .addStringOption(option =>
      option
        .setName('uid')
        .setDescription('Genshin Impact UID (or leave empty to use linked UID)')
        .setRequired(false)
    ) as SlashCommandBuilder,

  async execute(interaction: ChatInputCommandInteraction) {
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
          content: `Profile **${profile.nickname}** (UID: ${uid}) does not have any detailed character builds on display.\n\nTo show character builds:\n1. Open Genshin Impact\n2. Go to your profile settings\n3. Enable "Show Character Details"`,
        });
        return;
      }

      // Build character selection menu
      const selectOptions = profile.characters.map((char, index) => {
        const name = char.characterData.name.get('en') || 'Unknown';
        const element = char.characterData.element?.name.get('en') || '?';
        const level = char.level;
        
        return new StringSelectMenuOptionBuilder()
          .setLabel(`${name}`)
          .setDescription(`${element} | Lv.${level} | C${char.unlockedConstellations.length}`)
          .setValue(index.toString());
      });

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(`showcase_select_${uid}`)
        .setPlaceholder('Select a character to view')
        .addOptions(selectOptions);

      const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

      // Show first character by default
      const embed = createCharacterEmbed(profile.characters[0], profile.nickname, uid);

      await interaction.editReply({
        embeds: [embed],
        components: [row],
      });

    } catch (error: any) {
      logger.error('[Showcase] Error fetching showcase:', error);
      
      if (error.message?.includes('rate limit')) {
        await interaction.editReply({
          content: 'Enka.Network is currently rate limiting requests. Please try again in a few moments.',
        });
      } else {
        await interaction.editReply({
          content: 'An error occurred while fetching the showcase. Please try again later.',
        });
      }
    }
  },
};

export function createCharacterEmbed(character: Character, nickname: string, uid: string): EmbedBuilder {
  const charData = character.characterData;
  const name = charData.name.get('en') || 'Unknown';
  const element = charData.element?.name.get('en') || 'Unknown';
  const weapon = character.weapon;
  
  // Get element color
  const elementColors: Record<string, number> = {
    'Pyro': 0xEF7A35,
    'Hydro': 0x4CC2F1,
    'Electro': 0xAF8EC1,
    'Cryo': 0x99D9EA,
    'Dendro': 0xA5C83B,
    'Anemo': 0x74C2A8,
    'Geo': 0xFAB632,
  };
  
  const color = elementColors[element] || 0x5865F2;
  
  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(`${name}`)
    .setDescription(`${element} | Lv.${character.level}/${character.maxLevel} | C${character.unlockedConstellations.length}`);

  // Add character icon
  try {
    const iconUrl = charData.icon.url;
    if (iconUrl) {
      embed.setThumbnail(iconUrl);
    }
  } catch (e) {
    // Ignore
  }

  // Weapon info
  const weaponName = weapon.weaponData.name.get('en') || 'Unknown';
  const weaponRefinement = weapon.refinement?.level || 1;
  embed.addFields({
    name: 'Weapon',
    value: `${weaponName}\nLv.${weapon.level} | R${weaponRefinement}`,
    inline: true,
  });

  // Talent levels
  const talents = character.skillLevels;
  if (talents.length > 0) {
    const talentInfo = talents.map(t => {
      const skillName = t.skill.name.get('en') || 'Unknown';
      const shortName = skillName.length > 15 ? skillName.slice(0, 15) + '...' : skillName;
      return `${shortName}: ${t.level.value}`;
    }).join('\n');
    
    embed.addFields({
      name: 'Talents',
      value: talentInfo || 'N/A',
      inline: true,
    });
  }

  // Constellations
  const constellations = character.unlockedConstellations;
  embed.addFields({
    name: 'Constellations',
    value: `${constellations.length}/6 Unlocked`,
    inline: true,
  });

  // Key stats
  const stats = character.stats;
  const statLines: string[] = [];
  
  // Get important stats
  const importantStats = [
    'FIGHT_PROP_MAX_HP',
    'FIGHT_PROP_CUR_ATTACK',
    'FIGHT_PROP_CUR_DEFENSE',
    'FIGHT_PROP_ELEMENT_MASTERY',
    'FIGHT_PROP_CRITICAL',
    'FIGHT_PROP_CRITICAL_HURT',
    'FIGHT_PROP_CHARGE_EFFICIENCY',
  ];

  for (const stat of stats.statProperties) {
    if (importantStats.includes(stat.fightProp)) {
      const name = stat.fightPropName.get('en') || stat.fightProp;
      const shortName = name.replace('CRIT ', '').replace('Energy ', 'ER ');
      statLines.push(`${shortName}: ${stat.valueText}`);
    }
  }

  if (statLines.length > 0) {
    embed.addFields({
      name: 'Stats',
      value: statLines.join('\n'),
      inline: false,
    });
  }

  // Crit Value
  const cv = calculateCritValue(character);
  embed.addFields({
    name: 'Crit Value (CV)',
    value: `${(cv * 100).toFixed(1)}`,
    inline: true,
  });

  // Artifact sets
  const setBonuses = getArtifactSetBonuses(character);
  if (setBonuses.length > 0) {
    const setInfo = setBonuses.map(s => {
      const setName = s.set.name.get('en') || 'Unknown';
      return `${setName} (${s.count}pc)`;
    }).join('\n');
    
    embed.addFields({
      name: 'Artifact Sets',
      value: setInfo,
      inline: true,
    });
  }

  // Artifact main stats summary
  const artifacts = character.artifacts;
  if (artifacts.length > 0) {
    const mainStats = artifacts.map(a => {
      const slot = a.artifactData.equipType.replace('EQUIP_', '');
      const mainStat = a.mainstat.fightPropName.get('en') || 'Unknown';
      return `${slot}: ${mainStat}`;
    }).join('\n');
    
    embed.addFields({
      name: 'Artifact Main Stats',
      value: mainStats || 'N/A',
      inline: false,
    });
  }

  embed.setFooter({ text: `${nickname} | UID: ${uid} | Data from Enka.Network` })
    .setTimestamp();

  return embed;
}

export default command;
