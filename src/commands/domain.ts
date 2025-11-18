import { ChatInputCommandInteraction, AutocompleteInteraction } from 'discord.js';
import { SlashCommandBuilder } from 'discord.js';
import { getDomainsByDay, domains } from '../data/domains.js';
import { getCurrentDay } from '../utils/time.js';
import userService from '../services/userService.js';
import { createInfoEmbed } from '../utils/embeds.js';

export default {
  data: new SlashCommandBuilder()
    .setName('domain')
    .setDescription('View domain schedules and availability')
    .addSubcommand(subcommand =>
      subcommand
        .setName('schedule')
        .setDescription('View today\'s available domains')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('search')
        .setDescription('Search for a specific domain')
        .addStringOption(option =>
          option
            .setName('name')
            .setDescription('Domain name')
            .setRequired(true)
            .setAutocomplete(true)
        )
    ),

  async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
    const focusedValue = interaction.options.getFocused().toLowerCase();
    const domainNames = Object.values(domains).map(d => d.name);
    const filtered = domainNames.filter(name => 
      name.toLowerCase().includes(focusedValue)
    ).slice(0, 25);

    await interaction.respond(
      filtered.map(name => ({ name, value: name }))
    );
  },

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'schedule') {
      const user = await userService.getOrCreateUser(interaction.user.id);
      const today = getCurrentDay(user.genshinServer);
      const availableDomains = getDomainsByDay(today);

      const talentDomains = [];
      const weaponDomains = [];
      const artifactDomains = [];

      for (const domain of Object.values(availableDomains)) {
        if (domain.type === 'talent') {
          const materials = domain.available.join(', ');
          talentDomains.push(`**${domain.name}**\n└ ${materials}`);
        } else if (domain.type === 'weapon') {
          const materials = domain.available.join(', ');
          weaponDomains.push(`**${domain.name}**\n└ ${materials}`);
        } else if (domain.type === 'artifact') {
          const sets = domain.sets.join(', ');
          artifactDomains.push(`**${domain.name}**\n└ ${sets}`);
        }
      }

      let description = `**Today is ${today}**\n\n`;
      
      if (talentDomains.length > 0) {
        description += `**Talent Domains**\n${talentDomains.join('\n\n')}\n\n`;
      }
      
      if (weaponDomains.length > 0) {
        description += `**Weapon Domains**\n${weaponDomains.join('\n\n')}\n\n`;
      }
      
      if (artifactDomains.length > 0) {
        description += `**🎭 Artifact Domains** (Available Every Day)\n${artifactDomains.join('\n\n')}`;
      }

      const embed = createInfoEmbed(
        'Domain Schedule',
        description
      );

      await interaction.reply({ embeds: [embed] });
    } else if (subcommand === 'search') {
      const domainName = interaction.options.getString('name');
      const domain = Object.values(domains).find(
        d => d.name.toLowerCase() === domainName.toLowerCase()
      );

      if (!domain) {
        await interaction.reply({
          content: 'Domain not found! Use autocomplete to find valid domains.',
          ephemeral: true,
        });
        return;
      }

      let scheduleInfo = '';
      if ((domain as any).schedule) {
        scheduleInfo = Object.entries((domain as any).schedule)
          .map(([day, materials]: [string, any]) => `**${day}:** ${materials.join(', ')}`)
          .join('\n');
      } else {
        scheduleInfo = '**Available every day**';
      }

      const embed = createInfoEmbed(
        domain.name,
        `**Type:** ${domain.type.charAt(0).toUpperCase() + domain.type.slice(1)}\n` +
        `**Location:** ${domain.location}\n` +
        `**Resin Cost:** ${domain.resinCost}\n\n` +
        `**Schedule:**\n${scheduleInfo}`
      );

      await interaction.reply({ embeds: [embed] });
    }
  },
};
