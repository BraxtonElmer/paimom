import { EnkaClient, DetailedGenshinUser, GenshinUser, CharacterData, WeaponData, ArtifactSet, Character } from 'enka-network-api';
import logger from '../utils/logger.js';
import path from 'path';
import fs from 'fs';

// Singleton EnkaClient instance
let enkaClient: EnkaClient | null = null;

// Cache directory path
const CACHE_DIR = path.join(process.cwd(), 'cache', 'enka');

// Initialize the Enka client
export async function initializeEnka(): Promise<EnkaClient> {
  if (enkaClient) {
    return enkaClient;
  }

  // Ensure cache directory exists
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }

  enkaClient = new EnkaClient({
    cacheDirectory: CACHE_DIR,
    defaultLanguage: 'en',
    showFetchCacheLog: false,
    requestTimeout: 10000,
    userCache: {
      isEnabled: true,
      getter: null,
      setter: null,
      deleter: null,
    },
  });

  // Setup cache directory
  await enkaClient.cachedAssetsManager.cacheDirectorySetup();

  // Activate auto cache updater (check every hour)
  enkaClient.cachedAssetsManager.activateAutoCacheUpdater({
    instant: true,
    timeout: 60 * 60 * 1000, // 1 hour
    onUpdateStart: async () => {
      logger.info('[Enka] Updating Genshin data cache...');
    },
    onUpdateEnd: async () => {
      if (enkaClient) {
        enkaClient.cachedAssetsManager.refreshAllData();
      }
      logger.info('[Enka] Genshin data cache updated successfully');
    },
  });

  logger.info('[Enka] EnkaClient initialized successfully');
  return enkaClient;
}

// Get the Enka client (throws if not initialized)
export function getEnkaClient(): EnkaClient {
  if (!enkaClient) {
    throw new Error('EnkaClient not initialized. Call initializeEnka() first.');
  }
  return enkaClient;
}

// Fetch user profile by UID
export async function fetchUserProfile(uid: string | number): Promise<DetailedGenshinUser | null> {
  try {
    const client = getEnkaClient();
    const user = await client.fetchUser(uid);
    return user;
  } catch (error: any) {
    if (error.message?.includes('not found') || error.name === 'UserNotFoundError') {
      logger.warn(`[Enka] User with UID ${uid} not found`);
      return null;
    }
    logger.error(`[Enka] Error fetching user ${uid}:`, error);
    throw error;
  }
}

// Fetch basic user info (faster, less data)
export async function fetchUserBasicInfo(uid: string | number): Promise<GenshinUser | null> {
  try {
    const client = getEnkaClient();
    const user = await client.fetchCollapsedUser(uid);
    return user;
  } catch (error: any) {
    if (error.message?.includes('not found') || error.name === 'UserNotFoundError') {
      logger.warn(`[Enka] User with UID ${uid} not found`);
      return null;
    }
    logger.error(`[Enka] Error fetching basic user ${uid}:`, error);
    throw error;
  }
}

// Get all characters from cache (works offline)
export function getAllCharacters(): CharacterData[] {
  const client = getEnkaClient();
  return client.getAllCharacters();
}

// Get character by ID
export function getCharacterById(id: number, skillDepotId?: number): CharacterData | null {
  try {
    const client = getEnkaClient();
    return client.getCharacterById(id, skillDepotId);
  } catch (error) {
    logger.error(`[Enka] Error getting character by ID ${id}:`, error);
    return null;
  }
}

// Get character by name (fuzzy search)
export function getCharacterByName(name: string): CharacterData | null {
  const characters = getAllCharacters();
  const lowerName = name.toLowerCase();
  
  // Exact match first
  let match = characters.find(c => c.name.get('en')?.toLowerCase() === lowerName);
  if (match) return match;
  
  // Partial match
  match = characters.find(c => c.name.get('en')?.toLowerCase().includes(lowerName));
  if (match) return match;
  
  // Check alternative names
  const nameMap: Record<string, string> = {
    'hutao': 'hu tao',
    'shogun': 'raiden shogun',
    'raiden': 'raiden shogun',
    'kazuha': 'kaedehara kazuha',
    'ayaka': 'kamisato ayaka',
    'ayato': 'kamisato ayato',
    'yae': 'yae miko',
    'kokomi': 'sangonomiya kokomi',
    'itto': 'arataki itto',
    'sara': 'kujou sara',
    'heizou': 'shikanoin heizou',
    'shinobu': 'kuki shinobu',
    'nahida': 'nahida',
    'wanderer': 'wanderer',
    'scara': 'wanderer',
    'scaramouche': 'wanderer',
    'childe': 'tartaglia',
    'ajax': 'tartaglia',
  };
  
  const mappedName = nameMap[lowerName];
  if (mappedName) {
    match = characters.find(c => c.name.get('en')?.toLowerCase().includes(mappedName));
    if (match) return match;
  }
  
  return null;
}

// Get all weapons from cache
export function getAllWeapons(): WeaponData[] {
  const client = getEnkaClient();
  return client.getAllWeapons();
}

// Get weapon by ID
export function getWeaponById(id: number): WeaponData | null {
  try {
    const client = getEnkaClient();
    return client.getWeaponById(id);
  } catch (error) {
    logger.error(`[Enka] Error getting weapon by ID ${id}:`, error);
    return null;
  }
}

// Get weapon by name (fuzzy search)
export function getWeaponByName(name: string): WeaponData | null {
  const weapons = getAllWeapons();
  const lowerName = name.toLowerCase();
  
  // Exact match first
  let match = weapons.find(w => w.name.get('en')?.toLowerCase() === lowerName);
  if (match) return match;
  
  // Partial match
  match = weapons.find(w => w.name.get('en')?.toLowerCase().includes(lowerName));
  return match || null;
}

// Get all artifact sets from cache
export function getAllArtifactSets(): ArtifactSet[] {
  const client = getEnkaClient();
  return client.getAllArtifactSets();
}

// Get artifact set by ID
export function getArtifactSetById(id: number): ArtifactSet | null {
  try {
    const client = getEnkaClient();
    return client.getArtifactSetById(id);
  } catch (error) {
    logger.error(`[Enka] Error getting artifact set by ID ${id}:`, error);
    return null;
  }
}

// Get artifact set by name (fuzzy search)
export function getArtifactSetByName(name: string): ArtifactSet | null {
  const sets = getAllArtifactSets();
  const lowerName = name.toLowerCase();
  
  // Exact match first
  let match = sets.find(s => s.name.get('en')?.toLowerCase() === lowerName);
  if (match) return match;
  
  // Partial match
  match = sets.find(s => s.name.get('en')?.toLowerCase().includes(lowerName));
  return match || null;
}

// Format character stats for display
export function formatCharacterStats(character: Character): string[] {
  const stats = character.stats.statProperties;
  const lines: string[] = [];
  
  for (const stat of stats) {
    const name = stat.fightPropName.get('en') || 'Unknown';
    const value = stat.valueText;
    lines.push(`${name}: ${value}`);
  }
  
  return lines;
}

// Get crit value (CV) of artifacts
export function calculateCritValue(character: Character): number {
  let cv = 0;
  
  for (const artifact of character.artifacts) {
    // Main stat
    const mainStat = artifact.mainstat;
    if (mainStat.fightProp === 'FIGHT_PROP_CRITICAL') {
      cv += mainStat.value * 2;
    } else if (mainStat.fightProp === 'FIGHT_PROP_CRITICAL_HURT') {
      cv += mainStat.value;
    }
    
    // Substats
    for (const substat of artifact.substats.total) {
      if (substat.fightProp === 'FIGHT_PROP_CRITICAL') {
        cv += substat.value * 2;
      } else if (substat.fightProp === 'FIGHT_PROP_CRITICAL_HURT') {
        cv += substat.value;
      }
    }
  }
  
  return cv;
}

// Get artifact set bonuses for a character
export function getArtifactSetBonuses(character: Character): { set: ArtifactSet; count: number }[] {
  const setCounts = new Map<number, number>();
  
  for (const artifact of character.artifacts) {
    const setId = artifact.artifactData.set.id;
    setCounts.set(setId, (setCounts.get(setId) || 0) + 1);
  }
  
  const result: { set: ArtifactSet; count: number }[] = [];
  
  for (const [setId, count] of setCounts) {
    if (count >= 2) {
      const set = getArtifactSetById(setId);
      if (set) {
        result.push({ set, count });
      }
    }
  }
  
  return result.sort((a, b) => b.count - a.count);
}

// Get image URL for an asset
export function getImageUrl(iconName: string): string {
  return `https://enka.network/ui/${iconName}.png`;
}

// Close the client gracefully
export function closeEnka(): void {
  if (enkaClient) {
    enkaClient.close();
    enkaClient = null;
    logger.info('[Enka] EnkaClient closed');
  }
}

// Export types for use in other files
export type { DetailedGenshinUser, GenshinUser, CharacterData, WeaponData, ArtifactSet, Character };
