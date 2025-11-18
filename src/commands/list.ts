import { ChatInputCommandInteraction, AutocompleteInteraction } from 'discord.js';
import { SlashCommandBuilder, StringSelectMenuBuilder, ActionRowBuilder } from 'discord.js';
import { characters } from '../data/characters.js';
import { createEmbed, getElementColor, getRarityEmoji } from '../utils/embeds.js';

export default {
  data: new SlashCommandBuilder()
    .setName('list')
    .setDescription('List all characters with sorting options'),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await showCharacterList(interaction, 'all', 'all');
  },

  async handleSelectMenu(interaction) {
    const [action, filterType, filterValue] = interaction.customId.split('_');
    
    if (action === 'filter') {
      if (filterType === 'element') {
        await showCharacterList(interaction, filterValue, 'all');
      } else if (filterType === 'rarity') {
        await showCharacterList(interaction, 'all', filterValue);
      } else if (filterType === 'both') {
        const [element, rarity] = filterValue.split('-');
        await showCharacterList(interaction, element, rarity);
      }
    } else if (action === 'sort') {
      // Get current filters from the message
      const currentEmbed = interaction.message.embeds[0];
      const description = currentEmbed.description;
      
      // Parse current filters from description
      let element = 'all';
      let rarity = 'all';
      
      if (description.includes('Element: ') && !description.includes('Element: All')) {
        element = description.match(/Element: (\w+)/)[1];
      }
      if (description.includes('Rarity: ') && !description.includes('Rarity: All')) {
        rarity = description.match(/Rarity: (\d)/)[1];
      }
      
      await showCharacterList(interaction, element, rarity);
    }
  },
};

async function showCharacterList(interaction, elementFilter = 'all', rarityFilter = 'all') {
  // Get all characters
  let characterList = Object.values(characters);

  // Apply filters
  if (elementFilter !== 'all') {
    characterList = characterList.filter(char => char.element.toLowerCase() === elementFilter.toLowerCase());
  }
  
  if (rarityFilter !== 'all') {
    characterList = characterList.filter(char => char.rarity === parseInt(rarityFilter));
  }

  // Sort by rarity (descending) then name (alphabetically)
  characterList.sort((a, b) => {
    if (b.rarity !== a.rarity) {
      return b.rarity - a.rarity;
    }
    return a.name.localeCompare(b.name);
  });

  // Group by element
  const groupedByElement = {};
  characterList.forEach(char => {
    if (!groupedByElement[char.element]) {
      groupedByElement[char.element] = [];
    }
    groupedByElement[char.element].push(char);
  });

  // Build embed description
  let description = '';
  
  // Show active filters
  const filters = [];
  if (elementFilter !== 'all') filters.push(`Element: ${elementFilter}`);
  if (rarityFilter !== 'all') filters.push(`Rarity: ${rarityFilter}★`);
  
  if (filters.length > 0) {
    description += `**Filters:** ${filters.join(' | ')}\n\n`;
  } else {
    description += `**Showing:** All Characters\n\n`;
  }

  // Add character count
  description += `**Total Characters:** ${characterList.length}\n\n`;

  // Build character list grouped by element
  const elementOrder = ['Pyro', 'Hydro', 'Anemo', 'Electro', 'Cryo', 'Geo', 'Dendro'];
  
  for (const element of elementOrder) {
    if (!groupedByElement[element]) continue;
    
    const chars = groupedByElement[element];
    
    description += `**${element}** (${chars.length})\n`;
    
    // Group by rarity within element
    const fiveStars = chars.filter(c => c.rarity === 5);
    const fourStars = chars.filter(c => c.rarity === 4);
    
    if (fiveStars.length > 0) {
      description += `5-Star: `;
      description += fiveStars.map(c => c.name).join(', ');
      description += '\n';
    }
    
    if (fourStars.length > 0) {
      description += `4-Star: `;
      description += fourStars.map(c => c.name).join(', ');
      description += '\n';
    }
    
    description += '\n';
  }

  // Ensure description is not empty (Discord requires it)
  if (!description.trim()) {
    description = 'No characters found matching the selected filters.';
  }

  // Create embed
  const embed = createEmbed({
    title: 'Genshin Impact Characters',
    description: description.trim(),
    color: elementFilter !== 'all' ? getElementColor(elementFilter) : 0x5865F2
  });

  // Create filter select menus
  const elementSelectMenu = new StringSelectMenuBuilder()
    .setCustomId('filter_element')
    .setPlaceholder('Filter by Element')
    .addOptions([
      { label: 'All Elements', value: 'filter_element_all' },
      { label: 'Pyro', value: 'filter_element_Pyro' },
      { label: 'Hydro', value: 'filter_element_Hydro' },
      { label: 'Anemo', value: 'filter_element_Anemo' },
      { label: 'Electro', value: 'filter_element_Electro' },
      { label: 'Cryo', value: 'filter_element_Cryo' },
      { label: 'Geo', value: 'filter_element_Geo' },
      { label: 'Dendro', value: 'filter_element_Dendro' },
    ]);

  const raritySelectMenu = new StringSelectMenuBuilder()
    .setCustomId('filter_rarity')
    .setPlaceholder('Filter by Rarity')
    .addOptions([
      { label: 'All Rarities', value: 'filter_rarity_all' },
      { label: '5-Star Characters', value: 'filter_rarity_5' },
      { label: '4-Star Characters', value: 'filter_rarity_4' },
    ]);

  const row1 = new ActionRowBuilder().addComponents(elementSelectMenu);
  const row2 = new ActionRowBuilder().addComponents(raritySelectMenu);

  if (interaction.replied || interaction.deferred) {
    await interaction.update({ embeds: [embed], components: [row1, row2] });
  } else {
    await interaction.reply({ embeds: [embed], components: [row1, row2] });
  }
}
