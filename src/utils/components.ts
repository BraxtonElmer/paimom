import { 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder
} from 'discord.js';

export interface ButtonConfig {
  customId: string;
  label: string;
  style?: ButtonStyle;
  emoji?: string | null;
  disabled?: boolean;
}

export interface CustomIdParts {
  action: string;
  subAction: string | undefined;
  data: string;
}

export const createPaginationButtons = (
  currentPage: number, 
  totalPages: number, 
  customId: string = 'pagination'
): ActionRowBuilder<ButtonBuilder> => {
  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`${customId}_first`)
        .setLabel('⏮️')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(currentPage === 0),
      new ButtonBuilder()
        .setCustomId(`${customId}_prev`)
        .setLabel('◀️')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(currentPage === 0),
      new ButtonBuilder()
        .setCustomId(`${customId}_page`)
        .setLabel(`${currentPage + 1} / ${totalPages}`)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId(`${customId}_next`)
        .setLabel('▶️')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(currentPage === totalPages - 1),
      new ButtonBuilder()
        .setCustomId(`${customId}_last`)
        .setLabel('⏭️')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(currentPage === totalPages - 1)
    );
  
  return row;
};

export const createConfirmationButtons = (customId: string = 'confirm'): ActionRowBuilder<ButtonBuilder> => {
  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`${customId}_yes`)
        .setLabel('Yes')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`${customId}_no`)
        .setLabel('No')
        .setStyle(ButtonStyle.Danger)
    );
  
  return row;
};

export const createSelectMenu = (
  customId: string, 
  placeholder: string, 
  options: StringSelectMenuOptionBuilder[]
): ActionRowBuilder<StringSelectMenuBuilder> => {
  const row = new ActionRowBuilder<StringSelectMenuBuilder>()
    .addComponents(
      new StringSelectMenuBuilder()
        .setCustomId(customId)
        .setPlaceholder(placeholder)
        .addOptions(options)
    );
  
  return row;
};

export const createActionButtons = (buttons: ButtonConfig[]): ActionRowBuilder<ButtonBuilder> => {
  const row = new ActionRowBuilder<ButtonBuilder>();
  
  for (const button of buttons) {
    const btn = new ButtonBuilder()
      .setCustomId(button.customId)
      .setLabel(button.label)
      .setStyle(button.style || ButtonStyle.Primary)
      .setDisabled(button.disabled || false);
    
    if (button.emoji) {
      btn.setEmoji(button.emoji);
    }
    
    row.addComponents(btn);
  }
  
  return row;
};

export const parseCustomId = (customId: string): CustomIdParts => {
  const parts = customId.split('_');
  return {
    action: parts[0],
    subAction: parts[1],
    data: parts.slice(2).join('_'),
  };
};
