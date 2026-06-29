import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Lock, Eye, Users, ShieldCheck, Heart, Trash2, Edit2, Plus, X, Upload, Save } from 'lucide-react';
import { FamilyMember } from '../types';

interface LocalGroupMember {
  id: string;
  name: string;
  role: string;
  avatarFile?: Blob;
  avatarUrl?: string;
  privateVault: boolean;
  permissionLevel: 'Sovereign' | 'Ranger' | 'Archivist' | 'Spellweaver' | 'Knight';
}

interface RoyalCircleProps {
  members: FamilyMember[];
  onAddMember: (member: LocalGroupMember) => Promise<void>;
  onDeleteMember: (id: string) => Promise<void>;
  onEditMember: (member: LocalGroupMember) => Promise<void>;
}

export default function RoyalCircle({
  members,
  onAddMember,
  onDeleteMember,
  onEditMember,
}: RoyalCircleProps) {
  const [activeMember, setActiveMember] = useState<FamilyMember | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Form states for Add/Edit
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formPermission, setFormPermission] = useState<'Sovereign' | 'Ranger' | 'Archivist' | 'Spellweaver' | 'Knight'>('Knight');
  const [formPrivate, setFormPrivate] = useState(false);
  const [formAvatarUrl, setFormAvatarUrl] = useState('');
  const [formAvatarFile, setFormAvatarFile] = useState<Blob | undefined>(undefined);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Set default active member
  useEffect(() => {
    if (members.length > 0 && !activeMember) {
      setActiveMember(members[0]);
    }
  }, [members, activeMember]);

  // Track global mouse position for pupil tracking and 3D parallax tilt
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Helper to compute pupil translation offsets based on cursor angle
  const getPupilOffset = (portraitCardId: string) => {
    const cardEl = document.getElementById(`portrait-card-${portraitCardId}`);
    if (!cardEl) return { x: 0, y: 0 };

    const rect = cardEl.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = mousePos.x - centerX;
    const dy = mousePos.y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) return { x: 0, y: 0 };

    const maxOffset = 4.5;
    const factor = Math.min(distance / 250, 1); // sensitive range
    const offset = factor * maxOffset;

    return {
      x: (dx / distance) * offset,
      y: (dy / distance) * offset,
    };
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormAvatarFile(file);
    const objectUrl = URL.createObjectURL(file);
    setFormAvatarUrl(objectUrl);
  };

  const resetForm = () => {
    setFormName('');
    setFormRole('');
    setFormPermission('Knight');
    setFormPrivate(false);
    setFormAvatarUrl('');
    setFormAvatarFile(undefined);
    setEditingId(null);
  };

  const handleCreateMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formRole) return;

    const defaultAvatars = [
      'https://picsum.photos/seed/goth_mage/400/400',
      'https://picsum.photos/seed/vamp_knight/400/400',
      'https://picsum.photos/seed/shadow_beast/400/400',
    ];
    const finalAvatarUrl = formAvatarUrl || defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)];

    await onAddMember({
      id: `custom-char-${Date.now()}`,
      name: formName,
      role: formRole,
      permissionLevel: formPermission,
      privateVault: formPrivate,
      avatarFile: formAvatarFile,
      avatarUrl: finalAvatarUrl,
    });

    setIsAddOpen(false);
    resetForm();
  };

  const handleOpenEditModal = (member: FamilyMember) => {
    setEditingId(member.id);
    setFormName(member.name);
    setFormRole(member.role);
    setFormPermission(member.permissionLevel);
    setFormPrivate(member.privateVault);
    setFormAvatarUrl(member.avatarUrl);
    setFormAvatarFile(undefined);
    setIsEditOpen(true);
  };

  const handleUpdateMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !formName || !formRole) return;

    await onEditMember({
      id: editingId,
      name: formName,
      role: formRole,
      permissionLevel: formPermission,
      privateVault: formPrivate,
      avatarFile: formAvatarFile,
      avatarUrl: formAvatarUrl,
    });

    setIsEditOpen(false);
    // Sync current active view if changed
    if (activeMember?.id === editingId) {
      setActiveMember(prev => prev ? {
        ...prev,
        name: formName,
        role: formRole,
        permissionLevel: formPermission,
        privateVault: formPrivate,
        avatarUrl: formAvatarUrl || prev.avatarUrl,
      } : null);
    }
    resetForm();
  };

  const handleDeleteMemberClick = async (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin mematikan berkas jiwa dewan ${name}?`)) {
      await onDeleteMember(id);
      if (activeMember?.id === id) {
        setActiveMember(members.find(m => m.id !== id) || null);
      }
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-8 relative z-10" id="royal-circle">
      
      {/* Header Info */}
      <div className="text-center space-y-2 border-b border-[#C7A86D]/20 pb-6 max-w-xl mx-auto">
        <span className="font-sans text-[10px] text-[#C7A86D] tracking-[0.4em] uppercase block">
          Council of Sovereign Guardians
        </span>
        <h2 className="font-serif text-3xl text-[#E9DFC8] font-bold">THE ROYAL CIRCLE</h2>
        <p className="text-xs text-[#9E9E8E] font-serif italic">
          Behold the keepers of Fillory Niel's digital vaults. Their eyes follow your movements, vigilant against invaders.
        </p>

        {/* Add Group Member Button */}
        <div className="pt-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { resetForm(); setIsAddOpen(true); }}
            className="px-5 py-2 rounded-full border border-[#C7A86D] bg-[#C7A86D]/10 text-xs text-[#E9DFC8] font-sans tracking-wider uppercase cursor-pointer hover:bg-[#C7A86D]/25 transition-all flex items-center space-x-1.5 mx-auto"
          >
            <Plus className="w-4 h-4 text-[#C7A86D]" />
            <span>Tambah Anggota Dewan</span>
          </motion.button>
        </div>
      </div>

      {/* Council Arrangement */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 justify-center items-center py-6">
        {members.map((member) => {
          const isSelected = activeMember?.id === member.id;
          const pupils = getPupilOffset(member.id);

          return (
            <motion.div
              key={member.id}
              id={`portrait-card-${member.id}`}
              whileHover={{ y: -8, scale: 1.03 }}
              onClick={() => setActiveMember(member)}
              className={`relative aspect-[3/4] rounded-lg p-3 cursor-pointer transition-all border overflow-hidden flex flex-col items-center justify-between shadow-[0_12px_24px_rgba(0,0,0,0.5)] ${
                isSelected
                  ? 'border-[#C7A86D] bg-[#2C2314]/80 shadow-[0_0_20px_rgba(199,168,109,0.3)]'
                  : 'border-[#C7A86D]/20 bg-[#111512] hover:border-[#C7A86D]/50'
              }`}
            >
              {/* Antique Detailed Gold Frame Layout */}
              <div className="absolute inset-1.5 border border-[#C7A86D]/20 pointer-events-none rounded-md z-10" />
              <div className="absolute inset-2 border border-[#C7A86D]/5 pointer-events-none rounded z-10" />
              
              {/* Ornate Gold Corners */}
              <div className="absolute top-2 left-2 w-2.5 h-2.5 border-t border-l border-[#C7A86D]/50 z-10" />
              <div className="absolute top-2 right-2 w-2.5 h-2.5 border-t border-r border-[#C7A86D]/50 z-10" />
              <div className="absolute bottom-2 left-2 w-2.5 h-2.5 border-b border-l border-[#C7A86D]/50 z-10" />
              <div className="absolute bottom-2 right-2 w-2.5 h-2.5 border-b border-r border-[#C7A86D]/50 z-10" />

              {/* Inline action buttons for members */}
              <div className="absolute top-3 right-3 flex items-center space-x-1 z-20">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenEditModal(member);
                  }}
                  className="p-1 rounded bg-[#0B0C0A]/70 text-[#C7A86D] hover:text-[#E9DFC8] border border-[#C7A86D]/20 hover:border-[#C7A86D]/50 cursor-pointer"
                  title="Edit Anggota"
                >
                  <Edit2 className="w-2.5 h-2.5" />
                </button>
                {/* Prevent deleting main seed keeper so there's always an active admin */}
                {member.id !== 'char-1' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteMemberClick(member.id, member.name);
                    }}
                    className="p-1 rounded bg-[#0B0C0A]/70 text-red-400 hover:text-red-300 border border-red-950/20 hover:border-red-900/50 cursor-pointer"
                    title="Hapus Anggota"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>

              <span className="font-sans text-[8px] tracking-widest text-[#C7A86D]/60 uppercase text-center relative z-10 select-none">
                {member.permissionLevel}
              </span>

              {/* Portrait circular frame */}
              <div className="relative w-28 h-28 rounded-full border-2 border-[#C7A86D]/45 overflow-hidden flex items-center justify-center shadow-lg group">
                {/* Image */}
                <img
                  src={member.avatarUrl}
                  alt={member.name}
                  className="w-full h-full object-cover grayscale opacity-85 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 scale-105"
                  referrerPolicy="no-referrer"
                />

                {/* Simulated Magical Eye Pupils (Overlaid precisely over the eyes coordinate) */}
                <div className="absolute inset-0 pointer-events-none mix-blend-color-dodge flex justify-center items-center">
                  <div className="relative w-full h-full">
                    {/* Left pupil */}
                    <div
                      className="absolute w-1.5 h-1.5 bg-[#D7BB7A] rounded-full blur-[0.5px] shadow-[0_0_4px_#D7BB7A] transition-transform duration-75 ease-out"
                      style={{
                        top: '44%',
                        left: '38%',
                        transform: `translate(${pupils.x}px, ${pupils.y}px)`,
                      }}
                    />
                    {/* Right pupil */}
                    <div
                      className="absolute w-1.5 h-1.5 bg-[#D7BB7A] rounded-full blur-[0.5px] shadow-[0_0_4px_#D7BB7A] transition-transform duration-75 ease-out"
                      style={{
                        top: '44%',
                        right: '38%',
                        transform: `translate(${pupils.x}px, ${pupils.y}px)`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Character Details Caption */}
              <div className="text-center relative z-10 space-y-0.5">
                <h4 className="font-serif text-xs font-bold text-[#E9DFC8] tracking-tight truncate max-w-[130px]">
                  {member.name}
                </h4>
                <p className="text-[10px] text-[#9E9E8E] leading-none">
                  {member.role}
                </p>
              </div>

              {/* Security lock state */}
              <div className="flex items-center space-x-1 relative z-10">
                {member.privateVault ? (
                  <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-red-950/30 border border-red-900/35 text-red-400 text-[8px] font-mono select-none">
                    <Lock className="w-2 h-2" />
                    <span>PRIVATE</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-950/30 border border-emerald-900/35 text-emerald-400 text-[8px] font-mono select-none">
                    <Users className="w-2 h-2" />
                    <span>SHARED</span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Selected Council Member Details and Shared Albums Features Panel */}
      <AnimatePresence mode="wait">
        {activeMember && (
          <motion.div
            key={activeMember.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-4xl mx-auto bg-[#111512] border border-[#C7A86D]/30 rounded-lg p-6 relative overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
          >
            {/* Ornate graphics */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-[radial-gradient(circle_at_top_right,rgba(199,168,109,0.03)_0%,transparent_70%)] pointer-events-none" />

            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Big avatar detail card */}
              <div className="w-full md:w-1/3 flex flex-col items-center text-center space-y-4 border-r border-[#C7A86D]/10 pr-0 md:pr-6 pb-6 md:pb-0">
                <div className="w-24 h-24 rounded-full border border-[#C7A86D]/40 overflow-hidden shadow-md">
                  <img
                    src={activeMember.avatarUrl}
                    alt={activeMember.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <div className="px-3.5 py-1 rounded border border-[#C7A86D]/30 bg-[#C7A86D]/5 text-[#C7A86D] text-[9px] font-mono tracking-widest uppercase inline-block mb-1.5">
                    {activeMember.permissionLevel} Rank
                  </div>
                  <h3 className="font-serif text-xl text-[#E9DFC8] font-bold">{activeMember.name}</h3>
                  <p className="text-xs text-[#9E9E8E] italic">{activeMember.role}</p>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenEditModal(activeMember)}
                    className="px-3 py-1.5 rounded border border-[#C7A86D]/30 hover:border-[#C7A86D] text-[#C7A86D] text-[10px] uppercase font-sans cursor-pointer transition-colors"
                  >
                    Ubah Anggota
                  </button>
                </div>
              </div>

              {/* Guard details / access rights */}
              <div className="flex-1 space-y-4">
                <h4 className="font-sans text-xs tracking-wider text-[#C7A86D] uppercase font-semibold pb-1.5 border-b border-[#C7A86D]/15 flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-[#C7A86D]" />
                  <span>Vault Access Permissions</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 rounded border border-[#C7A86D]/10 bg-[#0B0C0A]/40 space-y-1">
                    <span className="text-[10px] text-[#C7A86D] font-mono">SHARED ALBUMS</span>
                    <p className="text-xs text-[#E9DFC8]">Full read and write permissions to the main "Family Kingdom" catalog.</p>
                  </div>

                  <div className="p-3 rounded border border-[#C7A86D]/10 bg-[#0B0C0A]/40 space-y-1">
                    <span className="text-[10px] text-[#C7A86D] font-mono">PRIVATE VAULT DECRYPTION</span>
                    <p className="text-xs text-[#E9DFC8]">
                      {activeMember.privateVault
                        ? 'Permitted to seal personal chronicles from other council eyes.'
                        : 'No personal private vault sealed. Operating strictly in open family mode.'}
                    </p>
                  </div>

                  <div className="p-3 rounded border border-[#C7A86D]/10 bg-[#0B0C0A]/40 space-y-1">
                    <span className="text-[10px] text-[#C7A86D] font-mono">VIDEO COLLABORATION</span>
                    <p className="text-xs text-[#E9DFC8]">Full clearance to synthesize multi-author movies in the Memory Theater.</p>
                  </div>

                  <div className="p-3 rounded border border-[#C7A86D]/10 bg-[#0B0C0A]/40 space-y-1">
                    <span className="text-[10px] text-[#C7A86D] font-mono">SECURITY COOPERATIVE</span>
                    <p className="text-xs text-[#E9DFC8]">Permitted to vote on unsealing older archives or deleting duplicate records.</p>
                  </div>
                </div>

                {/* Mock access control interactive toggles */}
                <div className="pt-2 flex flex-wrap gap-2">
                  <button className="px-4 py-2 bg-[#C7A86D]/10 hover:bg-[#C7A86D]/20 text-[#E9DFC8] border border-[#C7A86D]/30 rounded text-[9px] tracking-wider uppercase font-sans cursor-pointer transition-all">
                    Grant Sovereign Override
                  </button>
                  <button className="px-4 py-2 bg-red-950/15 hover:bg-red-950/30 text-red-400 border border-red-900/25 rounded text-[9px] tracking-wider uppercase font-sans cursor-pointer transition-all">
                    Revoke Memory Scribe Clearance
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Member Modal */}
      <AnimatePresence>
        {isAddOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050605]/90 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-[#111512] border border-[#C7A86D]/45 rounded-xl p-6 md:p-8 shadow-[0_15px_40px_rgba(0,0,0,0.8)] space-y-6"
            >
              <div className="absolute inset-2 border border-[#C7A86D]/10 pointer-events-none rounded-lg" />
              
              <div className="flex items-center justify-between border-b border-[#C7A86D]/20 pb-4">
                <div className="space-y-0.5">
                  <span className="font-sans text-[8px] text-[#C7A86D] tracking-[0.3em] uppercase block">
                    Royal Council Enlistment
                  </span>
                  <h3 className="font-serif text-xl font-bold text-[#E9DFC8]">
                    Tambah Anggota Dewan Baru
                  </h3>
                </div>
                <button
                  onClick={() => setIsAddOpen(false)}
                  className="p-1 rounded-full border border-[#C7A86D]/20 text-[#9E9E8E] hover:text-[#E9DFC8] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateMemberSubmit} className="space-y-4 relative z-10">
                <div className="space-y-1">
                  <label className="text-[10px] text-[#C7A86D] font-mono tracking-wider block">NAMA ANGGOTA</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                    placeholder="Contoh: Penny Adiyodi"
                    className="w-full bg-[#0B0C0A]/60 border border-[#C7A86D]/25 rounded px-3 py-2 text-xs text-[#E9DFC8] focus:outline-none focus:border-[#C7A86D]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-[#C7A86D] font-mono tracking-wider block">PERAN / JABATAN DEWAN</label>
                  <input
                    type="text"
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    required
                    placeholder="Contoh: Astral Traveler"
                    className="w-full bg-[#0B0C0A]/60 border border-[#C7A86D]/25 rounded px-3 py-2 text-xs text-[#E9DFC8] focus:outline-none focus:border-[#C7A86D]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-[#C7A86D] font-mono tracking-wider block">TINGKAT PERIZINAN</label>
                    <select
                      value={formPermission}
                      onChange={(e) => setFormPermission(e.target.value as any)}
                      className="w-full bg-[#0B0C0A]/60 border border-[#C7A86D]/25 rounded px-3 py-2 text-xs text-[#E9DFC8] focus:outline-none focus:border-[#C7A86D]"
                    >
                      <option value="Sovereign">Sovereign</option>
                      <option value="Ranger">Ranger</option>
                      <option value="Archivist">Archivist</option>
                      <option value="Spellweaver">Spellweaver</option>
                      <option value="Knight">Knight</option>
                    </select>
                  </div>

                  <div className="space-y-1 flex flex-col justify-end pb-1.5">
                    <label className="text-[10px] text-[#C7A86D] font-mono tracking-wider block mb-1">STAMP PRIVATE</label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formPrivate}
                        onChange={(e) => setFormPrivate(e.target.checked)}
                        className="rounded bg-[#0B0C0A] border-[#C7A86D]/30 text-[#C7A86D] focus:ring-0"
                      />
                      <span className="text-xs text-[#9E9E8E]">Kunci Vault Pribadi</span>
                    </label>
                  </div>
                </div>

                {/* Avatar Photo Uploader */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-[#C7A86D] font-mono tracking-wider block">FOTO AVATAR</label>
                  <div className="flex items-center space-x-3 bg-[#0B0C0A]/40 p-3 rounded border border-[#C7A86D]/20">
                    <div className="w-12 h-12 rounded-full border border-[#C7A86D]/40 bg-[#0B0C0A] overflow-hidden flex items-center justify-center">
                      {formAvatarUrl ? (
                        <img src={formAvatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                      ) : (
                        <Shield className="w-5 h-5 text-[#C7A86D]/40" />
                      )}
                    </div>
                    <label className="px-3 py-1.5 border border-[#C7A86D]/30 hover:border-[#C7A86D] rounded text-[10px] text-[#C7A86D] uppercase font-sans cursor-pointer transition-colors bg-[#050605]/60">
                      Unggah Berkas Gambar
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-[#C7A86D]/15 gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className="px-4 py-2 border border-[#C7A86D]/20 text-[#9E9E8E] hover:text-[#E9DFC8] rounded-full text-xs font-sans uppercase tracking-widest cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-[#D7BB7A] to-[#C7A86D] hover:scale-105 text-[#111512] rounded-full text-xs font-bold font-sans uppercase tracking-widest cursor-pointer flex items-center space-x-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Meteraikan Jiwa</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Member Modal */}
      <AnimatePresence>
        {isEditOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050605]/90 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-[#111512] border border-[#C7A86D]/45 rounded-xl p-6 md:p-8 shadow-[0_15px_40px_rgba(0,0,0,0.8)] space-y-6"
            >
              <div className="absolute inset-2 border border-[#C7A86D]/10 pointer-events-none rounded-lg" />
              
              <div className="flex items-center justify-between border-b border-[#C7A86D]/20 pb-4">
                <div className="space-y-0.5">
                  <span className="font-sans text-[8px] text-[#C7A86D] tracking-[0.3em] uppercase block">
                    Sovereign Credentials Alteration
                  </span>
                  <h3 className="font-serif text-xl font-bold text-[#E9DFC8]">
                    Ubah Anggota Dewan
                  </h3>
                </div>
                <button
                  onClick={() => setIsEditOpen(false)}
                  className="p-1 rounded-full border border-[#C7A86D]/20 text-[#9E9E8E] hover:text-[#E9DFC8] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleUpdateMemberSubmit} className="space-y-4 relative z-10">
                <div className="space-y-1">
                  <label className="text-[10px] text-[#C7A86D] font-mono tracking-wider block">NAMA ANGGOTA</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                    className="w-full bg-[#0B0C0A]/60 border border-[#C7A86D]/25 rounded px-3 py-2 text-xs text-[#E9DFC8] focus:outline-none focus:border-[#C7A86D]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-[#C7A86D] font-mono tracking-wider block">PERAN / JABATAN DEWAN</label>
                  <input
                    type="text"
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    required
                    className="w-full bg-[#0B0C0A]/60 border border-[#C7A86D]/25 rounded px-3 py-2 text-xs text-[#E9DFC8] focus:outline-none focus:border-[#C7A86D]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-[#C7A86D] font-mono tracking-wider block">TINGKAT PERIZINAN</label>
                    <select
                      value={formPermission}
                      onChange={(e) => setFormPermission(e.target.value as any)}
                      className="w-full bg-[#0B0C0A]/60 border border-[#C7A86D]/25 rounded px-3 py-2 text-xs text-[#E9DFC8] focus:outline-none"
                    >
                      <option value="Sovereign">Sovereign</option>
                      <option value="Ranger">Ranger</option>
                      <option value="Archivist">Archivist</option>
                      <option value="Spellweaver">Spellweaver</option>
                      <option value="Knight">Knight</option>
                    </select>
                  </div>

                  <div className="space-y-1 flex flex-col justify-end pb-1.5">
                    <label className="text-[10px] text-[#C7A86D] font-mono tracking-wider block mb-1">STAMP PRIVATE</label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formPrivate}
                        onChange={(e) => setFormPrivate(e.target.checked)}
                        className="rounded bg-[#0B0C0A] border-[#C7A86D]/30 text-[#C7A86D] focus:ring-0"
                      />
                      <span className="text-xs text-[#9E9E8E]">Kunci Vault Pribadi</span>
                    </label>
                  </div>
                </div>

                {/* Avatar Photo Uploader */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-[#C7A86D] font-mono tracking-wider block">FOTO AVATAR</label>
                  <div className="flex items-center space-x-3 bg-[#0B0C0A]/40 p-3 rounded border border-[#C7A86D]/20">
                    <div className="w-12 h-12 rounded-full border border-[#C7A86D]/40 bg-[#0B0C0A] overflow-hidden flex items-center justify-center">
                      <img src={formAvatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                    </div>
                    <label className="px-3 py-1.5 border border-[#C7A86D]/30 hover:border-[#C7A86D] rounded text-[10px] text-[#C7A86D] uppercase font-sans cursor-pointer transition-colors bg-[#050605]/60">
                      Ganti Berkas Gambar
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-[#C7A86D]/15 gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditOpen(false)}
                    className="px-4 py-2 border border-[#C7A86D]/20 text-[#9E9E8E] hover:text-[#E9DFC8] rounded-full text-xs font-sans uppercase tracking-widest cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-[#D7BB7A] to-[#C7A86D] hover:scale-105 text-[#111512] rounded-full text-xs font-bold font-sans uppercase tracking-widest cursor-pointer flex items-center space-x-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Simpan Perubahan</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
