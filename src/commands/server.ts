import { ChatInputCommandInteraction, AutocompleteInteraction } from 'discord.js';
import { SlashCommandBuilder } from 'discord.js';
import userService from '../services/userService.js';
import { createSuccessEmbed, createInfoEmbed } from '../utils/embeds.js';
import { createSelectMenu } from '../utils/components.js';
import { getServerResetTime, getWeeklyResetTime, getTimeUntilReset, formatTimeUntilReset } from '../utils/time.js';
import config from '../config/config.js';
import type { GenshinServer } from '../models/User.js';

export default {
  data: new SlashCommandBuilder()
    .setName('server')
    .setDescription('Manage your Genshin server settings')
    .addSubcommand(subcommand =>
      subcommand
        .setName('set')
        .setDescription('Set your Genshin server region')
        .addStringOption(option =>
          option
            .setName('region')
            .setDescription('Your Genshin server region')
            .setRequired(true)
            .addChoices(
              { name: 'Asia', value: 'asia' },
              { name: 'America (NA)', value: 'na' },
              { name: 'Europe (EU)', value: 'eu' },
              { name: 'TW/HK/MO', value: 'tw' }
            )
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('info')
        .setDescription('View your current server settings and reset times')
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'set') {
      const region = interaction.options.getString('region') as GenshinServer;
      
      await userService.updateServer(interaction.user.id, region);
      
      const serverConfig = config.genshinServers[region];
      const embed = createSuccessEmbed(
        'Server Updated',
        `Your Genshin server has been set to **${serverConfig.name}**!\n\n` +
        `Daily resets will occur at **${(serverConfig as any).dailyReset} UTC**.\n` +
        `Weekly resets will occur on **Mondays at ${(serverConfig as any).weeklyReset.time} UTC**.`
      );

      await interaction.reply({ embeds: [embed], ephemeral: true });
    } else if (subcommand === 'info') {
      const user = await userService.getOrCreateUser(interaction.user.id);
      const serverConfig = config.genshinServers[user.genshinServer];
      
      const dailyResetTime = getServerResetTime(user.genshinServer);
      const weeklyResetTime = getWeeklyResetTime(user.genshinServer);
      
      const dailyTimeUntil = getTimeUntilReset(dailyResetTime);
      const weeklyTimeUntil = getTimeUntilReset(weeklyResetTime);

      const embed = createInfoEmbed(
        `Server: ${serverConfig.name}`,
        `**Daily Reset:** ${formatTimeUntilReset(dailyTimeUntil)}\n` +
        `**Weekly Reset:** ${formatTimeUntilReset(weeklyTimeUntil)}\n\n` +
        `**Timezone:** ${serverConfig.timezone}\n` +
        `**Daily Reset Time:** ${(serverConfig as any).dailyReset} UTC\n` +
        `**Weekly Reset Time:** Mondays at ${(serverConfig as any).weeklyReset.time} UTC\n\n` +
        `**Notifications:** ${user.notificationsEnabled ? 'Enabled' : 'Disabled'}\n` +
        `**Daily Reset Alerts:** ${user.dailyResetNotifications ? 'On' : 'Off'}\n` +
        `**Weekly Reset Alerts:** ${user.weeklyResetNotifications ? 'On' : 'Off'}`
      );

      await interaction.reply({ embeds: [embed] });
    }
  },
};
