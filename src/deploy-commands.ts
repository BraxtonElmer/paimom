import { REST, Routes } from 'discord.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdirSync } from 'fs';
import config from './config/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const commands: any[] = [];

const commandsPath = join(__dirname, 'commands');
const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = join(commandsPath, file);
  const command = await import(`file://${filePath}`);
  
  if (command.default?.data) {
    commands.push(command.default.data.toJSON());
    console.log(`[OK] Loaded command: ${command.default.data.name}`);
  }
}

const rest = new REST().setToken(config.discord.token);

(async () => {
  try {
    console.log(`\nStarted refreshing ${commands.length} application (/) commands.`);

    const data = await rest.put(
      Routes.applicationCommands(config.discord.clientId),
      { body: commands },
    ) as any[];

    console.log(`Successfully reloaded ${data.length} application (/) commands globally.`);
    
    if (config.discord.guildId) {
      const guildData = await rest.put(
        Routes.applicationGuildCommands(config.discord.clientId, config.discord.guildId),
        { body: commands },
      ) as any[];
      console.log(`Successfully deployed ${guildData.length} commands to test guild.`);
    }

    console.log('\nCommand deployment complete!');
  } catch (error) {
    console.error('[ERROR] Error deploying commands:', error);
    process.exit(1);
  }
})();
