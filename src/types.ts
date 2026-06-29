export interface MemoryItem {
  id: string;
  title: string;
  type: 'photo' | 'video';
  url: string;
  thumbnailUrl: string;
  chapter: string; // e.g., "Summer Journey", "Family Kingdom", "Ancient Adventures", "The Golden Years"
  date: string; // "YYYY-MM-DD"
  description: string;
  tags: string[];
  constellationPos: { x: number; y: number }; // coords for the Constellation view (0-100 range)
}

export interface FamilyMember {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
  eyesAngle?: number; // active cursor coordinate state
  privateVault: boolean;
  permissionLevel: 'Sovereign' | 'Ranger' | 'Archivist' | 'Spellweaver' | 'Knight';
}

export interface Chapter {
  id: string;
  name: string;
  description: string;
  memoryCount: number;
  coverUrl: string;
  sealSymbol: string; // e.g., "rune-fire", "shield", etc.
}

export type ThemePreset = 'Forest Night' | 'Golden Kingdom' | 'Moonlit Archive' | 'Ancient Library';

export interface ThemeColors {
  primaryBg: string; // deep slate darks
  panelBg: string; // card panels
  accentGold: string; // bright gold highlights
  accentMuted: string; // pale text or borders
  textMain: string;
  textMuted: string;
  glassBg: string;
}
