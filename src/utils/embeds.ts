import { EmbedBuilder, APIEmbedField, EmbedAuthorOptions, EmbedFooterOptions } from 'discord.js';
import config from '../config/config.js';

export interface EmbedOptions {
  title?: string;
  description?: string;
  color?: number;
  author?: EmbedAuthorOptions;
  footer?: EmbedFooterOptions;
  thumbnail?: string;
  image?: string;
  fields?: APIEmbedField[];
  url?: string;
}

export const createEmbed = (options: EmbedOptions = {}): EmbedBuilder => {
  const embed = new EmbedBuilder()
    .setColor(options.color || config.colors.primary)
    .setTimestamp();
  
  if (options.title) embed.setTitle(options.title);
  if (options.description) embed.setDescription(options.description);
  if (options.author) embed.setAuthor(options.author);
  if (options.footer) embed.setFooter(options.footer);
  if (options.thumbnail) embed.setThumbnail(options.thumbnail);
  if (options.image) embed.setImage(options.image);
  if (options.fields) embed.addFields(options.fields);
  if (options.url) embed.setURL(options.url);
  
  return embed;
};

export const createSuccessEmbed = (title: string, description: string): EmbedBuilder => {
  return createEmbed({
    title,
    description,
    color: config.colors.success,
  });
};

export const createErrorEmbed = (title: string, description: string): EmbedBuilder => {
  return createEmbed({
    title,
    description,
    color: config.colors.error,
  });
};

export const createWarningEmbed = (title: string, description: string): EmbedBuilder => {
  return createEmbed({
    title,
    description,
    color: config.colors.warning,
  });
};

export const createInfoEmbed = (title: string, description: string): EmbedBuilder => {
  return createEmbed({
    title,
    description,
    color: config.colors.primary,
  });
};

export const getElementColor = (element: string): number => {
  const elementColors: Record<string, number> = {
    Pyro: config.colors.pyro,
    Hydro: config.colors.hydro,
    Anemo: config.colors.anemo,
    Electro: config.colors.electro,
    Dendro: config.colors.dendro,
    Cryo: config.colors.cryo,
    Geo: config.colors.geo,
  };
  return elementColors[element] || config.colors.primary;
};

export const getRarityEmoji = (rarity: number): string => {
  const stars = '⭐'.repeat(rarity);
  return stars;
};
