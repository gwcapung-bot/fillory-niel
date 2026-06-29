import { MemoryItem, FamilyMember, Chapter, ThemePreset, ThemeColors } from './types';

export const THEME_COLORS: Record<ThemePreset, ThemeColors> = {
  'Forest Night': {
    primaryBg: '#0B0C0A',
    panelBg: '#111512',
    accentGold: '#C7A86D',
    accentMuted: '#1A221C',
    textMain: '#E9DFC8',
    textMuted: '#9E9E8E',
    glassBg: 'rgba(17, 21, 18, 0.75)',
  },
  'Golden Kingdom': {
    primaryBg: '#1A160E',
    panelBg: '#2C2314',
    accentGold: '#D7BB7A',
    accentMuted: '#4A3B22',
    textMain: '#F7EDD5',
    textMuted: '#BCAB8D',
    glassBg: 'rgba(44, 35, 20, 0.75)',
  },
  'Moonlit Archive': {
    primaryBg: '#0D1117',
    panelBg: '#161B22',
    accentGold: '#8AB4F8',
    accentMuted: '#30363D',
    textMain: '#C9D1D9',
    textMuted: '#8B949E',
    glassBg: 'rgba(22, 27, 34, 0.75)',
  },
  'Ancient Library': {
    primaryBg: '#18110D',
    panelBg: '#271B14',
    accentGold: '#E6A055',
    accentMuted: '#463226',
    textMain: '#F2D3C1',
    textMuted: '#AF907E',
    glassBg: 'rgba(39, 27, 20, 0.75)',
  },
};

export const INITIAL_CHAPTERS: Chapter[] = [
  {
    id: 'chap-1',
    name: 'Summer Journey',
    description: 'Cursed nocturnal voyages across the bleeding shores of Fillory, charting forgotten catacombs and haunted dunes.',
    memoryCount: 0,
    coverUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=800&q=80',
    sealSymbol: '🦇',
  },
  {
    id: 'chap-2',
    name: 'Family Kingdom',
    description: 'Dark ritualistic coronations, royal banquets, and gothic bloodline gatherings inside the desecrated high chambers of Castle Fillory Niel.',
    memoryCount: 0,
    coverUrl: 'https://images.unsplash.com/photo-1519074002996-a69e7ac46a42?auto=format&fit=crop&w=800&q=80',
    sealSymbol: '🩸',
  },
  {
    id: 'chap-3',
    name: 'Ancient Adventures',
    description: 'Shadowy expeditions into the Blood Cedar Forest and dangerous encounters with wild gothic entities and ancestral vampire lords.',
    memoryCount: 0,
    coverUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80',
    sealSymbol: '🕸️',
  },
  {
    id: 'chap-4',
    name: 'The Golden Years',
    description: 'Quiet, forbidden decades of blood alchemy, candlelit spellcraft, and dark sacraments in the castle’s underground chambers.',
    memoryCount: 0,
    coverUrl: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?auto=format&fit=crop&w=800&q=80',
    sealSymbol: '🍷',
  },
];

export const INITIAL_MEMORIES: MemoryItem[] = [];

export const INITIAL_FAMILY_MEMBERS: FamilyMember[] = [
  {
    id: 'char-1',
    name: 'Keeper gwcapung',
    role: 'Grand Scribe of the Sanguine Library',
    avatarUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=400&q=80',
    privateVault: false,
    permissionLevel: 'Sovereign',
  },
  {
    id: 'char-2',
    name: 'Margo the Bold',
    role: 'High Empress of the Crimson Throne',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    privateVault: true,
    permissionLevel: 'Sovereign',
  },
  {
    id: 'char-3',
    name: 'Eliot Waugh',
    role: 'Vampire Lord & Grand Necromancer',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    privateVault: false,
    permissionLevel: 'Spellweaver',
  },
  {
    id: 'char-4',
    name: 'Penny Adiyodi',
    role: 'Nocturnal Ranger & Crypt Stalker',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
    privateVault: true,
    permissionLevel: 'Ranger',
  },
  {
    id: 'char-5',
    name: 'Alice Quinn',
    role: 'Mistress of Forbidden Blood Alchemy',
    avatarUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&q=80',
    privateVault: false,
    permissionLevel: 'Archivist',
  },
];
