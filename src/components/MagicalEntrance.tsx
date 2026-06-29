import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, LockKeyhole, Sparkles, Wand2 } from 'lucide-react';

interface MagicalEntranceProps {
  onComplete: () => void;
}

export default function MagicalEntrance({ onComplete }: MagicalEntranceProps) {
  const [doorState, setDoorState] = useState<'locked' | 'unsealing' | 'opened'>('locked');
  const [welcomeText, setWelcomeText] = useState('Welcome Back, Keeper.');
  const [subText, setSubText] = useState('Unseal the royal doors to enter Fillory Niel’s archive.');

  const handleUnseal = () => {
    if (doorState !== 'locked') return;
    setDoorState('unsealing');
    setWelcomeText('Welcome Back, Keeper.');
    setSubText('The magical seals are dissolving...');

    // Progress step to opened
    setTimeout(() => {
      setDoorState('opened');
    }, 1200);

    // Complete the entrance
    setTimeout(() => {
      onComplete();
    }, 2800);
  };

  // Auto trigger after a slight delay so user sees the giant door first
  useEffect(() => {
    const timer = setTimeout(() => {
      // Prompt user or auto-unseal. Let's let them click for maximum emotional interaction, but provide a 2s auto-prompt.
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center bg-[#0B0C0A]" id="magical-entrance">
      {/* Heavy textured ancient dark background */}
      <div className="absolute inset-0 bg-radial-at-c from-[#1A221C] via-[#0B0C0A] to-[#050605] opacity-90" />

      {/* Floating golden particle sparks */}
      {doorState === 'unsealing' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(40)].map((_, i) => (
            <motion.div
              key={i}
              initial={{
                x: '50vw',
                y: '50vh',
                scale: Math.random() * 2 + 1,
                opacity: 1,
              }}
              animate={{
                x: `${Math.random() * 100}vw`,
                y: `${Math.random() * 100}vh`,
                opacity: 0,
                scale: 0.1,
              }}
              transition={{
                duration: 2.2,
                ease: 'easeOut',
              }}
              className="absolute w-2 h-2 rounded-full bg-radial from-[#F7EDD5] to-[#C7A86D] shadow-[0_0_12px_#D7BB7A]"
            />
          ))}
        </div>
      )}

      {/* Main Door Frame Centerpiece */}
      <div className="relative w-full max-w-lg md:max-w-xl h-[85vh] flex flex-col items-center justify-between p-6 z-10">
        
        {/* Top Header - Ancient Signet */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center"
        >
          <h2 className="font-sans text-[10px] tracking-[0.4em] text-[#C7A86D] uppercase">
            Sovereign Records of the Crown
          </h2>
          <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-[#C7A86D] to-transparent mx-auto mt-2" />
        </motion.div>

        {/* The Golden Doors Container */}
        <div className="relative w-full h-[55vh] flex border border-[#C7A86D]/20 rounded-lg overflow-hidden bg-[#111512]/50 shadow-[0_0_50px_rgba(199,168,109,0.1)]">
          {/* Grid ambient background */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(199,168,109,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(199,168,109,0.02)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

          {/* Left Door */}
          <motion.div
            animate={{
              rotateY: doorState === 'opened' ? -110 : 0,
              skewY: doorState === 'opened' ? -15 : 0,
              x: doorState === 'opened' ? '-40%' : '0%',
              opacity: doorState === 'opened' ? 0.15 : 1,
            }}
            transition={{
              duration: 2.2,
              ease: [0.77, 0, 0.175, 1],
            }}
            style={{ transformOrigin: 'left center', perspective: 1000 }}
            className="w-1/2 h-full bg-[#111512] border-r border-[#C7A86D]/40 flex flex-col justify-between p-4 relative cursor-pointer"
            onClick={handleUnseal}
          >
            {/* Antique filigree layout */}
            <div className="absolute inset-2 border border-[#C7A86D]/10 pointer-events-none" />
            <div className="absolute top-4 left-4 text-[#C7A86D]/20 font-serif text-sm">𝔉</div>
            <div className="absolute bottom-4 left-4 text-[#C7A86D]/20 font-serif text-sm">𝔙</div>

            {/* Weathered gold engraving details */}
            <div className="w-full h-full flex flex-col justify-between border border-[#C7A86D]/15 p-2 rounded-sm bg-gradient-to-b from-[#161d18]/40 to-[#0d120e]/60">
              <div className="border-b border-[#C7A86D]/20 pb-2 text-center text-[9px] text-[#C7A86D]/40 tracking-wider">
                CHRONOS
              </div>
              
              {/* Left Crest */}
              <div className="flex justify-end pr-2">
                <Shield className="w-10 h-10 text-[#C7A86D]/50 stroke-[1]" />
              </div>

              <div className="border-t border-[#C7A86D]/20 pt-2 text-center text-[9px] text-[#C7A86D]/40 tracking-wider">
                ARCHIVE I
              </div>
            </div>
          </motion.div>

          {/* Right Door */}
          <motion.div
            animate={{
              rotateY: doorState === 'opened' ? 110 : 0,
              skewY: doorState === 'opened' ? 15 : 0,
              x: doorState === 'opened' ? '40%' : '0%',
              opacity: doorState === 'opened' ? 0.15 : 1,
            }}
            transition={{
              duration: 2.2,
              ease: [0.77, 0, 0.175, 1],
            }}
            style={{ transformOrigin: 'right center', perspective: 1000 }}
            className="w-1/2 h-full bg-[#111512] border-l border-[#C7A86D]/40 flex flex-col justify-between p-4 relative cursor-pointer"
            onClick={handleUnseal}
          >
            {/* Antique filigree layout */}
            <div className="absolute inset-2 border border-[#C7A86D]/10 pointer-events-none" />
            <div className="absolute top-4 right-4 text-[#C7A86D]/20 font-serif text-sm">𝔙</div>
            <div className="absolute bottom-4 right-4 text-[#C7A86D]/20 font-serif text-sm">𝔉</div>

            {/* Weathered gold engraving details */}
            <div className="w-full h-full flex flex-col justify-between border border-[#C7A86D]/15 p-2 rounded-sm bg-gradient-to-b from-[#161d18]/40 to-[#0d120e]/60">
              <div className="border-b border-[#C7A86D]/20 pb-2 text-center text-[9px] text-[#C7A86D]/40 tracking-wider">
                FILLORY NIEL
              </div>

              {/* Right Crest */}
              <div className="flex justify-start pl-2">
                <Wand2 className="w-10 h-10 text-[#C7A86D]/50 stroke-[1]" />
              </div>

              <div className="border-t border-[#C7A86D]/20 pt-2 text-center text-[9px] text-[#C7A86D]/40 tracking-wider">
                ARCHIVE II
              </div>
            </div>
          </motion.div>

          {/* Central Magical Lock Signet */}
          <AnimatePresence>
            {doorState !== 'opened' && (
              <motion.div
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
                onClick={handleUnseal}
                className="absolute inset-0 flex items-center justify-center pointer-events-auto cursor-pointer z-20 group"
              >
                {/* Outer Ring */}
                <motion.div
                  animate={{
                    rotate: doorState === 'unsealing' ? 360 : 0,
                    scale: doorState === 'unsealing' ? 1.2 : 1,
                  }}
                  transition={{
                    rotate: { duration: 1.2, ease: 'easeInOut' },
                    scale: { duration: 0.4 },
                  }}
                  className="w-24 h-24 rounded-full border border-[#C7A86D] bg-[#0B0C0A] flex items-center justify-center shadow-[0_0_30px_rgba(199,168,109,0.3)] relative"
                >
                  {/* Rotating Arcane Runes */}
                  <div className="absolute inset-1 rounded-full border border-dashed border-[#C7A86D]/30 animate-[spin_20s_linear_infinite]" />
                  <div className="absolute inset-3 rounded-full border border-dashed border-[#C7A86D]/50 animate-[spin_12s_linear_infinite_reverse]" />

                  {/* Lock Core Icon */}
                  <div className="relative z-10 p-4 bg-[#111512] rounded-full border border-[#C7A86D]/40 group-hover:border-[#C7A86D] transition-colors">
                    {doorState === 'unsealing' ? (
                      <Sparkles className="w-8 h-8 text-[#E9DFC8] animate-pulse" />
                    ) : (
                      <LockKeyhole className="w-8 h-8 text-[#C7A86D] group-hover:text-[#E9DFC8] transition-colors" />
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Interactive Prompt & Text */}
        <div className="text-center h-24 flex flex-col justify-center items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={welcomeText}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.5 }}
              className="space-y-2"
            >
              <h1 className="font-serif text-2xl tracking-wide text-[#E9DFC8]">
                {welcomeText}
              </h1>
              <p className="text-xs text-[#9E9E8E] tracking-wider max-w-sm font-light leading-relaxed">
                {subText}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Action button if locked */}
          {doorState === 'locked' && (
            <motion.button
              onClick={handleUnseal}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-4 px-6 py-2 border border-[#C7A86D] rounded-full text-[10px] tracking-[0.2em] uppercase text-[#E9DFC8] bg-[#C7A86D]/10 hover:bg-[#C7A86D]/20 transition-all font-sans cursor-pointer shadow-[0_0_15px_rgba(199,168,109,0.15)]"
            >
              Unseal the Vault
            </motion.button>
          )}
        </div>

      </div>
    </div>
  );
}
