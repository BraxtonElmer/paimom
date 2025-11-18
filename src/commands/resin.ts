import { ChatInputCommandInteraction, AutocompleteInteraction } from 'discord.js';
import { SlashCommandBuilder } from 'discord.js';
import userService from '../services/userService.js';
import { calculateResinRegeneration, formatResinTime } from '../utils/time.js';
import { createInfoEmbed, createSuccessEmbed } from '../utils/embeds.js';

export default {
  data: new SlashCommandBuilder()
    .setName('resin')
    .setDescription('Track your resin')
    .addSubcommand(subcommand =>
      subcommand
        .setName('check')
        .setDescription('Check your current resin amount')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('set')
        .setDescription('Set your current resin amount')
        .addIntegerOption(option =>
          option
            .setName('amount')
            .setDescription('Current resin amount')
            .setRequired(true)
            .setMinValue(0)
            .setMaxValue(160)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('use')
        .setDescription('Subtract resin you just spent')
        .addIntegerOption(option =>
          option
            .setName('amount')
            .setDescription('Amount of resin spent')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(160)
        )
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const subcommand = interaction.options.getSubcommand();
    const user = await userService.getOrCreateUser(interaction.user.id);

    if (subcommand === 'check') {
      if (!user.resinLastUpdated) {
        await interaction.reply({
          content: 'You haven\'t set your resin yet! Use `/resin set <amount>` to start tracking.',
          ephemeral: true,
        });
        return;
      }

      const { currentResin, timeUntilFull } = calculateResinRegeneration(
        user.resinAmount,
        user.resinLastUpdated
      );

      await userService.updateResin(interaction.user.id, currentResin);

      const progressBar = this.createProgressBar(currentResin, 160);
      
      const embed = createInfoEmbed(
        'Resin Tracker',
        `**Current Resin:** ${currentResin} / 160\n\n` +
        progressBar + '\n\n' +
        (currentResin >= 160 
          ? '**Your resin is full!**'
          : `**Time until full:** ${formatResinTime(timeUntilFull)}`)
      );

      await interaction.reply({ embeds: [embed] });
    } else if (subcommand === 'set') {
      const amount = interaction.options.getInteger('amount');
      await userService.updateResin(interaction.user.id, amount);

      const { timeUntilFull } = calculateResinRegeneration(amount, new Date());

      const embed = createSuccessEmbed(
        'Resin Updated',
        `Set your resin to **${amount}**/160.\n\n` +
        (amount >= 160
          ? 'Your resin is full!'
          : `Will be full in: ${formatResinTime(timeUntilFull)}`)
      );

      await interaction.reply({ embeds: [embed], ephemeral: true });
    } else if (subcommand === 'use') {
      if (!user.resinLastUpdated) {
        await interaction.reply({
          content: 'You haven\'t set your resin yet! Use `/resin set <amount>` first.',
          ephemeral: true,
        });
        return;
      }

      const spent = interaction.options.getInteger('amount');
      const { currentResin } = calculateResinRegeneration(
        user.resinAmount,
        user.resinLastUpdated
      );

      const newAmount = Math.max(0, currentResin - spent);
      await userService.updateResin(interaction.user.id, newAmount);

      const { timeUntilFull } = calculateResinRegeneration(newAmount, new Date());

      const embed = createSuccessEmbed(
        'Resin Updated',
        `Spent **${spent}** resin.\n\n` +
        `**Current Resin:** ${newAmount}/160\n` +
        `**Will be full in:** ${formatResinTime(timeUntilFull)}`
      );

      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },

  createProgressBar(current, max, length = 20) {
    const percentage = current / max;
    const filled = Math.round(length * percentage);
    const empty = length - filled;
    
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    return `\`${bar}\` ${Math.round(percentage * 100)}%`;
  },
};
