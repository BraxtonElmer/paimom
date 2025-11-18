// TypeScript interfaces for domain data structures

export interface DomainSchedule {
  Monday?: string[];
  Tuesday?: string[];
  Wednesday?: string[];
  Thursday?: string[];
  Friday?: string[];
  Saturday?: string[];
  Sunday?: string[];
}

export interface TalentDomain {
  name: string;
  type: 'talent';
  location: string;
  books: string[];
  schedule: DomainSchedule;
  resinCost: number;
}

export interface WeaponDomain {
  name: string;
  type: 'weapon';
  location: string;
  materials: string[];
  schedule: DomainSchedule;
  resinCost: number;
}

export interface ArtifactDomain {
  name: string;
  type: 'artifact';
  location: string;
  sets: string[];
  resinCost: number;
  minLevel: number;
}

export type Domain = TalentDomain | WeaponDomain | ArtifactDomain;

export interface DomainsMap {
  [key: string]: Domain;
}

export type DomainWithAvailability = Domain & {
  available?: string[];
}

export const domains: DomainsMap = {
  // Talent Domains
  forsaken_rift: {
    name: 'Forsaken Rift',
    type: 'talent',
    location: 'Wolvendom, Mondstadt',
    books: ['Resistance', 'Freedom', 'Ballad'],
    schedule: {
      Monday: ['Resistance', 'Freedom'],
      Tuesday: ['Resistance'],
      Wednesday: ['Freedom', 'Ballad'],
      Thursday: ['Freedom'],
      Friday: ['Ballad', 'Resistance'],
      Saturday: ['Ballad'],
      Sunday: ['All'],
    },
    resinCost: 20,
  },
  taishan_mansion: {
    name: 'Taishan Mansion',
    type: 'talent',
    location: 'Jueyun Karst, Liyue',
    books: ['Diligence', 'Prosperity', 'Gold'],
    schedule: {
      Monday: ['Prosperity', 'Diligence'],
      Tuesday: ['Prosperity'],
      Wednesday: ['Diligence', 'Gold'],
      Thursday: ['Diligence'],
      Friday: ['Gold', 'Prosperity'],
      Saturday: ['Gold'],
      Sunday: ['All'],
    },
    resinCost: 20,
  },
  violet_court: {
    name: 'Violet Court',
    type: 'talent',
    location: 'Inazuma City, Inazuma',
    books: ['Transience', 'Elegance', 'Light'],
    schedule: {
      Monday: ['Transience', 'Elegance'],
      Tuesday: ['Transience'],
      Wednesday: ['Elegance', 'Light'],
      Thursday: ['Elegance'],
      Friday: ['Light', 'Transience'],
      Saturday: ['Light'],
      Sunday: ['All'],
    },
    resinCost: 20,
  },
  steeple_of_ignorance: {
    name: 'Steeple of Ignorance',
    type: 'talent',
    location: 'Sumeru City, Sumeru',
    books: ['Admonition', 'Ingenuity', 'Praxis'],
    schedule: {
      Monday: ['Admonition', 'Ingenuity'],
      Tuesday: ['Admonition'],
      Wednesday: ['Ingenuity', 'Praxis'],
      Thursday: ['Ingenuity'],
      Friday: ['Praxis', 'Admonition'],
      Saturday: ['Praxis'],
      Sunday: ['All'],
    },
    resinCost: 20,
  },
  // Weapon Domains
  cecilia_garden: {
    name: 'Cecilia Garden',
    type: 'weapon',
    location: 'Wolvendom, Mondstadt',
    materials: ['Decarabian', 'Boreal Wolf', 'Dandelion Gladiator'],
    schedule: {
      Monday: ['Decarabian', 'Boreal Wolf'],
      Tuesday: ['Decarabian'],
      Wednesday: ['Boreal Wolf', 'Dandelion Gladiator'],
      Thursday: ['Boreal Wolf'],
      Friday: ['Dandelion Gladiator', 'Decarabian'],
      Saturday: ['Dandelion Gladiator'],
      Sunday: ['All'],
    },
    resinCost: 20,
  },
  // Artifact Domains
  valley_of_remembrance: {
    name: 'Valley of Remembrance',
    type: 'artifact',
    location: 'Dunyu Ruins, Liyue',
    sets: ['Viridescent Venerer', 'Maiden Beloved'],
    resinCost: 20,
    minLevel: 59,
  },
  domain_of_guyun: {
    name: 'Domain of Guyun',
    type: 'artifact',
    location: 'Guyun Stone Forest, Liyue',
    sets: ['Archaic Petra', 'Retracing Bolide'],
    resinCost: 20,
    minLevel: 59,
  },
  peak_of_vindagnyr: {
    name: 'Peak of Vindagnyr',
    type: 'artifact',
    location: 'Dragonspine',
    sets: ['Blizzard Strayer', 'Heart of Depth'],
    resinCost: 20,
    minLevel: 59,
  },
  momiji_dyed_court: {
    name: 'Momiji-Dyed Court',
    type: 'artifact',
    location: 'Yashiori Island, Inazuma',
    sets: ['Emblem of Severed Fate', 'Shimenawa\'s Reminiscence'],
    resinCost: 20,
    minLevel: 59,
  },
};

export const getDomainsByDay = (day: string): Record<string, DomainWithAvailability> => {
  const available: Record<string, DomainWithAvailability> = {};
  
  for (const [key, domain] of Object.entries(domains)) {
    if ('schedule' in domain && domain.schedule && domain.schedule[day as keyof DomainSchedule]) {
      available[key] = {
        ...domain,
        available: domain.schedule[day as keyof DomainSchedule],
      } as DomainWithAvailability;
    } else if (!('schedule' in domain)) {
      // Artifact domains are available every day
      available[key] = { ...domain } as DomainWithAvailability;
    }
  }
  
  return available;
};

export const getDomainByName = (name: string): Domain | null => {
  const key = name.toLowerCase().replace(/\s+/g, '_');
  return domains[key] || null;
};

export const getTalentDomain = (bookType: string): TalentDomain | null => {
  for (const domain of Object.values(domains)) {
    if (domain.type === 'talent' && 'books' in domain && domain.books.includes(bookType)) {
      return domain as TalentDomain;
    }
  }
  return null;
};
