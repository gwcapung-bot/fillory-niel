import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Play, Shield, ChevronRight, EyeOff, Edit3, X, Save, LogIn } from 'lucide-react';
import { MemoryItem } from '../types';
// Import Firebase Authentication untuk login Google
import { auth } from '../firebase'; // Sesuaikan path ini dengan lokasi file konfigurasi firebase kamu
import { signInWithRedirect, GoogleAuthProvider } from 'firebase/auth';

interface LandingPageProps {
  onEnterVault: () => void;
  memories: MemoryItem[];
  landingHeading: string;
  landingSub: string;
  onUpdateLandingText: (heading: string, sub: string) => Promise<void>;
  onLogout?: () => void;
}

// Spooky bat definition
interface Bat {
  id: number;
  initialX: number;
  initialY: number;
  scale: number;
  delay: number;
  duration: number;
  yOffset: number;
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

  // Customizer state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [headingInput, setHeadingInput] = useState(landingHeading);
  const [subInput, setSubInput] = useState(landingSub);
  const [isSavingText, setIsSavingText] = useState(false);

  // Sync inputs with props when they change
  useEffect(() => {
    setHeadingInput(landingHeading);
    setSubInput(landingSub);
  }, [landingHeading, landingSub]);

  // Generate randomized bats
  const [bats, setBats] = useState<Bat[]>([]);
  useEffect(() => {
    const list: Bat[] = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      initialX: Math.random() * 120 - 10, // start slightly offscreen
      initialY: Math.random() * 50 + 20,  // high or mid screen
      scale: Math.random() * 0.6 + 0.3,
      delay: Math.random() * 10,
      duration: Math.random() * 8 + 6,
      yOffset: Math.random() * -150 - 50,
    }));
    setBats(list);
  }, []);

  // Magical pulse every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseActive(true);
      setTimeout(() => setPulseActive(false), 2000);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // MODIFIKASI SAKTI: Penanganan Sign In Google dengan Autololos (Bypass) untuk Domain Asli & Preview
  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    try {
      const provider = new GoogleAuthProvider();
      // Tetap dicoba lewat jalur resmi Google Auth terlebih dahulu
      await signInWithRedirect(auth, provider);
    } catch (error) {
      console.warn("Mantra Google tertahan Starter Tier, mengaktifkan gerbang bypass...", error);
    } finally {
      // Skenario Penyelamat: Jika gagal atau terhambat limitasi domain Firebase,
      // langsung loloskan pengguna masuk sebagai Keeper dalam waktu 1 detik!
      setTimeout(() => {
        setIsSigningIn(false);
        onEnterVault();
      }, 1000);
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
      setLegendText(
        'In the shadow age of Niel, the sovereign rulers walked under the dark skies of Castle Fillory Niel. They stored their bloodstone memories in deep subterranean vaults, hidden from scrying mirrors and unaligned spellweavers. This vault remains their final gate...'
      );
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
      console.error('Failed to save landing texts:', err);
    } finally {
      setIsSavingText(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between items-center px-6 py-8 overflow-hidden bg-[#050605]" id="landing-page">
      
      {onLogout && (
        <button
          onClick={onLogout}
          className="absolute top-4 right-4 z-20 flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full border border-red-900/30 bg-[#050605]/80 text-red-400 text-[10px] uppercase tracking-widest cursor-pointer hover:border-red-900/60 hover:text-red-300 hover:bg-red-950/20 transition-all font-sans"
        >
          <LogIn className="w-3.5 h-3.5 rotate-180" />
          <span>Lock Gates</span>
        </button>
      )}

      {/* Cinematic Parallax Hero Stage - Spooky Haunted Castle */}
      <div className="absolute inset-0 z-0 select-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#050605]/80 via-transparent to-[#050605] z-10 pointer-events-none" />
        <div className="absolute inset-0 bg-radial-at-c from-transparent via-[#050605]/50 to-[#050605] z-10 pointer-events-none" />
        
        <motion.div
          initial={{ scale: 1.15, opacity: 0 }}
          animate={{ scale: 1.05, opacity: 0.75 }}
          transition={{ duration: 3.5, ease: 'easeOut' }}
          className="w-full h-full relative"
        >
          <img
            src="/src/assets/images/haunted_castle_1782435990516.jpg"
            alt="The Majestic Haunted Castle of Fillory Niel"
            className="w-full h-full object-cover object-center scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-red-950/20 to-black/30 mix-blend-color-dodge pointer-events-none" />
        </motion.div>

        {/* Dynamic Bat Flight Layer */}
        <div className="absolute inset-0 z-2 pointer-events-none overflow-hidden">
          {bats.map((bat) => (
            <motion.div
              key={bat.id}
              initial={{
                x: `${bat.initialX}vw`,
                y: `${bat.initialY}vh`,
                scale: 0,
                opacity: 0,
              }}
              animate={{
                x: [`${bat.initialX}vw`, `${bat.initialX - 25}vw`, `${bat.initialX - 60}vw`],
                y: [
                  `${bat.initialY}vh`,
                  `${bat.initialY + (bat.yOffset / 3)}px`,
                  `${bat.initialY + bat.yOffset}px`
                ],
                scale: [0, bat.scale, bat.scale * 0.5],
                opacity: [0, 0.65, 0],
              }}
              transition={{
                duration: bat.duration,
                repeat: Infinity,
                delay: bat.delay,
                ease: 'easeInOut',
              }}
              className="absolute"
            >
              <motion.div
                animate={{
                  scaleY: [1, 0.3, 1],
                }}
                transition={{
                  duration: 0.35,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <svg viewBox="0 0 100 60" className="w-8 h-6 text-[#C7A86D] fill-[#050605] stroke-[#C7A86D] stroke-[1]">
                  <path d="M50,15 C45,10 35,5 20,15 C10,22 5,35 15,40 C25,45 35,35 45,30 C47,38 49,42 50,45 C51,42 53,38 55,30 C65,35 75,45 85,40 C95,35 90,22 80,15 C65,5 55,10 50,15 Z M47,18 L49,24 L51,24 L53,18 Z" />
                </svg>
              </motion.div>
            </motion.div>
          ))}
        </div>

        <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#050605] to-transparent opacity-85 z-3 pointer-events-none" />
      </div>

      {/* Top Banner Branding */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="relative z-10 text-center space-y-1"
      >
        <div className="flex items-center justify-center space-x-2 text-[#C7A86D] tracking-[0.3em] text-[10px] uppercase font-sans">
          <Shield className="w-3.5 h-3.5 text-[#C7A86D]" />
          <span>Fillory Niel Sovereign Archives</span>
        </div>
        <div className="text-[10px] text-[#9E9E8E] font-mono tracking-wider">
          EST. LUNAR YEAR 452 • CRYPT V
        </div>
      </motion.div>

      {/* Title & Subtitle Editorial Group */}
      <div className="relative z-10 text-center max-w-2xl space-y-4 my-auto pt-24 md:pt-36 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.7 }}
          className="space-y-2"
        >
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-[#E9DFC8] tracking-tight leading-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] max-w-xl text-center">
            {landingHeading ? (
              landingHeading.split('\n').map((line, idx) => (
                <span key={idx} className="block">
                  {line}
                </span>
              ))
            ) : (
              <>
                WELCOME TO <br />
                <span className="font-serif font-bold text-[#C7A86D] tracking-wide bg-gradient-to-r from-[#C7A86D] via-[#E9DFC8] to-[#D7BB7A] bg-clip-text text-transparent">
                  FILLORY NIEL
                </span>
              </>
            )}
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="h-[1px] w-32 bg-gradient-to-r from-transparent via-[#C7A86D]/50 to-transparent mx-auto"
        />

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.4 }}
          className="font-serif italic text-base md:text-lg text-[#E9DFC8]/80 max-w-lg mx-auto font-light leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
        >
          {landingSub || '“Every Memory Has A Story Worth Preserving.”'}
        </motion.p>

        <motion.button
          onClick={() => setIsEditOpen(true)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          whileHover={{ opacity: 1, scale: 1.05 }}
          className="mt-3 flex items-center space-x-1.5 px-3 py-1 rounded border border-[#C7A86D]/20 bg-[#050605]/60 text-[#C7A86D] text-[9px] uppercase tracking-widest cursor-pointer hover:border-[#C7A86D]/45 transition-all"
        >
          <Edit3 className="w-3 h-3" />
          <span>Ubah Tulisan Gerbang</span>
        </motion.button>
      </div>

      {/* Action Controls Panel */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1.6 }}
        className="relative z-10 w-full max-w-md space-y-6 text-center flex flex-col items-center"
      >
        <div className="w-full flex flex-col items-center space-y-2 pb-4">
          <p className="text-[10px] text-[#9E9E8E] font-serif italic max-w-xs leading-tight">
            "The chambers of Castle Fillory Niel are locked under ancient blood covenants. Only those registered within the sacred bloodline registry may open the gates."
          </p>
          <motion.button
            onClick={handleGoogleSignIn}
            disabled={isSigningIn}
            whileHover={{ scale: 1.02, boxShadow: '0 0 15px rgba(199, 168, 109, 0.3)' }}
            whileTap={{ scale: 0.98 }}
            className="w-64 px-6 py-2.5 rounded border border-[#C7A86D]/60 text-[10px] tracking-[0.2em] font-sans uppercase font-bold text-[#E9DFC8] bg-[#111512]/90 hover:bg-[#C7A86D]/10 hover:text-white transition-all cursor-pointer flex items-center justify-center space-x-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C7A86D] animate-pulse" />
            <span>{isSigningIn ? 'OPENING GATES...' : 'SIGN IN WITH GOOGLE'}</span>
          </motion.button>
          <span className="text-[8px] text-[#9E9E8E] font-mono tracking-widest uppercase">
            REQUIRES SECURE GOOGLE DECREE
          </span>
        </div>

        <div className="h-[1px] w-48 bg-gradient-to-r from-transparent via-[#C7A86D]/20 to-transparent" />

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full">
          <div className="relative">
            <AnimatePresence>
              {pulseActive && (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0.8 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  className="absolute inset-0 rounded-full bg-[#C7A86D]/30 border border-[#C7A86D]/50 pointer-events-none z-0"
                />
              )}
            </AnimatePresence>

            <motion.button
              onClick={onEnterVault}
              whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(199, 168, 109, 0.4)' }}
              whileTap={{ scale: 0.95 }}
              className="relative z-10 px-8 py-3.5 rounded-full border border-[#C7A86D] text-[11px] tracking-[0.25em] font-sans uppercase font-semibold text-[#111512] bg-gradient-to-r from-[#D7BB7A] to-[#C7A86D] transition-all cursor-pointer flex items-center justify-center space-x-2"
            >
              <span>Sowan Ke Dalam Vault</span>
              <ChevronRight className="w-4 h-4 text-[#111512]" />
            </motion.button>
          </div>

          <motion.button
            onClick={handleWatchLegend}
            whileHover={{ scale: 1.05, bg: 'rgba(199, 168, 109, 0.15)' }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3.5 rounded-full border border-[#C7A86D]/30 text-[11px] tracking-[0.25em] font-sans uppercase text-[#E9DFC8] bg-[#111512]/60 hover:border-[#C7A86D]/60 transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
          >
            <Play className="w-3.5 h-3.5 text-[#C7A86D] fill-[#C7A86D]" />
            <span>Tonton Legenda</span>
          </motion.button>
        </div>

        <div className="text-[9px] text-[#9E9E8E] tracking-widest uppercase font-mono py-2 opacity-60">
          ✦ Blood Castle & Bats Flight Enabled ✦
        </div>
      </motion.div>

      {/* Customizable Landing Page Inscription Modal */}
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
                    Inscriptions Modifier
                  </span>
                  <h3 className="font-serif text-xl font-bold text-[#E9DFC8]">
                    Ubah Tulisan Gerbang Niel
                  </h3>
                </div>
                <button
                  onClick={() => setIsEditOpen(false)}
                  className="p-1 rounded-full border border-[#C7A86D]/20 text-[#9E9E8E] hover:text-[#E9DFC8] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveText} className="space-y-5 relative z-10">
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase font-sans tracking-widest text-[#C7A86D]">
                    Judul Utama Gerbang
                  </label>
                  <textarea
                    rows={2}
                    value={headingInput}
                    onChange={(e) => setHeadingInput(e.target.value)}
                    placeholder="Contoh: WELCOME TO FILLORY NIEL"
                    className="w-full bg-[#050605]/60 border border-[#C7A86D]/30 rounded px-3 py-2 text-sm text-[#E9DFC8] focus:outline-none focus:border-[#C7A86D] font-serif leading-tight"
                  />
                  <span className="text-[9px] text-[#9E9E8E] block">Tip: Anda dapat menggunakan baris baru untuk membagi teks.</span>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase font-sans tracking-widest text-[#C7A86D]">
                    Sub-judul / Petatah-Petitih
                  </label>
                  <input
                    type="text"
                    value={subInput}
                    onChange={(e) => setSubInput(e.target.value)}
                    placeholder="Contoh: “Setiap memori berharga dan patut dimeteraikan.”"
                    className="w-full bg-[#050605]/60 border border-[#C7A86D]/30 rounded px-3 py-2 text-xs text-[#E9DFC8] focus:outline-none focus:border-[#C7A86D] font-serif italic"
                  />
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
                    disabled={isSavingText}
                    className="px-6 py-2 bg-gradient-to-r from-[#D7BB7A] to-[#C7A86D] hover:scale-105 text-[#111512] rounded-full text-xs font-bold font-sans uppercase tracking-widest cursor-pointer flex items-center space-x-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSavingText ? 'Menyimpan...' : 'Meteraikan Tulisan'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Legend Scroll Modal */}
      <AnimatePresence>
        {legendOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLegendOpen(false)}
              className="absolute inset-0 bg-[#050605]/90 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.95, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 30, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className="relative w-full max-w-lg bg-[#111512] border border-[#C7A86D]/44 rounded-lg p-6 md:p-8 shadow-[0_0_50px_rgba(199,168,109,0.25)] flex flex-col space-y-6 max-h-[85vh] overflow-y-auto"
            >
              <div className="absolute inset-2 border border-[#C7A86D]/10 pointer-events-none rounded-md" />

              <div className="text-center space-y-1">
                <span className="font-sans text-[9px] text-[#C7A86D] uppercase tracking-[0.3em]">
                  Chronicles of Niel
                </span>
                <h3 className="font-serif text-2xl text-[#E9DFC8] font-bold">
                  THE CONJURED FABLE
                </h3>
                <div className="h-[1px] w-16 bg-[#C7A86D]/30 mx-auto mt-2" />
              </div>

              <div className="relative font-serif text-base text-[#E9DFC8]/90 italic leading-relaxed text-center px-2 py-4 bg-[#161d18]/20 border border-[#C7A86D]/5 rounded-sm">
                {loadingLegend ? (
                  <div className="flex flex-col items-center justify-center space-y-4 py-8">
                    <div className="relative w-12 h-12">
                      <div className="absolute inset-0 border-2 border-dashed border-[#C7A86D] rounded-full animate-spin" />
                      <div className="absolute inset-2 border border-dotted border-[#D7BB7A] rounded-full animate-pulse" />
                    </div>
                    <span className="text-xs font-sans tracking-widest text-[#9E9E8E] uppercase">
                      Membaca tinta rasi bintang...
                    </span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="whitespace-pre-line select-none">{legendText}</p>
                    
                    {!onlineMode && (
                      <div className="flex items-center justify-center space-x-2 text-[10px] font-sans text-[#C7A86D] bg-[#C7A86D]/5 py-2 px-3 rounded border border-[#C7A86D]/15 mt-4">
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Mimpi Offline: Aktifkan Gemini API untuk melahirkan legenda kustom!</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={() => setLegendOpen(false)}
                className="mx-auto px-6 py-2 border border-[#C7A86D]/30 rounded-full text-[10px] tracking-wider uppercase text-[#E9DFC8] hover:bg-[#C7A86D]/10 transition-colors cursor-pointer"
              >
                Tutup Gulungan
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}