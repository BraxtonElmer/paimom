import { ChatInputCommandInteraction, AutocompleteInteraction } from 'discord.js';
import { SlashCommandBuilder } from 'discord.js';
import userService from '../services/userService.js';
import { createSuccessEmbed, createInfoEmbed } from '../utils/embeds.js';
import { createActionButtons } from '../utils/components.js';
import { ButtonStyle } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('notifications')
    .setDescription('Configure your reset notifications')
    .addSubcommand(subcommand =>
      subcommand
        .setName('toggle')
        .setDescription('Enable or disable all notifications')
        .addBooleanOption(option =>
          option
            .setName('enabled')
            .setDescription('Enable notifications?')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('daily')
        .setDescription('Toggle daily reset notifications')
        .addBooleanOption(option =>
          option
            .setName('enabled')
            .setDescription('Enable daily reset notifications?')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('weekly')
        .setDescription('Toggle weekly reset notifications')
        .addBooleanOption(option =>
          option
            .setName('enabled')
            .setDescription('Enable weekly reset notifications?')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('channel')
        .setDescription('Set notification channel (leave empty for DM)')
        .addChannelOption(option =>
          option
            .setName('target')
            .setDescription('Channel to send notifications (empty = DM)')
            .setRequired(false)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('settings')
        .setDescription('View your current notification settings')
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'toggle') {
      const enabled = interaction.options.getBoolean('enabled');
      await userService.updateNotificationSettings(interaction.user.id, {
        notificationsEnabled: enabled,
      });

      const embed = createSuccessEmbed(
        'Notifications Updated',
        `All notifications have been **${enabled ? 'enabled' : 'disabled'}**.`
      );

      await interaction.reply({ embeds: [embed], ephemeral: true });
    } else if (subcommand === 'daily') {
      const enabled = interaction.options.getBoolean('enabled');
      await userService.updateNotificationSettings(interaction.user.id, {
        dailyResetNotifications: enabled,
      });

      const embed = createSuccessEmbed(
        'Daily Notifications Updated',
        `Daily reset notifications have been **${enabled ? 'enabled' : 'disabled'}**.`
      );

      await interaction.reply({ embeds: [embed], ephemeral: true });
    } else if (subcommand === 'weekly') {
      const enabled = interaction.options.getBoolean('enabled');
      await userService.updateNotificationSettings(interaction.user.id, {
        weeklyResetNotifications: enabled,
      });

      const embed = createSuccessEmbed(
        'Weekly Notifications Updated',
        `Weekly reset notifications have been **${enabled ? 'enabled' : 'disabled'}**.`
      );

      await interaction.reply({ embeds: [embed], ephemeral: true });
    } else if (subcommand === 'channel') {
      const channel = interaction.options.getChannel('target');
      await userService.updateNotificationSettings(interaction.user.id, {
        notificationChannel: channel?.id || null,
      });

      const embed = createSuccessEmbed(
        'Notification Channel Updated',
        channel 
          ? `Notifications will be sent to ${channel}.`
          : 'Notifications will be sent via DM.'
      );

      await interaction.reply({ embeds: [embed], ephemeral: true });
    } else if (subcommand === 'settings') {
      const user = await userService.getOrCreateUser(interaction.user.id);
      
      let channelInfo = 'Direct Messages';
      if (user.notificationChannel) {
        try {
          const channel = await interaction.client.channels.fetch(user.notificationChannel);
          channelInfo = `${channel}`;
        } catch {
          channelInfo = 'Unknown Channel (may have been deleted)';
        }
      }

      const embed = createInfoEmbed(
        'Notification Settings',
        `**All Notifications:** ${user.notificationsEnabled ? 'Enabled' : 'Disabled'}\n` +
        `**Daily Reset:** ${user.dailyResetNotifications ? 'On' : 'Off'}\n` +
        `**Weekly Reset:** ${user.weeklyResetNotifications ? 'On' : 'Off'}\n` +
        `**Channel:** ${channelInfo}`
      );

      await interaction.reply({ embeds: [embed] });
    }
  },
};
