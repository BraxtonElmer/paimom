import { Client, Collection, GatewayIntentBits, Partials, ChatInputCommandInteraction, ButtonInteraction, ModalSubmitInteraction, AutocompleteInteraction, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdirSync } from 'fs';
import config from './config/config.js';
import sequelize from './database/connection.js';
import { syncDatabase } from './models/index.js';
import logger from './utils/logger.js';
import ReminderJob from './jobs/reminderJob.js';
import ResetNotificationJob from './jobs/resetNotificationJob.js';
import { initializeEnka, closeEnka, fetchUserProfile } from './services/enkaService.js';
import { createCharacterEmbed } from './commands/showcase.js';
import { createArtifactEmbed } from './commands/artifacts.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface Command {
  data: {
    name: string;
    toJSON: () => any;
  };
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
  autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>;
  generateHelpEmbed?: (category: string) => any;
}

interface ExtendedClient extends Client {
  commands: Collection<string, Command>;
  buttons: Collection<string, any>;
  modals: Collection<string, any>;
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel],
}) as ExtendedClient;

client.commands = new Collection();
client.buttons = new Collection();
client.modals = new Collection();

const commandsPath = join(__dirname, 'commands');
const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = join(commandsPath, file);
  const command = await import(`file://${filePath}`);
  
  if (command.default?.data?.name) {
    client.commands.set(command.default.data.name, command.default);
    logger.info(`Loaded command: ${command.default.data.name}`);
  }
}

const buttonsPath = join(__dirname, 'components', 'buttons');
try {
  const buttonFiles = readdirSync(buttonsPath).filter(file => file.endsWith('.js'));
  
  for (const file of buttonFiles) {
    const filePath = join(buttonsPath, file);
    const button = await import(`file://${filePath}`);
    
    if (button.default?.customId) {
      client.buttons.set(button.default.customId, button.default);
      logger.info(`Loaded button: ${button.default.customId}`);
    }
  }
} catch (error) {
  logger.warn('No button components directory found');
}

const modalsPath = join(__dirname, 'components', 'modals');
try {
  const modalFiles = readdirSync(modalsPath).filter(file => file.endsWith('.js'));
  
  for (const file of modalFiles) {
    const filePath = join(modalsPath, file);
    const modal = await import(`file://${filePath}`);
    
    if (modal.default?.customId) {
      client.modals.set(modal.default.customId, modal.default);
      logger.info(`Loaded modal: ${modal.default.customId}`);
    }
  }
} catch (error) {
  logger.warn('No modal components directory found');
}

client.once('ready', async () => {
  logger.info(`Logged in as ${client.user!.tag}`);
  logger.info(`Serving ${client.guilds.cache.size} guilds`);
  
  client.user!.setPresence({
    activities: [{ name: '/help | Genshin Helper', type: 0 }],
    status: 'online',
  });

  // Initialize Enka.Network client
  try {
    await initializeEnka();
    logger.info('Enka.Network client initialized');
  } catch (error) {
    logger.error('Failed to initialize Enka.Network client:', error);
  }

  const reminderJob = new ReminderJob(client);
  reminderJob.start();

  const resetJob = new ResetNotificationJob(client);
  resetJob.start();

  logger.info('All systems operational');
});

client.on('interactionCreate', async (interaction) => {
  try {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      
      await command.execute(interaction as ChatInputCommandInteraction);
    } else if (interaction.isAutocomplete()) {
      const command = client.commands.get(interaction.commandName);
      if (!command?.autocomplete) return;
      
      await command.autocomplete(interaction as AutocompleteInteraction);
    } else if (interaction.isButton()) {
      // Handle help back button
      if (interaction.customId === 'help_back_to_main') {
        const helpCommand = client.commands.get('help');
        if (helpCommand && helpCommand.generateHelpEmbed) {
          const embed = helpCommand.generateHelpEmbed('overview');
          
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
                label: 'Characters & Builds',
                description: '8 commands',
                value: 'builds',
              },
              {
                label: 'Profile & Showcase',
                description: '4 commands',
                value: 'profile',
              },
              {
                label: 'Artifacts & Weapons',
                description: '5 commands',
                value: 'equipment',
              },
              {
                label: 'Tasks & Farming',
                description: '9 commands',
                value: 'todo',
              },
              {
                label: 'All Commands',
                description: 'View all 35 commands',
                value: 'all',
              },
            ]);

          const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);
          await interaction.update({ embeds: [embed], components: [row] });
          return;
        }
      }
      
      const customIdPrefix = interaction.customId.split('_')[0];
      const button = client.buttons.get(customIdPrefix);
      if (button) {
        await button.execute(interaction as ButtonInteraction);
      }
    } else if (interaction.isStringSelectMenu()) {
      // Handle help category dropdown
      if (interaction.customId === 'help_category_select') {
        const helpCommand = client.commands.get('help');
        if (helpCommand && helpCommand.generateHelpEmbed) {
          const category = interaction.values[0];
          const embed = helpCommand.generateHelpEmbed(category);
          
          const backButton = new ButtonBuilder()
            .setCustomId('help_back_to_main')
            .setLabel('Back to Main Menu')
            .setStyle(ButtonStyle.Secondary);

          const row = new ActionRowBuilder<ButtonBuilder>().addComponents(backButton);
          await interaction.update({ embeds: [embed], components: [row] });
        }
      }
      
      // Handle showcase character selection
      if (interaction.customId.startsWith('showcase_select_')) {
        const uid = interaction.customId.replace('showcase_select_', '');
        const charIndex = parseInt(interaction.values[0], 10);
        
        await interaction.deferUpdate();
        
        try {
          const profile = await fetchUserProfile(uid);
          if (profile && profile.characters && profile.characters[charIndex]) {
            const embed = createCharacterEmbed(profile.characters[charIndex], profile.nickname, uid);
            await interaction.editReply({ embeds: [embed] });
          }
        } catch (error) {
          logger.error('Error updating showcase:', error);
        }
      }
      
      // Handle artifacts character selection
      if (interaction.customId.startsWith('artifacts_select_')) {
        const uid = interaction.customId.replace('artifacts_select_', '');
        const charIndex = parseInt(interaction.values[0], 10);
        
        await interaction.deferUpdate();
        
        try {
          const profile = await fetchUserProfile(uid);
          if (profile && profile.characters && profile.characters[charIndex]) {
            const embed = createArtifactEmbed(profile.characters[charIndex], profile.nickname, uid);
            await interaction.editReply({ embeds: [embed] });
          }
        } catch (error) {
          logger.error('Error updating artifacts view:', error);
        }
      }
    } else if (interaction.isModalSubmit()) {
      const modal = client.modals.get(interaction.customId);
      if (modal) {
        await modal.execute(interaction as ModalSubmitInteraction);
      }
    }
  } catch (error) {
    logger.error('Error handling interaction:', error);
    
    try {
      if (interaction.isRepliable() && !interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: 'An error occurred!', ephemeral: true });
      } else if (interaction.isRepliable() && (interaction.replied || interaction.deferred)) {
        await interaction.followUp({ content: 'An error occurred!', ephemeral: true });
      }
    } catch (replyError) {
      logger.error('Error sending error message:', replyError);
    }
  }
});

try {
  await sequelize.authenticate();
  logger.info('Database connection established');
  
  await syncDatabase();
  
  await client.login(config.discord.token);
} catch (error) {
  logger.error('Failed to start bot:', error);
  process.exit(1);
}

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('Shutting down...');
  closeEnka();
  client.destroy();
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Shutting down...');
  closeEnka();
  client.destroy();
  process.exit(0);
});

export { Command };
