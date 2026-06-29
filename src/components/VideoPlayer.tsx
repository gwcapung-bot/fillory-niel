import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, Volume2, VolumeX, SkipBack, Maximize2, Sparkles, Film, ArrowLeft } from 'lucide-react';
import { MemoryItem } from '../types';

interface VideoPlayerProps {
  item: MemoryItem;
  onBackToGallery: () => void;
}

export default function VideoPlayer({ item, onBackToGallery }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:30');
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; scale: number }[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);

  // Toggle Play State
  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().catch(err => console.log('Video play error:', err));
      setIsPlaying(true);
      triggerGoldBurst();
    }
  };

  // Toggle Mute State
  const handleMuteToggle = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Video time update logic
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;

    const current = video.currentTime;
    const dur = video.duration || 30;
    setProgress((current / dur) * 100);

    // Format current time
    const curMin = Math.floor(current / 60);
    const curSec = Math.floor(current % 60);
    setCurrentTime(`${curMin}:${curSec < 10 ? '0' : ''}${curSec}`);
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;
    const dur = video.duration || 30;
    const durMin = Math.floor(dur / 60);
    const durSec = Math.floor(dur % 60);
    setDuration(`${durMin}:${durSec < 10 ? '0' : ''}${durSec}`);
  };

  // Click on seekbar
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    const seekbar = e.currentTarget;
    if (!video || !seekbar) return;

    const rect = seekbar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const clickPercent = clickX / width;

    video.currentTime = clickPercent * video.duration;
    setProgress(clickPercent * 100);
  };

  // Burst particles outward from behind the frame
  const triggerGoldBurst = () => {
    const newParticles = [...Array(15)].map((_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 120, // offset range
      y: (Math.random() - 0.5) * 80,
      scale: Math.random() * 1.5 + 0.5,
    }));
    setParticles(prev => [...prev, ...newParticles]);

    // Clear particles after animation
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 1800);
  };

  // Spawn periodic particles while playing
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      const p = {
        id: Date.now(),
        x: (Math.random() - 0.5) * 200,
        y: (Math.random() - 0.5) * 150,
        scale: Math.random() * 1 + 0.5,
      };
      setParticles(prev => [...prev, p]);
      setTimeout(() => {
        setParticles(prev => prev.filter(np => np.id !== p.id));
      }, 1600);
    }, 350);

    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 relative z-10 flex flex-col items-center justify-center space-y-6" id="video-player">
      
      {/* Upper Navigation & Branding */}
      <div className="w-full flex justify-between items-center max-w-4xl border-b border-[#C7A86D]/20 pb-4">
        <button
          onClick={onBackToGallery}
          className="flex items-center space-x-2 text-xs uppercase tracking-widest text-[#9E9E8E] hover:text-[#C7A86D] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Vault Catalog</span>
        </button>

        <div className="flex items-center space-x-2 text-[#C7A86D]">
          <Film className="w-4 h-4" />
          <span className="font-sans text-[10px] uppercase tracking-[0.25em] font-semibold">
            THE MEMORY THEATER
          </span>
        </div>
      </div>

      {/* Main Player Area */}
      <div className="relative w-full max-w-4xl aspect-video rounded-lg overflow-visible flex items-center justify-center">
        
        {/* Blurry dark forest backdrop silhouette effect */}
        <div className="absolute -inset-4 bg-[radial-gradient(circle_at_center,rgba(199,168,109,0.04)_0%,transparent_85%)] filter blur-xl pointer-events-none" />

        {/* Floating Gold Particles (emerging from behind the frame) */}
        <div className="absolute inset-0 pointer-events-none overflow-visible flex items-center justify-center z-0">
          <AnimatePresence>
            {particles.map((p) => (
              <motion.div
                key={p.id}
                initial={{ x: 0, y: 0, opacity: 1, scale: p.scale }}
                animate={{
                  x: p.x * 2.8,
                  y: p.y * 2.4 - 150, // drift upward
                  opacity: 0,
                  scale: 0.1,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                className="absolute w-2.5 h-2.5 rounded-full bg-gradient-to-r from-[#F7EDD5] to-[#C7A86D] shadow-[0_0_12px_#D7BB7A] z-0"
              />
            ))}
          </AnimatePresence>
        </div>

        {/* The Enchanted Frame */}
        <div className="absolute inset-0 border-[3px] border-[#C7A86D]/45 rounded-lg pointer-events-none z-10 shadow-[0_15px_50px_rgba(0,0,0,0.85)]">
          {/* Filigree gold accents */}
          <div className="absolute inset-1.5 border border-[#C7A86D]/15 rounded" />
          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#C7A86D]" />
          <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#C7A86D]" />
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#C7A86D]" />
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#C7A86D]" />
        </div>

        {/* The HTML5 Video Element */}
        <video
          ref={videoRef}
          src={item.url}
          poster={item.thumbnailUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onClick={handlePlayPause}
          className="w-full h-full object-cover rounded-lg relative z-5 cursor-pointer bg-[#0B0C0A]"
          loop
          playsInline
        />

        {/* Big play overlay centered, shown only when paused */}
        {!isPlaying && (
          <button
            onClick={handlePlayPause}
            className="absolute z-20 p-5 rounded-full border border-[#C7A86D] bg-[#111512]/95 text-[#C7A86D] hover:scale-110 hover:shadow-[0_0_20px_rgba(199,168,109,0.5)] transition-all cursor-pointer shadow-xl flex items-center justify-center"
          >
            <Play className="w-8 h-8 fill-[#C7A86D] ml-1" />
          </button>
        )}
      </div>

      {/* Video Custom Controller Panel */}
      <div className="w-full max-w-4xl bg-[#111512] border border-[#C7A86D]/30 rounded-lg p-4 space-y-4 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
        
        {/* A. Seekbar Slider */}
        <div className="space-y-1">
          <div
            onClick={handleSeek}
            className="w-full bg-[#1A221C] h-1.5 rounded-full cursor-pointer relative border border-[#C7A86D]/15 group overflow-visible"
          >
            {/* Hover preview line or stardust glow tracker */}
            <div
              className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-[#D7BB7A] to-[#C7A86D] rounded-full shadow-[0_0_8px_rgba(199,168,109,0.8)]"
              style={{ width: `${progress}%` }}
            />
            {/* Glowing seeker circular handle */}
            <div
              className="absolute -top-1 w-3.5 h-3.5 rounded-full bg-[#E9DFC8] border-2 border-[#C7A86D] shadow-[0_0_6px_#D7BB7A] transition-all -translate-x-1/2 scale-0 group-hover:scale-100"
              style={{ left: `${progress}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[10px] font-mono text-[#9E9E8E]">
            <span>{currentTime}</span>
            <span>{duration}</span>
          </div>
        </div>

        {/* B. Buttons Panel */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            {/* Play Button */}
            <button
              onClick={handlePlayPause}
              className="text-[#C7A86D] hover:text-[#E9DFC8] transition-colors cursor-pointer"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-[#C7A86D]" /> : <Play className="w-5 h-5 fill-[#C7A86D]" />}
            </button>

            {/* Mute Button */}
            <button
              onClick={handleMuteToggle}
              className="text-[#C7A86D] hover:text-[#E9DFC8] transition-colors cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>

          {/* Video Metadata / Title Readout */}
          <div className="hidden sm:block text-center font-serif text-sm text-[#E9DFC8] italic max-w-sm truncate">
            {item.title}
          </div>

          {/* Fullscreen and special sparkler details */}
          <div className="flex items-center space-x-3 text-[#C7A86D]">
            <button
              onClick={triggerGoldBurst}
              className="p-1.5 rounded bg-[#C7A86D]/5 border border-[#C7A86D]/20 hover:border-[#C7A86D] transition-all cursor-pointer flex items-center justify-center"
              title="Release Golden Sparks"
            >
              <Sparkles className="w-4 h-4" />
            </button>
            <span className="text-[10px] font-mono tracking-widest text-[#9E9E8E]">60 FPS</span>
          </div>
        </div>

      </div>

      {/* Description under theater */}
      <div className="w-full max-w-4xl p-5 bg-[#111512]/40 border border-[#C7A86D]/15 rounded-lg space-y-2">
        <div className="text-[9px] font-mono tracking-wider text-[#C7A86D] uppercase font-bold">
          ARCHIVAL NOTE SCROLL
        </div>
        <p className="font-serif italic text-[#E9DFC8]/90 text-sm leading-relaxed">
          "{item.description}"
        </p>
        <div className="flex gap-1.5 pt-1">
          {item.tags.map(t => (
            <span key={t} className="px-2 py-0.5 border border-[#C7A86D]/10 bg-[#111512] rounded text-[10px] text-[#9E9E8E]">
              #{t}
            </span>
          ))}
        </div>
      </div>

    </div>
  );
}
