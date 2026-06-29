import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Shield, Key, Eye, User, Settings2, Bell, Sparkles, Sliders, Upload, Save, CheckCircle2 } from 'lucide-react';
import { ThemePreset } from '../types';
import { KeeperProfile } from '../lib/db';

interface SettingsChamberProps {
  currentTheme: ThemePreset;
  onThemeChange: (theme: ThemePreset) => void;
  keeperProfile: KeeperProfile;
  onUpdateKeeperProfile: (profile: KeeperProfile) => Promise<void>;
}

export default function SettingsChamber({
  currentTheme,
  onThemeChange,
  keeperProfile,
  onUpdateKeeperProfile,
}: SettingsChamberProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'theme' | 'oracle'>('profile');

  // Local state for profile inputs
  const [keeperName, setKeeperName] = useState(keeperProfile.name);
  const [keeperEmail, setKeeperEmail] = useState(keeperProfile.email);
  const [councilTitle, setCouncilTitle] = useState(keeperProfile.councilTitle);
  const [realmDominion, setRealmDominion] = useState(keeperProfile.realmDominion);
  const [avatarUrl, setAvatarUrl] = useState(keeperProfile.avatarUrl || 'https://picsum.photos/seed/keeper_niel/400/400');
  const [avatarFile, setAvatarFile] = useState<Blob | undefined>(keeperProfile.avatarFile);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync with prop when it loads from IndexedDB
  useEffect(() => {
    setKeeperName(keeperProfile.name);
    setKeeperEmail(keeperProfile.email);
    setCouncilTitle(keeperProfile.councilTitle);
    setRealmDominion(keeperProfile.realmDominion);
    if (keeperProfile.avatarUrl) {
      setAvatarUrl(keeperProfile.avatarUrl);
    }
    setAvatarFile(keeperProfile.avatarFile);
  }, [keeperProfile]);

  // Handle local avatar upload
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarFile(file);
    const objectUrl = URL.createObjectURL(file);
    setAvatarUrl(objectUrl);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await onUpdateKeeperProfile({
        id: 'active-keeper',
        name: keeperName,
        email: keeperEmail,
        councilTitle: councilTitle,
        realmDominion: realmDominion,
        avatarFile: avatarFile,
        avatarUrl: avatarUrl,
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save credentials:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Themes list
  const themePresets: { name: ThemePreset; description: string; colors: string[] }[] = [
    {
      name: 'Forest Night',
      description: 'Ancient, shadowy, moonlit cedar greens and weathered gold highlights.',
      colors: ['bg-[#0B0C0A]', 'bg-[#111512]', 'bg-[#C7A86D]'],
    },
    {
      name: 'Golden Kingdom',
      description: 'Regal, warm, grand stone castle columns and glowing amber crown light.',
      colors: ['bg-[#1A160E]', 'bg-[#2C2314]', 'bg-[#D7BB7A]'],
    },
    {
      name: 'Moonlit Archive',
      description: 'Ethereal cosmic blue slates, silver stardust beams, and cobalt binders.',
      colors: ['bg-[#0D1117]', 'bg-[#161B22]', 'bg-[#8AB4F8]'],
    },
    {
      name: 'Ancient Library',
      description: 'Cozy, mahogany tables, aged sepia parchment, and burning rust embers.',
      colors: ['bg-[#18110D]', 'bg-[#271B14]', 'bg-[#E6A055]'],
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 relative z-10 flex flex-col md:flex-row gap-8 items-start" id="settings-chamber">
      
      {/* Left Sidebar Layout Navigation */}
      <div className="w-full md:w-1/4 bg-[#111512] border border-[#C7A86D]/35 rounded-lg p-4 space-y-2 shadow-[0_4px_16px_rgba(0,0,0,0.4)]">
        <div className="p-3 border-b border-[#C7A86D]/15 pb-4 mb-4 text-center space-y-1">
          <Settings2 className="w-6 h-6 text-[#C7A86D] mx-auto animate-spin" style={{ animationDuration: '15s' }} />
          <h3 className="font-serif text-lg text-[#E9DFC8] font-bold">THE ARCHIVIST’S CHAMBER</h3>
          <p className="text-[10px] text-[#9E9E8E] font-mono tracking-widest uppercase">System Dials</p>
        </div>

        {/* Tab 1: Profile */}
        <button
          onClick={() => setActiveTab('profile')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded transition-all text-xs uppercase tracking-wider font-sans text-left cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-[#C7A86D]/10 border-l-2 border-[#C7A86D] text-[#E9DFC8] font-bold'
              : 'text-[#9E9E8E] hover:bg-[#111512] hover:text-[#E9DFC8]'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Archivist Profile</span>
        </button>

        {/* Tab 2: Security */}
        <button
          onClick={() => setActiveTab('security')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded transition-all text-xs uppercase tracking-wider font-sans text-left cursor-pointer ${
            activeTab === 'security'
              ? 'bg-[#C7A86D]/10 border-l-2 border-[#C7A86D] text-[#E9DFC8] font-bold'
              : 'text-[#9E9E8E] hover:bg-[#111512] hover:text-[#E9DFC8]'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Secret Keys & Seals</span>
        </button>

        {/* Tab 3: Themes */}
        <button
          onClick={() => setActiveTab('theme')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded transition-all text-xs uppercase tracking-wider font-sans text-left cursor-pointer ${
            activeTab === 'theme'
              ? 'bg-[#C7A86D]/10 border-l-2 border-[#C7A86D] text-[#E9DFC8] font-bold'
              : 'text-[#9E9E8E] hover:bg-[#111512] hover:text-[#E9DFC8]'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Thematic Presets</span>
        </button>

        {/* Tab 4: Oracle Notifications */}
        <button
          onClick={() => setActiveTab('oracle')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded transition-all text-xs uppercase tracking-wider font-sans text-left cursor-pointer ${
            activeTab === 'oracle'
              ? 'bg-[#C7A86D]/10 border-l-2 border-[#C7A86D] text-[#E9DFC8] font-bold'
              : 'text-[#9E9E8E] hover:bg-[#111512] hover:text-[#E9DFC8]'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Oracle Prophecies</span>
        </button>
      </div>

      {/* Right Content Panel Display */}
      <div className="flex-1 bg-[#111512] border border-[#C7A86D]/35 rounded-lg p-6 md:p-8 relative overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        
        {/* Background watermark graphics */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle_at_top_right,rgba(199,168,109,0.03)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute inset-1 border border-[#C7A86D]/5 pointer-events-none rounded" />

        {/* TAB 1: PROFILE */}
        {activeTab === 'profile' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="border-b border-[#C7A86D]/15 pb-4">
              <h4 className="font-serif text-xl text-[#E9DFC8] font-bold">Keeper Credentials (Ubah Profil)</h4>
              <p className="text-xs text-[#9E9E8E]">Sovereign ledger parameters for the active seat in Fillory Niel.</p>
            </div>

            {/* Profile Change Success Alert */}
            {saveSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center space-x-2 p-3 bg-emerald-950/40 border border-emerald-900/40 rounded text-emerald-400 text-xs font-sans"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Kredensial Penjaga berhasil diperbarui dalam gulungan IndexedDB!</span>
              </motion.div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-5 relative z-10">
              
              {/* Avatar Uploader UI */}
              <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start bg-[#0B0C0A]/40 p-4 border border-[#C7A86D]/10 rounded-md">
                <div className="relative w-20 h-20 rounded-full border border-[#C7A86D] overflow-hidden shadow group">
                  <img
                    src={avatarUrl}
                    alt="Regal Archivist Avatar"
                    className="w-full h-full object-cover transition-opacity group-hover:opacity-60"
                    referrerPolicy="no-referrer"
                  />
                  <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                    <Upload className="w-4 h-4 text-[#C7A86D]" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="space-y-1.5 flex-1 text-center sm:text-left">
                  <div>
                    <span className="px-2.5 py-0.5 rounded border border-[#C7A86D]/20 bg-[#C7A86D]/5 text-[#C7A86D] text-[9px] font-mono tracking-widest uppercase">
                      SOVEREIGN ADMINISTRATOR
                    </span>
                    <h3 className="font-serif text-lg text-[#E9DFC8] font-bold mt-1">{keeperName || 'Archivist gwcapung'}</h3>
                    <p className="text-xs text-[#9E9E8E] font-mono">{keeperEmail || 'gwcapung@gmail.com'}</p>
                  </div>
                  <label className="inline-block px-3 py-1 border border-[#C7A86D]/30 hover:border-[#C7A86D] text-[#C7A86D] text-[9px] uppercase font-sans tracking-wider rounded cursor-pointer transition-colors bg-[#050605]/50">
                    Ganti Foto Avatar
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Form inputs */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-[#C7A86D] font-mono tracking-wider block">KEEPER NAME</label>
                    <input
                      type="text"
                      value={keeperName}
                      onChange={(e) => setKeeperName(e.target.value)}
                      required
                      className="w-full bg-[#0B0C0A]/60 border border-[#C7A86D]/25 rounded px-3 py-2 text-xs text-[#E9DFC8] focus:outline-none focus:border-[#C7A86D]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-[#C7A86D] font-mono tracking-wider block">KEEPER EMAIL</label>
                    <input
                      type="email"
                      value={keeperEmail}
                      onChange={(e) => setKeeperEmail(e.target.value)}
                      required
                      className="w-full bg-[#0B0C0A]/60 border border-[#C7A86D]/25 rounded px-3 py-2 text-xs text-[#E9DFC8] focus:outline-none focus:border-[#C7A86D]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-[#C7A86D] font-mono tracking-wider block">COUNCIL SEAT TITLE</label>
                    <input
                      type="text"
                      value={councilTitle}
                      onChange={(e) => setCouncilTitle(e.target.value)}
                      required
                      className="w-full bg-[#0B0C0A]/60 border border-[#C7A86D]/25 rounded px-3 py-2 text-xs text-[#E9DFC8] focus:outline-none focus:border-[#C7A86D]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-[#C7A86D] font-mono tracking-wider block">REALM DOMINION</label>
                    <input
                      type="text"
                      value={realmDominion}
                      onChange={(e) => setRealmDominion(e.target.value)}
                      required
                      className="w-full bg-[#0B0C0A]/60 border border-[#C7A86D]/25 rounded px-3 py-2 text-xs text-[#E9DFC8] focus:outline-none focus:border-[#C7A86D]"
                    />
                  </div>
                </div>

                {/* Submit button */}
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-gradient-to-r from-[#D7BB7A] to-[#C7A86D] hover:scale-105 text-[#111512] rounded-full text-xs font-bold font-sans uppercase tracking-widest cursor-pointer flex items-center space-x-1.5 transition-transform"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSaving ? 'Menyimpan...' : 'Simpan Kredensial'}</span>
                  </button>
                </div>

                <div className="p-4 bg-[#C7A86D]/5 rounded border border-[#C7A86D]/20 space-y-1">
                  <div className="flex items-center space-x-2 text-[#C7A86D]">
                    <Shield className="w-4 h-4" />
                    <span className="font-serif text-xs font-bold uppercase">Sovereign Protection Active</span>
                  </div>
                  <p className="text-xs text-[#9E9E8E] leading-relaxed">
                    Your archive records are stored securely behind dual-layered magic wards. No unaligned mages or travelers can read or write to these scrolls without authorization.
                  </p>
                </div>
              </div>
            </form>
          </motion.div>
        )}

        {/* TAB 2: SECURITY */}
        {activeTab === 'security' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="border-b border-[#C7A86D]/15 pb-4">
              <h4 className="font-serif text-xl text-[#E9DFC8] font-bold">Arcane Wards & Passkey Seals</h4>
              <p className="text-xs text-[#9E9E8E]">Encrypt and defend your memories against external scrying mirrors.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <h5 className="text-xs text-[#E9DFC8] font-bold font-serif uppercase tracking-wider">Secret Unsealing Keyphrase</h5>
                <p className="text-[11px] text-[#9E9E8E]">The vocal password spoken to dissolve the golden doors of your archive.</p>
                <div className="relative">
                  <input
                    type="password"
                    value="the_clockwork_beast_shall_not_scry"
                    disabled
                    className="w-full bg-[#0B0C0A]/60 border border-[#C7A86D]/25 rounded pl-3 pr-10 py-2.5 text-xs text-[#E9DFC8] tracking-widest"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#C7A86D]/60 hover:text-[#C7A86D] cursor-pointer">
                    <Eye className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <h5 className="text-xs text-[#E9DFC8] font-bold font-serif uppercase tracking-wider">Scrying Eye Mirror Defense</h5>
                <div className="flex items-center justify-between p-3.5 bg-[#0B0C0A]/40 border border-[#C7A86D]/10 rounded">
                  <div className="space-y-0.5">
                    <span className="text-xs text-[#E9DFC8] font-serif">Block Spellcaster Decryption</span>
                    <p className="text-[10px] text-[#9E9E8E]">Immediately seals all private sub-vaults if unauthorized scrying is detected.</p>
                  </div>
                  <div className="w-11 h-6 rounded-full bg-[#C7A86D] p-0.5 flex justify-end cursor-pointer">
                    <div className="w-5 h-5 rounded-full bg-[#111512]" />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded border border-red-900/30 bg-red-950/10 space-y-2">
                <h5 className="text-xs text-red-400 font-bold uppercase font-sans">Incinerate Archive Wards (Danger Zone)</h5>
                <p className="text-xs text-red-300">
                  Instantly purges all stardust records, golden files, and floating chapters from Castle Fillory Niel’s crystals. This action cannot be reversed, even by the High Scribes.
                </p>
                <button className="px-4 py-2 bg-red-950/40 hover:bg-red-900/50 text-red-400 border border-red-900/35 rounded text-[9px] tracking-wider uppercase font-sans cursor-pointer">
                  Execute Vault Incineration
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 3: THEMES */}
        {activeTab === 'theme' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="border-b border-[#C7A86D]/15 pb-4">
              <h4 className="font-serif text-xl text-[#E9DFC8] font-bold">Thematic Ambiance Presets</h4>
              <p className="text-xs text-[#9E9E8E]">Swap the global visual energy, color spectrum, and layout light styles of your Vault.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {themePresets.map((tp) => {
                const isSelected = currentTheme === tp.name;

                return (
                  <div
                    key={tp.name}
                    onClick={() => onThemeChange(tp.name)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all space-y-3 flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#C7A86D] bg-[#2C2314]/50 shadow-[0_0_15px_rgba(199,168,109,0.15)]'
                        : 'border-[#C7A86D]/20 bg-[#0B0C0A]/40 hover:border-[#C7A86D]/50'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="font-serif text-sm font-bold text-[#E9DFC8]">{tp.name}</span>
                        {isSelected && (
                          <span className="text-[8px] font-mono tracking-wider bg-[#C7A86D]/20 text-[#C7A86D] px-2 py-0.5 rounded border border-[#C7A86D]/30">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#9E9E8E] leading-relaxed">{tp.description}</p>
                    </div>

                    {/* Miniature swatch blocks */}
                    <div className="flex items-center space-x-1.5 pt-2">
                      {tp.colors.map((col, idx) => (
                        <div key={idx} className={`w-4 h-4 rounded-full border border-[#C7A86D]/25 ${col}`} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* TAB 4: ORACLE NOTIFICATIONS */}
        {activeTab === 'oracle' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="border-b border-[#C7A86D]/15 pb-4">
              <h4 className="font-serif text-xl text-[#E9DFC8] font-bold">Raven Messenger Couriers (Notifications)</h4>
              <p className="text-xs text-[#9E9E8E]">Receive magical prophecy reminders and warnings from Castle Fillory Niel’s watchtowers.</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 bg-[#0B0C0A]/40 border border-[#C7A86D]/10 rounded">
                <div className="space-y-0.5">
                  <span className="text-xs text-[#E9DFC8] font-serif">Raven Mail on Storage Limit</span>
                  <p className="text-[10px] text-[#9E9E8E]">Dispatch a messenger bird immediately when the storage crystal is 90% full.</p>
                </div>
                <div className="w-11 h-6 rounded-full bg-[#C7A86D] p-0.5 flex justify-end cursor-pointer">
                  <div className="w-5 h-5 rounded-full bg-[#111512]" />
                </div>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-[#0B0C0A]/40 border border-[#C7A86D]/10 rounded">
                <div className="space-y-0.5">
                  <span className="text-xs text-[#E9DFC8] font-serif">Harp Chimes on New Uploads</span>
                  <p className="text-[10px] text-[#9E9E8E]">Play a faint harp-glissando audio chime when other Council mages drop new scrolls.</p>
                </div>
                <div className="w-11 h-6 rounded-full bg-[#C7A86D]/20 p-0.5 flex justify-start cursor-pointer">
                  <div className="w-5 h-5 rounded-full bg-[#111512]" />
                </div>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-[#0B0C0A]/40 border border-[#C7A86D]/10 rounded">
                <div className="space-y-0.5">
                  <span className="text-xs text-[#E9DFC8] font-serif">Full Moon Prophecies</span>
                  <p className="text-[10px] text-[#9E9E8E]">Receive reminders during full moon phases to clean out duplicate archive spells.</p>
                </div>
                <div className="w-11 h-6 rounded-full bg-[#C7A86D] p-0.5 flex justify-end cursor-pointer">
                  <div className="w-5 h-5 rounded-full bg-[#111512]" />
                </div>
              </div>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
