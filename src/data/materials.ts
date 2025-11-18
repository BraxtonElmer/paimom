// TypeScript interfaces for material data structures

export interface AscensionGem {
  name: string;
  type: 'ascension_gem';
  element: string;
  source: string[];
}

export interface BossMaterial {
  name: string;
  type: 'boss_material';
  source: string[];
  resinCost: number;
}

export interface WeeklyBossMaterial {
  name: string;
  type: 'weekly_boss';
  source: string[];
  resinCost: number;
}

export interface TalentBook {
  name: string;
  type: 'talent_book';
  domain: string;
  days: string[];
}

export type Material = AscensionGem | BossMaterial | WeeklyBossMaterial | TalentBook;

export interface MaterialsMap {
  [key: string]: Material;
}

export interface GemCounts {
  sliver: number;
  fragment: number;
  chunk: number;
  gemstone: number;
}

export interface CommonMaterialCounts {
  gray: number;
  green: number;
  blue: number;
}

export interface AscensionMaterials {
  mora: number;
  gems: GemCounts;
  bossMaterial: number;
  localSpecialty: number;
  commonMaterial: CommonMaterialCounts;
}

export interface TalentBookCounts {
  teaching: number;
  guide: number;
  philosophies: number;
}

export interface TalentMaterials {
  mora: number;
  books: TalentBookCounts;
  commonMaterial: CommonMaterialCounts;
  weeklyBoss: number;
  crown: number;
}

export const materials: MaterialsMap = {
  // Ascension Gems
  agnidus_agate: {
    name: 'Agnidus Agate',
    type: 'ascension_gem',
    element: 'Pyro',
    source: ['Pyro Hypostasis', 'Pyro Regisvine'],
  },
  varunada_lazurite: {
    name: 'Varunada Lazurite',
    type: 'ascension_gem',
    element: 'Hydro',
    source: ['Hydro Hypostasis', 'Rhodeia of Loch'],
  },
  vayuda_turquoise: {
    name: 'Vayuda Turquoise',
    type: 'ascension_gem',
    element: 'Anemo',
    source: ['Anemo Hypostasis', 'Maguu Kenki'],
  },
  vajrada_amethyst: {
    name: 'Vajrada Amethyst',
    type: 'ascension_gem',
    element: 'Electro',
    source: ['Electro Hypostasis', 'Thunder Manifestation'],
  },
  
  // Boss Materials
  everflame_seed: {
    name: 'Everflame Seed',
    type: 'boss_material',
    source: ['Pyro Regisvine'],
    resinCost: 40,
  },
  cleansing_heart: {
    name: 'Cleansing Heart',
    type: 'boss_material',
    source: ['Rhodeia of Loch'],
    resinCost: 40,
  },
  juvenile_jade: {
    name: 'Juvenile Jade',
    type: 'boss_material',
    source: ['Primo Geovishap'],
    resinCost: 40,
  },
  
  // Weekly Boss Materials
  dvalins_plume: {
    name: 'Dvalin\'s Plume',
    type: 'weekly_boss',
    source: ['Stormterror'],
    resinCost: 30,
  },
  shard_of_foul_legacy: {
    name: 'Shard of a Foul Legacy',
    type: 'weekly_boss',
    source: ['Tartaglia'],
    resinCost: 30,
  },
  
  // Talent Books
  resistance: {
    name: 'Teachings of Resistance',
    type: 'talent_book',
    domain: 'Forsaken Rift',
    days: ['Tuesday', 'Friday', 'Sunday'],
  },
  freedom: {
    name: 'Teachings of Freedom',
    type: 'talent_book',
    domain: 'Forsaken Rift',
    days: ['Monday', 'Thursday', 'Sunday'],
  },
  diligence: {
    name: 'Teachings of Diligence',
    type: 'talent_book',
    domain: 'Taishan Mansion',
    days: ['Tuesday', 'Friday', 'Sunday'],
  },
};

interface AscensionPhase {
  maxLevel: number;
  phase: number;
}

interface AscensionCost {
  mora: number;
  sliver?: number;
  fragment?: number;
  chunk?: number;
  gemstone?: number;
  bossMaterial?: number;
  localSpecialty?: number;
  gray?: number;
  green?: number;
  blue?: number;
}

interface TalentCost {
  mora: number;
  teaching?: number;
  guide?: number;
  philosophies?: number;
  gray?: number;
  green?: number;
  blue?: number;
  weeklyBoss?: number;
  crown?: number;
}

export const calculateAscensionMaterials = (
  currentLevel: number,
  targetLevel: number,
  _rarity?: number
): AscensionMaterials => {
  const materials: AscensionMaterials = {
    mora: 0,
    gems: { sliver: 0, fragment: 0, chunk: 0, gemstone: 0 },
    bossMaterial: 0,
    localSpecialty: 0,
    commonMaterial: { gray: 0, green: 0, blue: 0 },
  };
  
  // Ascension phase thresholds
  const phases: AscensionPhase[] = [
    { maxLevel: 20, phase: 1 },
    { maxLevel: 40, phase: 2 },
    { maxLevel: 50, phase: 3 },
    { maxLevel: 60, phase: 4 },
    { maxLevel: 70, phase: 5 },
    { maxLevel: 80, phase: 6 },
    { maxLevel: 90, phase: 6 }, // Max phase
  ];
  
  // Cost per ascension (5-star character)
  const ascensionCosts: Record<number, AscensionCost> = {
    1: { mora: 20000, sliver: 1, localSpecialty: 3, gray: 3 },
    2: { mora: 40000, fragment: 3, bossMaterial: 2, localSpecialty: 10, gray: 15 },
    3: { mora: 60000, fragment: 6, bossMaterial: 4, localSpecialty: 20, green: 12 },
    4: { mora: 80000, chunk: 3, bossMaterial: 8, localSpecialty: 30, green: 18 },
    5: { mora: 100000, chunk: 6, bossMaterial: 12, localSpecialty: 45, blue: 12 },
    6: { mora: 120000, gemstone: 6, bossMaterial: 20, localSpecialty: 60, blue: 24 },
  };
  
  const currentPhase = phases.find(p => currentLevel <= p.maxLevel)?.phase || 0;
  const targetPhase = phases.find(p => targetLevel <= p.maxLevel)?.phase || 0;
  
  for (let phase = currentPhase + 1; phase <= targetPhase; phase++) {
    const cost = ascensionCosts[phase];
    if (cost) {
      materials.mora += cost.mora;
      if (cost.sliver) materials.gems.sliver += cost.sliver;
      if (cost.fragment) materials.gems.fragment += cost.fragment;
      if (cost.chunk) materials.gems.chunk += cost.chunk;
      if (cost.gemstone) materials.gems.gemstone += cost.gemstone;
      if (cost.bossMaterial) materials.bossMaterial += cost.bossMaterial;
      if (cost.localSpecialty) materials.localSpecialty += cost.localSpecialty;
      if (cost.gray) materials.commonMaterial.gray += cost.gray;
      if (cost.green) materials.commonMaterial.green += cost.green;
      if (cost.blue) materials.commonMaterial.blue += cost.blue;
    }
  }
  
  return materials;
};

export const calculateTalentMaterials = (
  currentLevel: number,
  targetLevel: number
): TalentMaterials => {
  const materials: TalentMaterials = {
    mora: 0,
    books: { teaching: 0, guide: 0, philosophies: 0 },
    commonMaterial: { gray: 0, green: 0, blue: 0 },
    weeklyBoss: 0,
    crown: 0,
  };
  
  const talentCosts: Record<number, TalentCost> = {
    2: { mora: 12500, teaching: 3, gray: 6 },
    3: { mora: 17500, guide: 2, green: 3 },
    4: { mora: 25000, guide: 4, green: 4 },
    5: { mora: 30000, guide: 6, green: 6 },
    6: { mora: 37500, guide: 9, green: 9 },
    7: { mora: 120000, philosophies: 4, blue: 4, weeklyBoss: 1 },
    8: { mora: 260000, philosophies: 6, blue: 6, weeklyBoss: 1 },
    9: { mora: 450000, philosophies: 12, blue: 9, weeklyBoss: 2 },
    10: { mora: 700000, philosophies: 16, blue: 12, weeklyBoss: 2, crown: 1 },
  };
  
  for (let level = currentLevel + 1; level <= targetLevel; level++) {
    const cost = talentCosts[level];
    if (cost) {
      materials.mora += cost.mora;
      if (cost.teaching) materials.books.teaching += cost.teaching;
      if (cost.guide) materials.books.guide += cost.guide;
      if (cost.philosophies) materials.books.philosophies += cost.philosophies;
      if (cost.gray) materials.commonMaterial.gray += cost.gray;
      if (cost.green) materials.commonMaterial.green += cost.green;
      if (cost.blue) materials.commonMaterial.blue += cost.blue;
      if (cost.weeklyBoss) materials.weeklyBoss += cost.weeklyBoss;
      if (cost.crown) materials.crown += cost.crown;
    }
  }
  
  return materials;
};
