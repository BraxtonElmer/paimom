import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from 'discord.js';
import { Command } from '../index.js';
import { fetchUserProfile, fetchUserBasicInfo, getImageUrl } from '../services/enkaService.js';
import { User } from '../models/index.js';
import logger from '../utils/logger.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('View Genshin Impact profile from Enka.Network')
    .addSubcommand(subcommand =>
      subcommand
        .setName('view')
        .setDescription('View a Genshin profile by UID')
        .addStringOption(option =>
          option
            .setName('uid')
            .setDescription('Genshin Impact UID (or leave empty to use linked UID)')
            .setRequired(false)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('link')
        .setDescription('Link your Genshin UID to your Discord account')
        .addStringOption(option =>
          option
            .setName('uid')
            .setDescription('Your Genshin Impact UID')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('unlink')
        .setDescription('Unlink your Genshin UID from your Discord account')
    ) as SlashCommandBuilder,

  async execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case 'view':
        await handleView(interaction);
        break;
      case 'link':
        await handleLink(interaction);
        break;
      case 'unlink':
        await handleUnlink(interaction);
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

    // Build the main embed
    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle(profile.nickname)
      .setDescription(`Adventure Rank ${profile.level}`)
      .addFields(
        { name: 'UID', value: uid, inline: true },
        { name: 'World Level', value: profile.worldLevel?.toString() || 'N/A', inline: true },
        { name: 'Achievements', value: profile.achievements?.toString() || 'N/A', inline: true },
      );

    // Add signature if available
    if (profile.signature) {
      embed.addFields({ name: 'Signature', value: profile.signature, inline: false });
    }

    // Add Spiral Abyss info if available
    if (profile.spiralAbyss) {
      embed.addFields({
        name: 'Spiral Abyss',
        value: `Floor ${profile.spiralAbyss.floor}-${profile.spiralAbyss.chamber} (${profile.spiralAbyss.stars} stars)`,
        inline: true,
      });
    }

    // Add Theater info if available
    if (profile.theater) {
      embed.addFields({
        name: 'Imaginarium Theater',
        value: `Act ${profile.theater.act} - ${profile.theater.stars} Stars`,
        inline: true,
      });
    }

    // Add profile picture
    if (profile.profilePicture) {
      try {
        const iconUrl = profile.profilePicture.icon?.url;
        if (iconUrl) {
          embed.setThumbnail(iconUrl);
        }
      } catch (e) {
        // Ignore thumbnail errors
      }
    }

    // Add namecard as banner if available
    if (profile.profileCard) {
      try {
        const pictures = profile.profileCard.pictures;
        if (pictures && pictures.length > 0) {
          embed.setImage(pictures[0].url);
        }
      } catch (e) {
        // Ignore banner errors
      }
    }

    // Build character showcase section
    const showcaseChars = profile.charactersPreview;
    if (showcaseChars && showcaseChars.length > 0) {
      const charList = showcaseChars.slice(0, 8).map(char => {
        const element = char.element?.name.get('en') || '?';
        const level = char.level || '?';
        const charData = char.costume.getCharacterData();
        const name = charData?.name.get('en') || 'Unknown';
        return `${name} (${element}) Lv.${level}`;
      }).join('\n');
      
      embed.addFields({ name: 'Character Showcase', value: charList || 'No characters on display', inline: false });
    }

    embed.setFooter({ text: 'Data from Enka.Network' })
      .setTimestamp();

    // Create buttons for more details
    const components: ActionRowBuilder<ButtonBuilder>[] = [];
    
    // Check if profile has detailed characters
    if (profile.showCharacterDetails && profile.characters && profile.characters.length > 0) {
      const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`profile_builds_${uid}`)
            .setLabel('View Character Builds')
            .setStyle(ButtonStyle.Primary),
        );
      components.push(row);
    }

    await interaction.editReply({
      embeds: [embed],
      components: components.length > 0 ? components : undefined,
    });

  } catch (error: any) {
    logger.error('[Profile] Error fetching profile:', error);
    
    if (error.message?.includes('rate limit')) {
      await interaction.editReply({
        content: 'Enka.Network is currently rate limiting requests. Please try again in a few moments.',
      });
    } else {
      await interaction.editReply({
        content: 'An error occurred while fetching the profile. Please try again later.',
      });
    }
  }
}

async function handleLink(interaction: ChatInputCommandInteraction) {
  const uid = interaction.options.getString('uid', true);

  // Validate UID format
  if (!/^\d{9,10}$/.test(uid)) {
    await interaction.reply({
      content: 'Invalid UID format. Please provide a valid 9-10 digit Genshin Impact UID.',
      ephemeral: true,
    });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  try {
    // Verify the UID exists
    const profile = await fetchUserBasicInfo(uid);
    if (!profile) {
      await interaction.editReply({
        content: `Could not verify UID **${uid}**. Make sure the UID is correct and your profile is public.`,
      });
      return;
    }

    // Update or create user
    const [user, created] = await User.findOrCreate({
      where: { id: interaction.user.id },
      defaults: { id: interaction.user.id, genshinUid: uid },
    });

    if (!created) {
      await user.update({ genshinUid: uid });
    }

    await interaction.editReply({
      content: `Successfully linked UID **${uid}** (${profile.nickname}) to your Discord account!\n\nYou can now use \`/profile view\` without specifying a UID.`,
    });

  } catch (error: any) {
    logger.error('[Profile] Error linking UID:', error);
    await interaction.editReply({
      content: 'An error occurred while linking your UID. Please try again later.',
    });
  }
}

async function handleUnlink(interaction: ChatInputCommandInteraction) {
  try {
    const user = await User.findByPk(interaction.user.id);
    
    if (!user?.genshinUid) {
      await interaction.reply({
        content: 'You do not have a Genshin UID linked to your account.',
        ephemeral: true,
      });
      return;
    }

    await user.update({ genshinUid: null });

    await interaction.reply({
      content: 'Successfully unlinked your Genshin UID from your Discord account.',
      ephemeral: true,
    });

  } catch (error: any) {
    logger.error('[Profile] Error unlinking UID:', error);
    await interaction.reply({
      content: 'An error occurred while unlinking your UID. Please try again later.',
      ephemeral: true,
    });
  }
}

export default command;
