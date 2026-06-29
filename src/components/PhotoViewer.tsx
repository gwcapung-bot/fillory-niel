import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw, ArrowLeft, Maximize2, Sparkles, Image as ImageIcon } from 'lucide-react';
import { MemoryItem } from '../types';

interface PhotoViewerProps {
  item: MemoryItem;
  photos: MemoryItem[];
  onBackToGallery: () => void;
  onSelectPhoto: (photo: MemoryItem) => void;
}

export default function PhotoViewer({
  item,
  photos,
  onBackToGallery,
  onSelectPhoto,
}: PhotoViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [isAssembled, setIsAssembled] = useState(false);
  const [glitters, setGlitters] = useState<{ id: number; style: React.CSSProperties }[]>([]);

  // Find index of current photo
  const currentIndex = photos.findIndex(p => p.id === item.id);

  // Handlers for sliding left/right
  const handlePrev = () => {
    setZoom(1);
    setIsAssembled(false);
    const prevIndex = (currentIndex - 1 + photos.length) % photos.length;
    onSelectPhoto(photos[prevIndex]);
  };

  const handleNext = () => {
    setZoom(1);
    setIsAssembled(false);
    const nextIndex = (currentIndex + 1) % photos.length;
    onSelectPhoto(photos[nextIndex]);
  };

  // Double tap to zoom toggle
  const handleDoubleTap = () => {
    setZoom(prev => (prev === 1 ? 2 : 1));
  };

  // Assemble frame sequence from golden sparkles on mount
  useEffect(() => {
    // Generate scattered glitter particles starting outer and closing in
    const items = [...Array(16)].map((_, i) => {
      const angle = (i / 16) * Math.PI * 2;
      const xStart = Math.cos(angle) * 150;
      const yStart = Math.sin(angle) * 150;

      return {
        id: i,
        style: {
          left: `calc(50% + ${xStart}px)`,
          top: `calc(50% + ${yStart}px)`,
          transform: 'translate(-50%, -50%)',
          animation: `assembleParticle 1.4s ease-out forwards`,
          animationDelay: `${i * 0.05}s`,
        } as React.CSSProperties,
      };
    });

    setGlitters(items);

    // Complete assembly state
    const timer = setTimeout(() => {
      setIsAssembled(true);
    }, 1800);

    return () => clearTimeout(timer);
  }, [item.id]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 relative z-10 flex flex-col items-center justify-center space-y-6" id="photo-viewer">
      
      {/* 1. Header controls */}
      <div className="w-full flex justify-between items-center max-w-4xl border-b border-[#C7A86D]/20 pb-4">
        <button
          onClick={onBackToGallery}
          className="flex items-center space-x-2 text-xs uppercase tracking-widest text-[#9E9E8E] hover:text-[#C7A86D] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </button>

        <div className="flex items-center space-x-2 text-[#C7A86D]">
          <ImageIcon className="w-4 h-4" />
          <span className="font-sans text-[10px] uppercase tracking-[0.25em] font-semibold">
            MUSEUM PRESENTATION
          </span>
        </div>
      </div>

      {/* 2. Main Stage with Left/Right arrows */}
      <div className="w-full flex items-center justify-center max-w-5xl gap-4">
        
        {/* Left Arrow Button */}
        <button
          onClick={handlePrev}
          className="p-3.5 rounded-full border border-[#C7A86D]/20 bg-[#111512]/60 hover:bg-[#111512] hover:border-[#C7A86D]/50 text-[#C7A86D] transition-all cursor-pointer shadow-lg hidden md:block"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Floating Frame Stage */}
        <div className="relative w-full max-w-3xl aspect-[4/3] flex items-center justify-center overflow-visible">
          
          {/* Assembling gold particles visual layer */}
          {!isAssembled && (
            <div className="absolute inset-0 z-20 pointer-events-none overflow-visible">
              {glitters.map((gl) => (
                <div
                  key={gl.id}
                  style={gl.style}
                  className="absolute w-2 h-2 rounded-full bg-[#D7BB7A] shadow-[0_0_8px_#E9DFC8] blur-[0.5px]"
                />
              ))}
            </div>
          )}

          {/* Golden Frame Border (assembles itself: opacity scales up) */}
          <motion.div
            initial={{ opacity: 0.1, scale: 0.98 }}
            animate={{
              opacity: isAssembled ? 1 : 0.4,
              scale: isAssembled ? 1 : 0.98,
              boxShadow: isAssembled ? '0 15px 45px rgba(0,0,0,0.8)' : 'none',
            }}
            transition={{ duration: 1 }}
            className={`absolute inset-0 border-[4px] rounded-lg pointer-events-none z-10 transition-colors ${
              isAssembled ? 'border-[#C7A86D]' : 'border-[#C7A86D]/30'
            }`}
          >
            {/* Fine filigree line details */}
            <div className="absolute inset-2 border border-[#C7A86D]/25 rounded" />
            
            {/* Corners */}
            <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-[#E9DFC8]" />
            <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-[#E9DFC8]" />
            <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-[#E9DFC8]" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-[#E9DFC8]" />
          </motion.div>

          {/* Photo container */}
          <div
            onDoubleClick={handleDoubleTap}
            className="w-full h-full rounded-lg bg-[#0B0C0A] overflow-hidden relative flex items-center justify-center select-none"
          >
            <motion.img
              src={item.url}
              alt={item.title}
              animate={{ scale: zoom }}
              transition={{ type: 'spring', damping: 25 }}
              className="w-full h-full object-cover rounded-lg cursor-zoom-in"
              referrerPolicy="no-referrer"
            />

            {/* Depth fade overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C0A]/35 to-transparent pointer-events-none" />

            {/* Micro badge indicator */}
            <div className="absolute bottom-4 left-4 z-20 px-3 py-1 rounded bg-[#111512]/90 border border-[#C7A86D]/30 text-[8px] font-mono tracking-widest text-[#C7A86D] uppercase">
              {item.chapter} • SCROLL {currentIndex + 1}
            </div>
          </div>

        </div>

        {/* Right Arrow Button */}
        <button
          onClick={handleNext}
          className="p-3.5 rounded-full border border-[#C7A86D]/20 bg-[#111512]/60 hover:bg-[#111512] hover:border-[#C7A86D]/50 text-[#C7A86D] transition-all cursor-pointer shadow-lg hidden md:block"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

      </div>

      {/* Mobile-friendly Arrow Controls */}
      <div className="flex md:hidden justify-center items-center space-x-6">
        <button
          onClick={handlePrev}
          className="px-6 py-2.5 rounded-full border border-[#C7A86D]/30 bg-[#111512] text-[#C7A86D] text-xs font-sans uppercase tracking-widest cursor-pointer"
        >
          Prev
        </button>
        <button
          onClick={handleNext}
          className="px-6 py-2.5 rounded-full border border-[#C7A86D]/30 bg-[#111512] text-[#C7A86D] text-xs font-sans uppercase tracking-widest cursor-pointer"
        >
          Next
        </button>
      </div>

      {/* 3. Interactive controls (Zoom, Rotation, etc.) */}
      <div className="flex items-center space-x-3 bg-[#111512] border border-[#C7A86D]/30 rounded-full px-5 py-2 shadow-lg">
        <button
          onClick={() => setZoom(prev => Math.min(prev + 0.5, 3))}
          className="p-2 text-[#C7A86D] hover:text-[#E9DFC8] transition-colors cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom(prev => Math.max(prev - 0.5, 1))}
          className="p-2 text-[#C7A86D] hover:text-[#E9DFC8] transition-colors cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom(1)}
          className="p-2 text-[#C7A86D] hover:text-[#E9DFC8] transition-colors cursor-pointer"
          title="Reset Zoom"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* 4. Captions description display */}
      <div className="w-full max-w-3xl p-6 bg-[#111512] border border-[#C7A86D]/20 rounded-lg space-y-2 text-center relative overflow-hidden shadow-xl">
        <div className="absolute inset-1 border border-[#C7A86D]/5 pointer-events-none rounded" />
        
        <h3 className="font-serif text-lg text-[#E9DFC8] font-bold tracking-tight">
          {item.title}
        </h3>
        <p className="font-serif italic text-[#9E9E8E] text-xs font-light">
          Archived: {item.date} under "{item.chapter}"
        </p>
        <div className="h-[1px] w-12 bg-[#C7A86D]/30 mx-auto my-2" />
        <p className="font-serif text-sm text-[#E9DFC8]/90 italic max-w-xl mx-auto leading-relaxed">
          "{item.description}"
        </p>
      </div>

      {/* Custom keyframes injection for assembling animation */}
      <style>{`
        @keyframes assembleParticle {
          0% {
            opacity: 0;
            scale: 2;
          }
          60% {
            opacity: 1;
            scale: 1;
          }
          100% {
            left: 50%;
            top: 50%;
            opacity: 0;
            scale: 0.1;
          }
        }
      `}</style>

    </div>
  );
}
