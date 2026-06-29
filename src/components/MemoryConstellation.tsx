import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Compass, Eye, Calendar, Tag } from 'lucide-react';
import { MemoryItem } from '../types';

interface MemoryConstellationProps {
  memories: MemoryItem[];
  onSelectPhoto: (item: MemoryItem) => void;
  onSelectVideo: (item: MemoryItem) => void;
}

export default function MemoryConstellation({
  memories,
  onSelectPhoto,
  onSelectVideo,
}: MemoryConstellationProps) {
  const [hoveredStar, setHoveredStar] = useState<MemoryItem | null>(null);

  // Sort memories by date to connect them chronologically and make beautiful patterns
  const connectedStarPairs = useMemo(() => {
    const sorted = [...memories].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const pairs: { x1: number; y1: number; x2: number; y2: number }[] = [];

    for (let i = 0; i < sorted.length - 1; i++) {
      // Connect stars if they are somewhat close or in chronological sequence
      pairs.push({
        x1: sorted[i].constellationPos.x,
        y1: sorted[i].constellationPos.y,
        x2: sorted[i + 1].constellationPos.x,
        y2: sorted[i + 1].constellationPos.y,
      });
    }

    // Wrap connect first and last to close the circle constellation
    if (sorted.length > 2) {
      pairs.push({
        x1: sorted[sorted.length - 1].constellationPos.x,
        y1: sorted[sorted.length - 1].constellationPos.y,
        x2: sorted[0].constellationPos.x,
        y2: sorted[0].constellationPos.y,
      });
    }

    return pairs;
  }, [memories]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-8 relative z-10 flex flex-col items-center justify-center min-h-[85vh]" id="memory-constellation">
      
      {/* Description Header */}
      <div className="text-center space-y-1 max-w-md mx-auto relative z-10">
        <span className="font-sans text-[10px] text-[#C7A86D] tracking-[0.4em] uppercase block">
          Astral Coordinate Memory Chart
        </span>
        <h2 className="font-serif text-3xl text-[#E9DFC8] font-bold">MEMORY CONSTELLATIONS</h2>
        <p className="text-xs text-[#9E9E8E] font-serif italic">
          Hover over glowing stars to align your lenses. Explore your historical scrolls as brilliant golden stars linked in the heavens.
        </p>
      </div>

      {/* Constellation Canvas Display Stage */}
      <div className="relative w-full max-w-4xl aspect-[16/10] bg-[#111512]/30 border border-[#C7A86D]/20 rounded-lg overflow-hidden shadow-[inset_0_0_50px_rgba(0,0,0,0.8),0_15px_35px_rgba(0,0,0,0.6)]">
        {/* Sky Dust / Star Grid background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(199,168,109,0.02)_0%,transparent_80%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(199,168,109,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

        {/* SVG lines drawing constellations */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <defs>
            <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C7A86D" stopOpacity="0.15" />
              <stop offset="50%" stopColor="#D7BB7A" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#C7A86D" stopOpacity="0.15" />
            </linearGradient>
          </defs>

          {/* Draw connecting lines */}
          {connectedStarPairs.map((pair, idx) => (
            <motion.line
              key={idx}
              x1={`${pair.x1}%`}
              y1={`${pair.y1}%`}
              x2={`${pair.x2}%`}
              y2={`${pair.y2}%`}
              stroke="url(#glowGrad)"
              strokeWidth="1.2"
              strokeDasharray="4 4"
              initial={{ strokeDashoffset: 100 }}
              animate={{ strokeDashoffset: 0 }}
              transition={{ duration: 20, ease: 'linear', repeat: Infinity }}
            />
          ))}
        </svg>

        {/* Floating Stars */}
        <div className="absolute inset-0 w-full h-full">
          {memories.map((star) => {
            const isHovered = hoveredStar?.id === star.id;

            return (
              <div
                key={star.id}
                style={{
                  left: `${star.constellationPos.x}%`,
                  top: `${star.constellationPos.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                className="absolute z-10"
              >
                {/* Glowing Aura ring on hover */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 2.2, opacity: 0.45 }}
                      exit={{ opacity: 0 }}
                      className="absolute -inset-4 rounded-full bg-gradient-to-r from-[#D7BB7A] to-[#C7A86D] blur-[4px]"
                    />
                  )}
                </AnimatePresence>

                {/* Core Star Button */}
                <button
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(null)}
                  onClick={() => {
                    if (star.type === 'video') {
                      onSelectVideo(star);
                    } else {
                      onSelectPhoto(star);
                    }
                  }}
                  className={`w-3.5 h-3.5 rounded-full border border-[#E9DFC8] transition-all duration-300 relative ${
                    isHovered
                      ? 'bg-white shadow-[0_0_15px_#E9DFC8] scale-125'
                      : 'bg-[#C7A86D] shadow-[0_0_6px_#C7A86D] hover:bg-white'
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* Floating Star Preview popover card details on hover */}
        <div className="absolute bottom-6 left-6 z-20 pointer-events-none">
          <AnimatePresence mode="wait">
            {hoveredStar ? (
              <motion.div
                key={hoveredStar.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="w-80 bg-[#111512]/95 border border-[#C7A86D] rounded-lg p-4 shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-md flex items-start gap-3"
              >
                {/* Miniature Circular Gold Framed Image */}
                <div className="w-16 h-16 rounded-full border border-[#C7A86D] overflow-hidden flex-shrink-0">
                  <img
                    src={hoveredStar.thumbnailUrl}
                    alt={hoveredStar.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="flex-1 space-y-1.5 pointer-events-auto">
                  <div className="space-y-0.5">
                    <span className="text-[8px] font-mono text-[#C7A86D] uppercase tracking-wider block">
                      {hoveredStar.chapter} • {hoveredStar.type === 'video' ? 'VIDEO SCROLL' : 'PHOTO SCROLL'}
                    </span>
                    <h4 className="font-serif text-xs font-bold text-[#E9DFC8] leading-tight">
                      {hoveredStar.title}
                    </h4>
                  </div>
                  <p className="text-[10px] text-[#9E9E8E] line-clamp-2 leading-normal">
                    {hoveredStar.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-[8px] text-[#C7A86D]/75 font-mono pt-1">
                    <span className="flex items-center gap-0.5">
                      <Calendar className="w-2.5 h-2.5" />
                      {hoveredStar.date}
                    </span>
                    <span className="text-[8px] font-sans font-bold uppercase hover:underline cursor-pointer">
                      Click Star to Reveal ⚜
                    </span>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.55 }}
                className="text-[9px] font-mono tracking-widest text-[#9E9E8E] uppercase"
              >
                ✦ Align Star Crosshair to Scry Memories ✦
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

    </div>
  );
}
