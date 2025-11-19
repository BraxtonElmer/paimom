import { ChatInputCommandInteraction, AutocompleteInteraction, ButtonBuilder, ButtonStyle } from 'discord.js';
import { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } from 'discord.js';
import { createEmbed } from '../utils/embeds.js';

// Helper function to generate help embed based on category
const generateHelpEmbed = (category) => {
  let embed;

  if (category === 'overview') {
    embed = createEmbed({
      title: 'Paimom Command Center',
      description: 'Select a category below to view available commands',
      color: 0x5865F2,
      fields: [
        {
          name: 'Server & Notifications',
          value: 'Server region and reset notifications',
          inline: true,
        },
        {
          name: 'Character Builds',
          value: 'Browse characters and track builds',
          inline: true,
        },
        {
          name: 'Task Management',
          value: 'Daily objectives and farming tasks',
          inline: true,
        },
        {
          name: 'Domains & Resin',
          value: 'Domain schedules and resin tracking',
          inline: true,
        },
        {
          name: 'All Commands',
          value: 'Complete command reference',
          inline: true,
        },
        {
          name: 'Quick Stats',
          value: '`111 Characters` • `26 Commands`',
          inline: true,
        },
      ],
    });
    embed.setFooter({ text: 'Paimom v1.0 • Use the dropdown menu to navigate' });
    return embed;
  }

  switch (category) {
    case 'server':
      embed = createEmbed({
        title: 'Server & Notifications',
        description: 'Configure server settings and automated notifications',
        color: 0x00D166,
        fields: [
          {
            name: '/server set',
            value: 'Set your server region\n`Asia` `NA` `EU` `TW`',
            inline: true,
          },
          {
            name: '/server info',
            value: 'View server settings\nReset times and status',
            inline: true,
          },
          {
            name: '/notifications toggle',
            value: 'Enable/disable all notifications',
            inline: true,
          },
          {
            name: '/notifications daily',
            value: 'Toggle daily reset reminders',
            inline: true,
          },
          {
            name: '/notifications weekly',
            value: 'Toggle weekly reset reminders',
            inline: true,
          },
          {
            name: '/notifications channel',
            value: 'Set notification channel\nOmit for DM',
            inline: true,
          },
          {
            name: '/notifications settings',
            value: 'View current preferences',
            inline: true,
          },
        ],
      });
      embed.setFooter({ text: '7 commands • Server & Notifications' });
      break;

    case 'builds':
      embed = createEmbed({
        title: 'Character Builds',
        description: 'Browse characters, view builds, and track progression',
        color: 0xFFA500,
        fields: [
          {
            name: '/list',
            value: 'Browse all 111 characters\nFilter by element or rarity',
            inline: true,
          },
          {
            name: '/character info',
            value: 'View character details\nMaterials and requirements',
            inline: true,
          },
          {
            name: '/character build',
            value: 'View build recommendations\nArtifacts, weapons, teams',
            inline: true,
          },
          {
            name: '/character track',
            value: 'Start tracking a character\nSet current and target levels',
            inline: true,
          },
          {
            name: '/builds list',
            value: 'View all tracked builds\nProgress and levels',
            inline: true,
          },
          {
            name: '/builds details',
            value: 'Material breakdown\nDomain schedules and costs',
            inline: true,
          },
          {
            name: '/builds update',
            value: 'Update build progress\nModify levels and talents',
            inline: true,
          },
          {
            name: '/builds delete',
            value: 'Remove tracked character',
            inline: true,
          },
        ],
      });
      embed.setFooter({ text: '8 commands • Character Builds' });
      break;

    case 'todo':
      embed = createEmbed({
        title: 'Task Management',
        description: 'Organize farming objectives and daily activities',
        color: 0x9B59B6,
        fields: [
          {
            name: '/todo add',
            value: 'Create new task\nInteractive form',
            inline: true,
          },
          {
            name: '/todo list',
            value: 'View all tasks\nFilter by category',
            inline: true,
          },
          {
            name: '/todo complete',
            value: 'Mark task completed\nAuto-recreates if recurring',
            inline: true,
          },
          {
            name: '/todo delete',
            value: 'Delete task permanently',
            inline: true,
          },
        ],
      });
      embed.setFooter({ text: '4 commands • Task Management' });
      break;

    case 'domains':
      embed = createEmbed({
        title: 'Domains & Resin',
        description: 'View domain schedules and track resin regeneration',
        color: 0x3498DB,
        fields: [
          {
            name: '/domain schedule',
            value: 'View today\'s domains\nBased on server region',
            inline: true,
          },
          {
            name: '/domain search',
            value: 'Search specific domain\nLocation and materials',
            inline: true,
          },
          {
            name: '/resin check',
            value: 'View current resin\nTime until full',
            inline: true,
          },
          {
            name: '/resin set',
            value: 'Set resin amount\nStart tracking',
            inline: true,
          },
          {
            name: '/resin use',
            value: 'Subtract spent resin\nUpdate tracking',
            inline: true,
          },
        ],
      });
      embed.setFooter({ text: '5 commands • Domains & Resin' });
      break;

    case 'all':
      embed = createEmbed({
        title: 'All Commands',
        description: 'Complete command reference',
        color: 0x5865F2,
        fields: [
          {
            name: 'Server & Notifications',
            value: '`/server set` `/server info`\n`/notifications toggle` `/notifications daily`\n`/notifications weekly` `/notifications channel`\n`/notifications settings`',
            inline: false,
          },
          {
            name: 'Character Builds',
            value: '`/list` `/character info` `/character build`\n`/character track` `/builds list` `/builds details`\n`/builds update` `/builds delete`',
            inline: false,
          },
          {
            name: 'Task Management',
            value: '`/todo add` `/todo list` `/todo complete` `/todo delete`',
            inline: false,
          },
          {
            name: 'Domains & Resin',
            value: '`/domain schedule` `/domain search`\n`/resin check` `/resin set` `/resin use`',
            inline: false,
          },
          {
            name: 'Utility',
            value: '`/ping` `/help`',
            inline: false,
          },
        ],
      });
      embed.setFooter({ text: '26 commands total • Paimom v1.0' });
      break;
  }

  return embed;
};

export default {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('View all available commands and features')
    .addStringOption(option =>
      option
        .setName('category')
        .setDescription('Choose a specific category')
        .addChoices(
          { name: 'Server & Notifications', value: 'server' },
          { name: 'Character Builds', value: 'builds' },
          { name: 'To-Do Lists', value: 'todo' },
          { name: 'Domains & Resin', value: 'domains' },
          { name: 'All Commands', value: 'all' }
        )
    ),

  generateHelpEmbed, // Export the helper function

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const category = interaction.options.getString('category') || 'overview';
    const embed = generateHelpEmbed(category);

    if (category === 'overview') {
      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('help_category_select')
        .setPlaceholder('Choose a category')
        .addOptions([
          {
            label: 'Server & Notifications',
            description: '7 commands',
            value: 'server',
          },
          {
            label: 'Character Builds',
            description: '8 commands',
            value: 'builds',
          },
          {
            label: 'Task Management',
            description: '4 commands',
            value: 'todo',
          },
          {
            label: 'Domains & Resin',
            description: '5 commands',
            value: 'domains',
          },
          {
            label: 'All Commands',
            description: 'View all 26 commands',
            value: 'all',
          },
        ]);

      const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

      await interaction.reply({ embeds: [embed], components: [row] });
      return;
    }

    // For specific categories, show back button
    const backButton = new ButtonBuilder()
      .setCustomId('help_back_to_main')
      .setLabel('Back to Main Menu')
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(backButton);

    await interaction.reply({ embeds: [embed], components: [row] });
  },
};
