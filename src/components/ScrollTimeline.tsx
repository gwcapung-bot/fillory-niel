import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Compass, ArrowLeft, ChevronRight, FileText, Play } from 'lucide-react';
import { MemoryItem } from '../types';

interface ScrollTimelineProps {
  memories: MemoryItem[];
  onSelectPhoto: (item: MemoryItem) => void;
  onSelectVideo: (item: MemoryItem) => void;
}

export default function ScrollTimeline({
  memories,
  onSelectPhoto,
  onSelectVideo,
}: ScrollTimelineProps) {
  const [selectedYear, setSelectedYear] = useState<string>('2024');

  // List of unique years in our memories
  const years = useMemo(() => {
    const yearsSet = new Set<string>();
    memories.forEach(m => {
      const yr = m.date.substring(0, 4);
      if (yr) yearsSet.add(yr);
    });
    return Array.from(yearsSet).sort((a, b) => b.localeCompare(a)); // Descending chronological order
  }, [memories]);

  // Memories matching current year
  const yearMemories = useMemo(() => {
    return memories.filter(m => m.date.startsWith(selectedYear));
  }, [memories, selectedYear]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-8 relative z-10" id="scroll-timeline">
      
      {/* Scroll Header */}
      <div className="text-center space-y-1 max-w-md mx-auto relative z-10">
        <span className="font-sans text-[10px] text-[#C7A86D] tracking-[0.4em] uppercase block">
          Chronological Parchment Scroll
        </span>
        <h2 className="font-serif text-3xl text-[#E9DFC8] font-bold">MEMORY TIME TRAVEL</h2>
        <p className="text-xs text-[#9E9E8E] font-serif italic">
          Roll the ancient time scroll to travel through history. Filter your archives based on standard calendars.
        </p>
      </div>

      {/* 1. Parchment Scroll UI Controls */}
      <div className="relative w-full max-w-3xl mx-auto py-6 px-12 bg-gradient-to-r from-[#18120B] via-[#2A1E14] to-[#18120B] border border-[#C7A86D]/30 rounded-lg shadow-2xl flex items-center justify-between overflow-hidden">
        
        {/* Ancient Scroll roll graphic handles (left and right) */}
        <div className="absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r from-[#0C0805] via-[#2C1D13] to-transparent border-r border-[#C7A86D]/20 shadow-xl flex items-center justify-center">
          <div className="w-3.5 h-[90%] rounded bg-gradient-to-b from-[#C7A86D] via-[#4A3423] to-[#C7A86D] border border-[#E9DFC8]/30" />
        </div>

        <div className="absolute top-0 bottom-0 right-0 w-8 bg-gradient-to-l from-[#0C0805] via-[#2C1D13] to-transparent border-l border-[#C7A86D]/20 shadow-xl flex items-center justify-center">
          <div className="w-3.5 h-[90%] rounded bg-gradient-to-b from-[#C7A86D] via-[#4A3423] to-[#C7A86D] border border-[#E9DFC8]/30" />
        </div>

        {/* Scroll Internal Parchment Content */}
        <div className="flex-1 flex justify-around items-center px-6 relative z-10">
          {years.map((yr) => {
            const isSelected = selectedYear === yr;

            return (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`relative py-3 px-6 rounded transition-all font-serif text-lg font-bold uppercase tracking-widest cursor-pointer ${
                  isSelected
                    ? 'text-[#111512] bg-gradient-to-b from-[#E9DFC8] to-[#C7A86D] shadow-[0_4px_15px_rgba(199,168,109,0.3)] scale-110'
                    : 'text-[#C7A86D] hover:text-[#E9DFC8]'
                }`}
              >
                {isSelected && (
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-[8px] font-sans font-extrabold tracking-widest text-[#C7A86D] animate-pulse">
                    ACTIVE
                  </div>
                )}
                <span>YEAR {yr}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Chronological Memories Horizontal Carousel */}
      <div className="space-y-4">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <span className="font-sans text-[9px] uppercase tracking-[0.2em] text-[#C7A86D]">
            Chronicles from {selectedYear}
          </span>
          <span className="text-[10px] text-[#9E9E8E] font-mono">
            {yearMemories.length} scrolls matching
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <AnimatePresence mode="popLayout">
            {yearMemories.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                onClick={() => {
                  if (item.type === 'video') {
                    onSelectVideo(item);
                  } else {
                    onSelectPhoto(item);
                  }
                }}
                className="bg-[#111512] border border-[#C7A86D]/25 rounded-lg overflow-hidden cursor-pointer hover:border-[#C7A86D]/65 hover:shadow-[0_0_20px_rgba(199,168,109,0.15)] transition-all group flex flex-col justify-between"
              >
                {/* Antique corners */}
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111512] to-transparent pointer-events-none" />

                  {item.type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="p-2.5 rounded-full bg-[#111512]/80 border border-[#C7A86D] text-[#C7A86D]">
                        <Play className="w-4 h-4 fill-[#C7A86D]" />
                      </div>
                    </div>
                  )}

                  <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded bg-[#111512] border border-[#C7A86D]/30 text-[8px] font-mono text-[#C7A86D] uppercase">
                    {item.date}
                  </span>
                </div>

                <div className="p-4 space-y-1.5 bg-[#111512]">
                  <h4 className="font-serif text-sm font-bold text-[#E9DFC8] truncate group-hover:text-[#C7A86D] transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-xs text-[#9E9E8E] line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
}
