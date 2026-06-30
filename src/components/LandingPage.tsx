import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Play, Shield, ChevronRight, EyeOff, Edit3, LogIn, X } from 'lucide-react';
import { MemoryItem } from '../types';
import { signInWithGoogle, logoutWithGoogle } from '../firebase'; // Memanggil fungsi popup dari firebase.ts kamu!

interface LandingPageProps {
  onEnterVault: () => void;
  memories: MemoryItem[];
  landingHeading: string;
  landingSub: string;
  onUpdateLandingText: (heading: string, sub: string) => Promise<void>;
  onLogout?: () => void;
}

interface Bat {
  id: number;
  initialX: number;
  initialY: number;
  scale: number;
  delay: number;
  duration: number;
}

export default function LandingPage({
  onEnterVault,
  memories,
  landingHeading,
  landingSub,
  onUpdateLandingText,
  onLogout,
}: LandingPageProps) {
  const [pulseActive, setPulseActive] = useState(false);
  const [legendOpen, setLegendOpen] = useState(false);
  const [legendText, setLegendText] = useState('');
  const [loadingLegend, setLoadingLegend] = useState(false);
  const [onlineMode, setOnlineMode] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [headingInput, setHeadingInput] = useState(landingHeading);
  const [subInput, setSubInput] = useState(landingSub);
  const [isSavingText, setIsSavingText] = useState(false);

  useEffect(() => {
    setHeadingInput(landingHeading);
    setSubInput(landingSub);
  }, [landingHeading, landingSub]);

  // Efek Kelelawar Malam
  const [bats, setBats] = useState<Bat[]>([]);
  useEffect(() => {
    const list: Bat[] = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      initialX: Math.random() * 120 - 10,
      initialY: Math.random() * 50 + 20,
      scale: Math.random() * 0.6 + 0.3,
      delay: Math.random() * 10,
      duration: Math.random() * 8 + 6,
    }));
    setBats(list);
  }, []);

  // Efek Pulse Kunang-kunang Emas
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseActive(true);
      setTimeout(() => setPulseActive(false), 2000);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    try {
      // Menjalankan fungsi Popup bawaan firebase.ts kamu yang asli
      await signInWithGoogle();
      onEnterVault();
    } catch (error) {
      console.error("Gagal menembus gerbang Google Popup:", error);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleWatchLegend = async () => {
    setLegendOpen(true);
    setLoadingLegend(true);
    setLegendText('');
    try {
      const targetItem = memories.find(m => m.id === 'mem-1') || memories[0];
      const response = await fetch('/api/legend/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item: targetItem }),
      });
      const data = await response.json();
      setLegendText(data.legend);
      setOnlineMode(data.onlineMode);
    } catch (err) {
      setLegendText('In the shadow age of Niel, the sovereign rulers walked under the dark skies of Castle Fillory Niel...');
      setOnlineMode(false);
    } finally {
      setLoadingLegend(false);
    }
  };

  const handleSaveText = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingText(true);
    try {
      await onUpdateLandingText(headingInput, subInput);
      setIsEditOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingText(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between items-center px-6 py-8 overflow-hidden bg-[#050605]" id="landing-page">
      {onLogout && (
        <button onClick={async () => { await logoutWithGoogle(); if(onLogout) onLogout(); }} className="absolute top-4 right-4 z-20 flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full border border-red-900/30 bg-[#050605]/80 text-red-400 text-[10px] uppercase tracking-widest cursor-pointer hover:bg-red-950/20 transition-all font-sans">
          <LogIn className="w-3.5 h-3.5 rotate-180" />
          <span>Lock Gates</span>
        </button>
      )}

      {/* Latar Belakang Kastil */}
      <div className="absolute inset-0 z-0 select-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#050605]/80 via-transparent to-[#050605] z-10 pointer-events-none" />
        <motion.div initial={{ scale: 1.15, opacity: 0 }} animate={{ scale: 1.05, opacity: 0.75 }} transition={{ duration: 3.5 }} className="w-full h-full relative">
          <img src="/src/assets/images/haunted_castle_1782435990516.jpg" alt="Castle" className="w-full h-full object-cover scale-105" referrerPolicy="no-referrer" />
        </motion.div>
      </div>

      {/* Animasi Kelelawar Terbang */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
        {bats.map((bat) => (
          <motion.div
            key={bat.id}
            initial={{ x: `${bat.initialX}vw`, y: '110vh', scale: bat.scale, rotate: 0, opacity: 0 }}
            animate={{
              y: `${bat.initialY}vh`,
              x: [
                `${bat.initialX}vw`,
                `${bat.initialX + (bat.id % 2 === 0 ? 8 : -8)}vw`,
                `${bat.initialX}vw`
              ],
              rotate: [0, bat.id % 2 === 0 ? 15 : -15, 0],
              opacity: [0, 0.7, 0.7, 0]
            }}
            transition={{
              duration: bat.duration,
              delay: bat.delay,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute w-6 h-6 text-[#C7A86D]/40"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
              <path d="M12 6c.5 0 1 .5 1.5 1.5C14.5 6.5 16 5 18 5c2.5 0 4.5 2.5 4.5 5.5 0 4-4.5 7.5-10.5 10.5-6-3-10.5-6.5-10.5-10.5C1.5 7.5 3.5 5 6 5c2 0 3.5 1.5 4.5 2.5C11 6.5 11.5 6 12 6z"/>
            </svg>
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 text-center space-y-4 my-auto pt-24 flex flex-col items-center">
        <h1 className="font-serif text-4xl text-[#E9DFC8] tracking-tight">
          {landingHeading || "WELCOME TO FILLORY NIEL"}
        </h1>
        <p className="font-serif italic text-base text-[#E9DFC8]/80 max-w-lg">
          {landingSub || '“Every Memory Has A Story Worth Preserving.”'}
        </p>
        <button onClick={() => setIsEditOpen(true)} className="mt-3 flex items-center space-x-1.5 px-3 py-1 rounded border border-[#C7A86D]/20 text-[#C7A86D] text-[9px] uppercase tracking-widest hover:border-[#C7A86D]/45 transition-all cursor-pointer">
          <Edit3 className="w-3 h-3" />
          <span>Ubah Tulisan Gerbang</span>
        </button>
      </div>

      {/* Kontainer Tombol Utama dengan Efek Kunang-Kunang Emas */}
      <motion.div 
        animate={pulseActive ? { scale: [1, 1.02, 1] } : {}}
        transition={{ duration: 2 }}
        className="relative z-10 w-full max-w-md space-y-6 text-center flex flex-col items-center"
      >
        <div className="w-full flex flex-col items-center space-y-2 pb-4">
          <motion.button
            onClick={handleGoogleSignIn}
            disabled={isSigningIn}
            whileHover={{ scale: 1.02 }}
            className="w-64 px-6 py-2.5 rounded border border-[#C7A86D]/60 text-[10px] tracking-[0.2em] font-sans uppercase font-bold text-[#E9DFC8] bg-[#111512]/90 hover:bg-[#C7A86D]/10 transition-all cursor-pointer flex items-center justify-center space-x-2 shadow-[0_0_15px_rgba(199,168,109,0.1)]"
          >
            <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <Sparkles className="w-3.5 h-3.5 text-[#C7A86D]" />
            </motion.div>
            <span>{isSigningIn ? 'OPENING GATES...' : 'SIGN IN WITH GOOGLE'}</span>
          </motion.button>
          
          <button 
            onClick={handleWatchLegend}
            className="text-[10px] text-[#9E9E8E] hover:text-[#C7A86D] transition-all font-sans tracking-widest flex items-center gap-1 mt-2 border border-transparent hover:border-[#C7A86D]/20 px-3 py-1 rounded-full cursor-pointer"
          >
            <Play className="w-2.5 h-2.5" /> LIHAT LEGENDA KASTIL
          </button>
        </div>

        <div className="flex gap-4 justify-center items-center w-full">
          <motion.button onClick={onEnterVault} className="px-8 py-3.5 rounded-full border border-[#C7A86D] text-[11px] uppercase text-[#111512] bg-gradient-to-r from-[#D7BB7A] to-[#C7A86D] flex items-center space-x-2 cursor-pointer">
            <span>Sowan Ke Dalam Vault</span>
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>

      {/* Modal Legenda Kastil */}
      <AnimatePresence>
        {legendOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050605]/95 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="relative w-full max-w-lg bg-[#111512] border border-[#C7A86D]/45 rounded-xl p-6 space-y-6 overflow-y-auto max-h-[80vh] font-serif text-[#E9DFC8]/90 text-sm leading-relaxed tracking-wide shadow-2xl">
              <div className="border-b border-[#C7A86D]/20 pb-3 flex justify-between items-center">
                <div className="flex items-center space-x-2 text-[#C7A86D]">
                  <Shield className="w-4 h-4" />
                  <span className="font-sans text-xs uppercase tracking-widest font-bold">Gulungan Kitab Kuno</span>
                </div>
                <button onClick={() => setLegendOpen(false)} className="text-[#9E9E8E] hover:text-[#C7A86D] transition-all cursor-pointer"><X className="w-4 h-4" /></button>
              </div>

              {loadingLegend ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                  <div className="w-5 h-5 border-2 border-[#C7A86D] border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-sans tracking-widest text-[#9E9E8E] uppercase">Membaca tinta rasi bintang...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="whitespace-pre-line">{legendText}</p>
                  {!onlineMode && (
                    <div className="flex items-center justify-center space-x-2 text-[10px] font-sans text-[#C7A86D] bg-[#C7A86D]/5 py-2 rounded border border-[#C7A86D]/10">
                      <EyeOff className="w-3 h-3" />
                      <span>Mimpi Offline: Aktif dari ingatan lokal Kastil</span>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-2 border-t border-[#C7A86D]/10 flex justify-end">
                <button onClick={() => setLegendOpen(false)} className="mx-auto px-6 py-2 border border-[#C7A86D]/30 text-[10px] uppercase font-sans tracking-widest hover:bg-[#C7A86D]/5 text-[#C7A86D] rounded transition-all cursor-pointer">Tutup Gulungan</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Edit Teks */}
      <AnimatePresence>
        {isEditOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050605]/90 backdrop-blur-md">
            <div className="relative w-full max-w-lg bg-[#111512] border border-[#C7A86D]/45 rounded-xl p-6 space-y-6">
              <form onSubmit={handleSaveText} className="space-y-5">
                <textarea rows={2} value={headingInput} onChange={(e) => setHeadingInput(e.target.value)} className="w-full bg-[#050605]/60 border border-[#C7A86D]/30 text-[#E9DFC8] p-2 rounded" />
                <input type="text" value={subInput} onChange={(e) => setSubInput(e.target.value)} className="w-full bg-[#050605]/60 border border-[#C7A86D]/30 text-[#E9DFC8] p-2 rounded" />
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setIsEditOpen(false)} className="text-[#9E9E8E]">Batal</button>
                  <button type="submit" disabled={isSavingText} className="bg-[#C7A86D] text-[#111512] px-4 py-2 rounded-full cursor-pointer">
                    {isSavingText ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}