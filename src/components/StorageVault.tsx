import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Database, Cloud, Zap, ArrowUp, RefreshCw, Scissors, ShieldCheck, HelpCircle } from 'lucide-react';

export default function StorageVault() {
  const [expandActive, setExpandActive] = useState(false);
  const [percent, setPercent] = useState(72);
  const [maxStorage, setMaxStorage] = useState(500); // 500 Scroll-Terabytes (STB)
  const [showExpansionMsg, setShowExpansionMsg] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [toolProgress, setToolProgress] = useState(0);

  // Smooth floating and glow triggers
  const handleExpand = () => {
    setExpandActive(true);
    setShowExpansionMsg(true);
    setPercent(92);
    setMaxStorage(prev => prev + 100);

    setTimeout(() => {
      setExpandActive(false);
    }, 2000);

    setTimeout(() => {
      setShowExpansionMsg(false);
    }, 4500);
  };

  // Tool activation animation
  const handleRunTool = (toolName: string) => {
    setActiveTool(toolName);
    setToolProgress(0);
  };

  useEffect(() => {
    if (!activeTool) return;
    const interval = setInterval(() => {
      setToolProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            // complete
            if (activeTool === 'Duplicate Removal') {
              setPercent(prevPct => Math.max(prevPct - 8, 40));
            } else if (activeTool === 'Video Compression') {
              setPercent(prevPct => Math.max(prevPct - 12, 35));
            }
            setActiveTool(null);
          }, 1000);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
    return () => clearInterval(interval);
  }, [activeTool]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 relative z-10 flex flex-col md:flex-row gap-8 items-center justify-center" id="storage-vault">
      
      {/* Left Column: Core floating crystal orb container */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center space-y-6">
        <div className="text-center space-y-1">
          <span className="font-sans text-[10px] text-[#C7A86D] tracking-[0.4em] uppercase block">
            Archival Repository Capacity
          </span>
          <h2 className="font-serif text-3xl text-[#E9DFC8] font-bold">THE ARCANE STORAGE</h2>
        </div>

        {/* The Crystal Display Container */}
        <div className="relative w-80 h-80 flex items-center justify-center">
          {/* Outer glowing magic ring */}
          <div className="absolute inset-0 rounded-full border border-[#C7A86D]/20 bg-[#111512]/30 flex items-center justify-center shadow-[inset_0_0_40px_rgba(199,168,109,0.05)]">
            {/* Spinning orbital rune text or dashed circles */}
            <div className="absolute inset-2 rounded-full border border-dashed border-[#C7A86D]/10 animate-[spin_40s_linear_infinite]" />
            <div className="absolute inset-4 rounded-full border border-dashed border-[#C7A86D]/30 animate-[spin_20s_linear_infinite_reverse]" />
          </div>

          {/* Floating crystal base wrapper */}
          <motion.div
            animate={{
              y: [0, -12, 0],
              boxShadow: expandActive
                ? [
                    '0 0 30px rgba(199,168,109,0.3)',
                    '0 0 70px rgba(215,187,122,0.8)',
                    '0 0 30px rgba(199,168,109,0.3)',
                  ]
                : ['0 0 20px rgba(199,168,109,0.1)', '0 0 40px rgba(199,168,109,0.2)', '0 0 20px rgba(199,168,109,0.1)'],
            }}
            transition={{
              y: { duration: 4, ease: 'easeInOut', repeat: Infinity },
              boxShadow: { duration: 2, ease: 'easeInOut', repeat: expandActive ? 0 : Infinity },
            }}
            className="w-60 h-60 rounded-full border-2 border-[#C7A86D]/50 bg-[#0B0C0A] overflow-hidden relative flex items-center justify-center group"
          >
            {/* The real generated asset */}
            <img
              src="/src/assets/images/floating_crystal_1782349946790.jpg"
              alt="Floating Arcane Crystal"
              className="absolute inset-0 w-full h-full object-cover opacity-35 filter blur-[1px] group-hover:scale-105 transition-transform duration-[4s]"
              referrerPolicy="no-referrer"
            />

            {/* Glowing Golden Liquid Wave */}
            <div
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#C7A86D]/80 via-[#D7BB7A]/50 to-[#E9DFC8]/10 transition-all duration-1000 ease-in-out border-t border-[#E9DFC8]/50 shadow-[0_-15px_30px_rgba(199,168,109,0.4)]"
              style={{
                height: `${percent}%`,
              }}
            >
              {/* Dynamic light sparkles inside the liquid */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(255,255,255,0.15)_0%,transparent_70%)] animate-pulse" />
              
              {/* Liquid Wave Ripple overlay */}
              <div className="absolute inset-0 w-[200%] h-full -top-1 bg-[url('data:image/svg+xml;utf8,<svg viewBox=%220 0 1200 120%22 xmlns=%22http://www.w3.org/2000/svg%22 preserveAspectRatio=%22none%22 style=%22width: 100%; height: 14px; fill: rgba(199, 168, 109, 0.45);%22><path d=%22M0,0 C150,90 350,-40 500,30 C650,100 850,10 1000,40 C1150,70 1350,20 1500,40 L1500,120 L0,120 Z%22/></svg>')] bg-repeat-x animate-[spin_10s_linear_infinite]" />
            </div>

            {/* Crystal Core Hologram readout */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-1">
              <span className="font-mono text-5xl font-extrabold text-[#E9DFC8] drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                {percent}%
              </span>
              <span className="font-sans text-[10px] text-[#C7A86D] tracking-[0.2em] uppercase font-bold bg-[#111512]/90 border border-[#C7A86D]/35 py-1 px-3.5 rounded-full shadow-lg">
                Liquid Energy
              </span>
            </div>

            {/* Expansive glow flash overlay */}
            <AnimatePresence>
              {expandActive && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.8 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-white mix-blend-overlay z-20"
                />
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Storage values in numeric terms */}
        <div className="text-center space-y-1 bg-[#111512]/60 border border-[#C7A86D]/20 px-5 py-3 rounded-lg min-w-[240px]">
          <div className="text-xs text-[#9E9E8E] font-serif">Used Space Breakdown</div>
          <div className="font-mono text-[#E9DFC8] text-sm">
            <span className="text-[#C7A86D] font-bold">{Math.round((percent / 100) * maxStorage)} STB</span> / {maxStorage} STB (Scroll-Terabytes)
          </div>
        </div>
      </div>

      {/* Right Column: Interactive actions panel */}
      <div className="w-full md:w-1/2 flex flex-col space-y-6">
        {/* Core Expand Button */}
        <div className="bg-[#111512] border border-[#C7A86D]/35 rounded-lg p-6 relative overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle_at_top_right,rgba(199,168,109,0.05)_0%,transparent_70%)] pointer-events-none" />

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-[#C7A86D]/10 rounded border border-[#C7A86D]/25">
                <Database className="w-5 h-5 text-[#C7A86D]" />
              </div>
              <div>
                <h3 className="font-serif text-lg text-[#E9DFC8] font-bold">Arcane expansion</h3>
                <p className="text-xs text-[#9E9E8E]">Cast the expansion incantation to widen your crystal memory wells.</p>
              </div>
            </div>

            <motion.button
              onClick={handleExpand}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 border border-[#C7A86D] rounded-full text-[10px] tracking-[0.2em] uppercase text-[#111512] font-sans font-bold bg-gradient-to-r from-[#D7BB7A] to-[#C7A86D] hover:shadow-[0_0_20px_rgba(199,168,109,0.3)] transition-all cursor-pointer flex items-center justify-center space-x-2"
            >
              <Zap className="w-4 h-4 fill-[#111512]" />
              <span>Expand the Vault (+100 STB)</span>
            </motion.button>

            <AnimatePresence>
              {showExpansionMsg && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3.5 bg-[#C7A86D]/10 border border-[#C7A86D]/35 rounded text-xs text-[#E9DFC8] font-serif italic text-center"
                >
                  ⚜ "Spell of Expansion cast successfully! An extra 100 Scroll-Terabytes have been bound to the floating crystal."
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Vault Tools Grid */}
        <div className="space-y-3">
          <h4 className="font-sans text-xs tracking-widest text-[#C7A86D] uppercase font-semibold">
            Archival Scribe Tools
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tool 1: AI Organization */}
            <div className="bg-[#111512]/60 border border-[#C7A86D]/20 hover:border-[#C7A86D]/50 rounded-lg p-4 transition-all space-y-3 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-[#C7A86D]">
                  <Sparkles className="w-4 h-4" />
                  <span className="font-serif text-sm font-bold text-[#E9DFC8]">AI Organization</span>
                </div>
                <p className="text-[11px] text-[#9E9E8E] leading-relaxed">
                  Triggers the ancient scribe to tag and sort all chaotic scrolls.
                </p>
              </div>
              <button
                onClick={() => handleRunTool('AI Organization')}
                disabled={!!activeTool}
                className="w-full py-1.5 border border-[#C7A86D]/30 rounded text-[9px] tracking-wider uppercase text-[#E9DFC8] bg-[#C7A86D]/5 hover:bg-[#C7A86D]/15 disabled:opacity-40 cursor-pointer"
              >
                Assemble Scribe
              </button>
            </div>

            {/* Tool 2: Cloud Backup */}
            <div className="bg-[#111512]/60 border border-[#C7A86D]/20 hover:border-[#C7A86D]/50 rounded-lg p-4 transition-all space-y-3 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-[#C7A86D]">
                  <Cloud className="w-4 h-4" />
                  <span className="font-serif text-sm font-bold text-[#E9DFC8]">Cloud Backup</span>
                </div>
                <p className="text-[11px] text-[#9E9E8E] leading-relaxed">
                  Binds mirror images of your storage crystal to the high heavens.
                </p>
              </div>
              <button
                onClick={() => handleRunTool('Cloud Backup')}
                disabled={!!activeTool}
                className="w-full py-1.5 border border-[#C7A86D]/30 rounded text-[9px] tracking-wider uppercase text-[#E9DFC8] bg-[#C7A86D]/5 hover:bg-[#C7A86D]/15 disabled:opacity-40 cursor-pointer"
              >
                Unseal Heavens
              </button>
            </div>

            {/* Tool 3: Video Compression */}
            <div className="bg-[#111512]/60 border border-[#C7A86D]/20 hover:border-[#C7A86D]/50 rounded-lg p-4 transition-all space-y-3 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-[#C7A86D]">
                  <Scissors className="w-4 h-4" />
                  <span className="font-serif text-sm font-bold text-[#E9DFC8]">Video Compression</span>
                </div>
                <p className="text-[11px] text-[#9E9E8E] leading-relaxed">
                  Condenses the dynamic imagery weight of movies to release space (-12%).
                </p>
              </div>
              <button
                onClick={() => handleRunTool('Video Compression')}
                disabled={!!activeTool}
                className="w-full py-1.5 border border-[#C7A86D]/30 rounded text-[9px] tracking-wider uppercase text-[#E9DFC8] bg-[#C7A86D]/5 hover:bg-[#C7A86D]/15 disabled:opacity-40 cursor-pointer"
              >
                Condense Movies
              </button>
            </div>

            {/* Tool 4: Duplicate Removal */}
            <div className="bg-[#111512]/60 border border-[#C7A86D]/20 hover:border-[#C7A86D]/50 rounded-lg p-4 transition-all space-y-3 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-[#C7A86D]">
                  <RefreshCw className="w-4 h-4" />
                  <span className="font-serif text-sm font-bold text-[#E9DFC8]">Duplicate Removal</span>
                </div>
                <p className="text-[11px] text-[#9E9E8E] leading-relaxed">
                  Sweeps the shadows to dissolve redundant spell scrolls (-8%).
                </p>
              </div>
              <button
                onClick={() => handleRunTool('Duplicate Removal')}
                disabled={!!activeTool}
                className="w-full py-1.5 border border-[#C7A86D]/30 rounded text-[9px] tracking-wider uppercase text-[#E9DFC8] bg-[#C7A86D]/5 hover:bg-[#C7A86D]/15 disabled:opacity-40 cursor-pointer"
              >
                Purge Echoes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tool Running Progress Modal Overlay */}
      <AnimatePresence>
        {activeTool && (
          <div className="fixed inset-0 bg-[#0B0C0A]/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#111512] border border-[#C7A86D] rounded-lg p-6 max-w-sm w-full text-center space-y-4 shadow-[0_0_50px_rgba(199,168,109,0.3)] relative"
            >
              {/* Gold borders */}
              <div className="absolute inset-2 border border-[#C7A86D]/10 pointer-events-none rounded" />

              <div className="w-12 h-12 rounded-full border-2 border-dashed border-[#C7A86D] border-t-transparent animate-spin mx-auto flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#C7A86D]" />
              </div>

              <div className="space-y-1">
                <h4 className="font-serif text-lg text-[#E9DFC8] font-bold">{activeTool} Active</h4>
                <p className="text-xs text-[#9E9E8E] italic">Casting the specific ritual spell...</p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="w-full bg-[#1A221C] rounded-full h-2 overflow-hidden border border-[#C7A86D]/20">
                  <div
                    className="bg-gradient-to-r from-[#D7BB7A] to-[#C7A86D] h-full transition-all duration-150"
                    style={{ width: `${toolProgress}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono text-[#C7A86D]">
                  <span>PROGRESS</span>
                  <span>{toolProgress}%</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
