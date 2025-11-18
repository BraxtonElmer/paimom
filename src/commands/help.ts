import { ChatInputCommandInteraction, AutocompleteInteraction } from 'discord.js';
import { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } from 'discord.js';
import { createEmbed } from '../utils/embeds.js';

// Helper function to generate help embed based on category
const generateHelpEmbed = (category) => {
  let embed;

  if (category === 'overview') {
    embed = createEmbed({
      title: 'Paimom - Genshin Impact Helper',
      description: 'A Discord bot for tracking Genshin Impact progress and managing game activities.\n\n' +
                  'Select a category below to view detailed command information.',
      color: 0x5865F2,
      fields: [
        {
          name: 'Server and Notifications',
          value: 'Configure server region and automatic reset notifications',
          inline: false,
        },
        {
          name: 'Character Builds',
          value: 'Track character progression and view build recommendations',
          inline: false,
        },
        {
          name: 'Task Lists',
          value: 'Manage daily and weekly objectives',
          inline: false,
        },
        {
          name: 'Domains and Resin',
          value: 'View domain schedules and track resin regeneration',
          inline: false,
        },
      ],
    });
    return embed;
  }

  switch (category) {
    case 'server':
      embed = createEmbed({
        title: 'Server and Notifications',
        description: 'Configure server settings and notification preferences.',
        color: 0x00D166,
        fields: [
          {
            name: '/server set <region>',
            value: 'Set your Genshin server region (Asia, NA, EU, or TW)\nCalculates daily and weekly reset times based on region',
            inline: false,
          },
          {
            name: '/server info',
            value: 'View current server settings\nDisplay time until next daily and weekly reset\nCheck notification status',
            inline: false,
          },
          {
            name: '/notifications toggle <enabled>',
            value: 'Enable or disable all notifications',
            inline: false,
          },
          {
            name: '/notifications daily <enabled>',
            value: 'Toggle daily reset notifications\nReceive reminders for commission and resin resets',
            inline: false,
          },
          {
            name: '/notifications weekly <enabled>',
            value: 'Toggle weekly reset notifications\nReceive reminders for weekly boss resets',
            inline: false,
          },
          {
            name: '/notifications channel [target]',
            value: 'Set notification channel (leave empty for DM)\nConfigure where notifications are sent',
            inline: false,
          },
          {
            name: '/notifications settings',
            value: 'View current notification preferences',
            inline: false,
          },
        ],
      });
      break;

    case 'builds':
      embed = createEmbed({
        title: 'Character Builds',
        description: 'Track character progression and access build recommendations.',
        color: 0xFFA500,
        fields: [
          {
            name: '/list',
            value: 'Browse all 80+ Genshin characters with interactive filters\nFilter by element (Pyro, Hydro, Anemo, etc.)\nFilter by rarity (5-Star or 4-Star)\nCombine filters for specific searches',
            inline: false,
          },
          {
            name: '/character info <name>',
            value: 'View character details\nAscension materials and requirements\nTalent materials and domain schedules\nBoss drops and recommended weapons',
            inline: false,
          },
          {
            name: '/character build <name>',
            value: 'View build recommendations\nBest artifact sets and alternatives\nMain stat priorities (Sands/Goblet/Circlet)\nSubstat priorities\nTeam composition suggestions',
            inline: false,
          },
          {
            name: '/character track <name> [current_level] [target_level]',
            value: 'Start tracking a character build\nSet current and target levels\nDefaults: Level 1 → 90',
            inline: false,
          },
          {
            name: '/builds list',
            value: 'View all tracked character builds\nDisplay progress, levels, and talent levels',
            inline: false,
          },
          {
            name: '/builds details <build_id>',
            value: 'View detailed material requirements\nAscension materials needed\nTalent materials breakdown\nTotal mora cost\nDomain farming schedules',
            inline: false,
          },
          {
            name: '/builds update <build_id> [levels] [talents]',
            value: 'Update character build progress\nModify current and target levels and talents',
            inline: false,
          },
          {
            name: '/builds delete <build_id>',
            value: 'Remove a character from build tracking',
            inline: false,
          },
        ],
      });
      break;

    case 'todo':
      embed = createEmbed({
        title: 'Task Lists',
        description: 'Manage farming tasks and daily objectives.',
        color: 0x9B59B6,
        fields: [
          {
            name: '/todo add',
            value: 'Create a new task via interactive form\nCategories: Domain, Boss, Farming, Resin, Daily, Weekly\nSet resin cost and description',
            inline: false,
          },
          {
            name: '/todo list [category]',
            value: 'View task list\nFilter by category or view all\nDisplay task status, descriptions, and resin costs',
            inline: false,
          },
          {
            name: '/todo complete <task_id>',
            value: 'Mark task as completed\nAutomatically creates new task if set to recurring',
            inline: false,
          },
          {
            name: '/todo delete <task_id>',
            value: 'Delete a task permanently',
            inline: false,
          },
        ],
      });
      break;

    case 'domains':
      embed = createEmbed({
        title: 'Domains and Resin',
        description: 'View domain availability and track resin regeneration.',
        color: 0x3498DB,
        fields: [
          {
            name: '/domain schedule',
            value: 'View available domains for current day based on server\nDisplay talent, weapon, and artifact domains\nShow farmable materials',
            inline: false,
          },
          {
            name: '/domain search <name>',
            value: 'Search for specific domain\nDisplay location and available days\nShow materials and artifact sets',
            inline: false,
          },
          {
            name: '/resin check',
            value: 'Check current resin amount\\nDisplay time until full regeneration\\nShow progress visualization',
            inline: false,
          },
          {
            name: '/resin set <amount>',
            value: 'Set current resin amount (0-160)\\nBegin tracking regeneration\\nCalculate time until full',
            inline: false,
          },
          {
            name: '/resin use <amount>',
            value: 'Subtract spent resin amount\\nUpdate remaining resin\\nRecalculate time to full',
            inline: false,
          },
        ],
      });
      break;

    case 'all':
      embed = createEmbed({
        title: 'Command Reference',
        description: 'Complete list of available commands.',
        color: 0x5865F2,
        fields: [
          {
            name: 'Server and Notifications (7 commands)',
            value: '`/server set` `/server info` `/notifications toggle`\\n' +
                   '`/notifications daily` `/notifications weekly`\\n' +
                   '`/notifications channel` `/notifications settings`',
            inline: false,
          },
          {
            name: 'Character Builds (8 commands)',
            value: '`/list` `/character info` `/character build` `/character track`\\n' +
                   '`/builds list` `/builds details` `/builds update` `/builds delete`',
            inline: false,
          },
          {
            name: 'Task Lists (4 commands)',
            value: '`/todo add` `/todo list` `/todo complete` `/todo delete`',
            inline: false,
          },
          {
            name: 'Domains and Resin (5 commands)',
            value: '`/domain schedule` `/domain search`\\n' +
                   '`/resin check` `/resin set` `/resin use`',
            inline: false,
          },
          {
            name: 'Utility (2 commands)',
            value: '`/ping` - Check bot response time\\n' +
                   '`/help` - Display command reference',
            inline: false,
          },
        ],
      });
      break;
  }

  embed.setFooter({ text: 'Use /help to view the main menu' });
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
        .setPlaceholder('Select a category for more details')
        .addOptions([
          {
            label: 'Server & Notifications',
            description: 'Reset times and notification settings',
            value: 'server',
          },
          {
            label: 'Character Builds',
            description: 'Build tracking and material planning',
            value: 'builds',
          },
          {
            label: 'To-Do Lists',
            description: 'Task management and farming lists',
            value: 'todo',
          },
          {
            label: 'Domains & Resin',
            description: 'Domain schedules and resin tracking',
            value: 'domains',
          },
          {
            label: 'All Commands',
            description: 'Complete command reference',
            value: 'all',
          },
        ]);

      const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

      await interaction.reply({ embeds: [embed], components: [row] });
      return;
    }

    await interaction.reply({ embeds: [embed] });
  },
};
