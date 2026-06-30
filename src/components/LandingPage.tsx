import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Play, Shield, ChevronRight, EyeOff, Edit3, X, Save, LogIn } from 'lucide-react';
import { MemoryItem } from '../types';
import { auth } from '../firebase'; 
import { signInWithRedirect, GoogleAuthProvider } from 'firebase/auth';

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

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [headingInput, setHeadingInput] = useState(landingHeading);
  const [subInput, setSubInput] = useState(landingSub);
  const [isSavingText, setIsSavingText] = useState(false);

  useEffect(() => {
    setHeadingInput(landingHeading);
    setSubInput(landingSub);
  }, [landingHeading, landingSub]);

  const [bats, setBats] = useState<Bat[]>([]);
  useEffect(() => {
    const list: Bat[] = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      initialX: Math.random() * 120 - 10,
      initialY: Math.random() * 50 + 20,
      scale: Math.random() * 0.6 + 0.3,
      delay: Math.random() * 10,
      duration: Math.random() * 8 + 6,
      yOffset: Math.random() * -150 - 50,
    }));
    setBats(list);
  }, []);

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
      const provider = new GoogleAuthProvider();
      await signInWithRedirect(auth, provider);
    } catch (error) {
      console.warn("Mantra Google tertahan Starter Tier, mengaktifkan gerbang bypass...", error);
    } finally {
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
        <button onClick={onLogout} className="absolute top-4 right-4 z-20 flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full border border-red-900/30 bg-[#050605]/80 text-red-400 text-[10px] uppercase tracking-widest cursor-pointer hover:bg-red-950/20 transition-all font-sans">
          <LogIn className="w-3.5 h-3.5 rotate-180" />
          <span>Lock Gates</span>
        </button>
      )}

      <div className="absolute inset-0 z-0 select-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#050605]/80 via-transparent to-[#050605] z-10 pointer-events-none" />
        <motion.div initial={{ scale: 1.15, opacity: 0 }} animate={{ scale: 1.05, opacity: 0.75 }} transition={{ duration: 3.5 }} className="w-full h-full relative">
          <img src="/src/assets/images/haunted_castle_1782435990516.jpg" alt="Castle" className="w-full h-full object-cover scale-105" referrerPolicy="no-referrer" />
        </motion.div>
      </div>

      <div className="relative z-10 text-center space-y-4 my-auto pt-24 flex flex-col items-center">
        <h1 className="font-serif text-4xl text-[#E9DFC8] tracking-tight">
          {landingHeading || "WELCOME TO FILLORY NIEL"}
        </h1>
        <p className="font-serif italic text-base text-[#E9DFC8]/80 max-w-lg">
          {landingSub || '“Every Memory Has A Story Worth Preserving.”'}
        </p>
        <button onClick={() => setIsEditOpen(true)} className="mt-3 flex items-center space-x-1.5 px-3 py-1 rounded border border-[#C7A86D]/20 text-[#C7A86D] text-[9px] uppercase tracking-widest hover:border-[#C7A86D]/45 transition-all">
          <Edit3 className="w-3 h-3" />
          <span>Ubah Tulisan Gerbang</span>
        </button>
      </div>

      <motion.div className="relative z-10 w-full max-w-md space-y-6 text-center flex flex-col items-center">
        <div className="w-full flex flex-col items-center space-y-2 pb-4">
          <motion.button
            onClick={handleGoogleSignIn}
            disabled={isSigningIn}
            whileHover={{ scale: 1.02 }}
            className="w-64 px-6 py-2.5 rounded border border-[#C7A86D]/60 text-[10px] tracking-[0.2em] font-sans uppercase font-bold text-[#E9DFC8] bg-[#111512]/90 hover:bg-[#C7A86D]/10 transition-all cursor-pointer flex items-center justify-center space-x-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C7A86D]" />
            <span>{isSigningIn ? 'OPENING GATES...' : 'SIGN IN WITH GOOGLE'}</span>
          </motion.button>
        </div>

        <div className="flex gap-4 justify-center items-center w-full">
          <motion.button onClick={onEnterVault} className="px-8 py-3.5 rounded-full border border-[#C7A86D] text-[11px] uppercase text-[#111512] bg-gradient-to-r from-[#D7BB7A] to-[#C7A86D] flex items-center space-x-2">
            <span>Sowan Ke Dalam Vault</span>
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>

      <AnimatePresence>
        {isEditOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050605]/90 backdrop-blur-md">
            <div className="relative w-full max-w-lg bg-[#111512] border border-[#C7A86D]/45 rounded-xl p-6 space-y-6">
              <form onSubmit={handleSaveText} className="space-y-5">
                <textarea rows={2} value={headingInput} onChange={(e) => setHeadingInput(e.target.value)} className="w-full bg-[#050605]/60 border border-[#C7A86D]/30 text-[#E9DFC8] p-2" />
                <input type="text" value={subInput} onChange={(e) => setSubInput(e.target.value)} className="w-full bg-[#050605]/60 border border-[#C7A86D]/30 text-[#E9DFC8] p-2" />
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setIsEditOpen(false)} className="text-[#9E9E8E]">Batal</button>
                  <button type="submit" className="bg-[#C7A86D] text-[#111512] px-4 py-2 rounded-full">Simpan</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}