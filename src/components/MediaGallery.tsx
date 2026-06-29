import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Mic, Sparkles, Filter, Calendar, FolderOpen, Play, CheckCircle2, ChevronRight, Eye, ShieldAlert, UploadCloud, X, Trash2, Film, Image as ImageIcon } from 'lucide-react';
import { MemoryItem, Chapter } from '../types';

interface MediaGalleryProps {
  memories: MemoryItem[];
  chapters: Chapter[];
  onSelectPhoto: (item: MemoryItem) => void;
  onSelectVideo: (item: MemoryItem) => void;
  onAddChapter: (newChapter: Chapter) => void;
  onUploadMemory?: (record: any) => Promise<void>;
  onDeleteMemory?: (id: string) => Promise<void>;
}

export default function MediaGallery({
  memories,
  chapters,
  onSelectPhoto,
  onSelectVideo,
  onAddChapter,
  onUploadMemory,
  onDeleteMemory,
}: MediaGalleryProps) {
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchNarrative, setSearchNarrative] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[] | null>(null);
  const [voiceActive, setVoiceActive] = useState(false);
  const [voiceText, setVoiceText] = useState('Listening to vocal incantation...');

  // Group creation states (Multi-select)
  const [isGroupingMode, setIsGroupingMode] = useState(false);
  const [selectedIdsForGroup, setSelectedIdsForGroup] = useState<string[]>([]);
  const [isCreatingChapter, setIsCreatingChapter] = useState(false);

  // Upload modal states
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string>('');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadType, setUploadType] = useState<'photo' | 'video'>('photo');
  const [uploadChapter, setUploadChapter] = useState('');
  const [uploadDate, setUploadDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadTags, setUploadTags] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-select chapter if none selected on open
  React.useEffect(() => {
    if (chapters.length > 0 && !uploadChapter) {
      setUploadChapter(chapters[0].name);
    }
  }, [chapters, uploadChapter]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadFile(file);
    const type = file.type.startsWith('video/') ? 'video' : 'photo';
    setUploadType(type);

    // Auto-fill title with capitalized filename (minus extension)
    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const cleanTitle = baseName
      .replace(/[_-]/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
    setUploadTitle(cleanTitle);

    // Create immediate local object url for preview
    const previewUrl = URL.createObjectURL(file);
    setUploadPreview(previewUrl);
    setUploadError(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      setUploadError('Tolong pilih file gambar atau video yang valid.');
      return;
    }

    setUploadFile(file);
    const type = file.type.startsWith('video/') ? 'video' : 'photo';
    setUploadType(type);

    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const cleanTitle = baseName
      .replace(/[_-]/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
    setUploadTitle(cleanTitle);

    const previewUrl = URL.createObjectURL(file);
    setUploadPreview(previewUrl);
    setUploadError(null);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadError('Tolong pilih file foto atau video dari perangkat Anda.');
      return;
    }
    if (!uploadTitle.trim()) {
      setUploadError('Tolong berikan judul untuk memori ini.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const id = `local-${Date.now()}`;
      const tagsArray = uploadTags
        .split(/[ ,]+/)
        .map(t => t.trim().toLowerCase())
        .filter(t => t.length > 0);

      // Generate random positioning for the Constellation view
      const constellationPos = {
        x: Math.floor(Math.random() * 60) + 20,
        y: Math.floor(Math.random() * 60) + 20,
      };

      if (onUploadMemory) {
        await onUploadMemory({
          id,
          title: uploadTitle.trim(),
          type: uploadType,
          file: uploadFile,
          chapter: uploadChapter,
          date: uploadDate,
          description: uploadDescription.trim() || 'No description provided.',
          tags: tagsArray.length > 0 ? tagsArray : ['local'],
          constellationPos,
        });
      }

      // Success cleanup
      setIsUploadOpen(false);
      setUploadFile(null);
      setUploadPreview('');
      setUploadTitle('');
      setUploadDescription('');
      setUploadTags('');
    } catch (err: any) {
      setUploadError(err.message || 'Gagal menyimpan berkas ke IndexedDB.');
    } finally {
      setIsUploading(false);
    }
  };

  // Active search query submit
  const handleRuneSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) {
      setMatchedIds(null);
      setSearchNarrative(null);
      return;
    }

    setIsSearching(true);
    setSearchNarrative(null);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          items: memories.map(m => ({
            id: m.id,
            title: m.title,
            type: m.type,
            chapter: m.chapter,
            date: m.date,
            description: m.description,
            tags: m.tags,
          })),
        }),
      });

      const data = await response.json();
      setMatchedIds(data.matchedIds || []);
      setSearchNarrative(data.narrative || null);
    } catch (err) {
      console.error(err);
      // Fallback local matching
      const query = searchQuery.toLowerCase();
      const localMatches = memories.filter(
        m =>
          m.title.toLowerCase().includes(query) ||
          m.description.toLowerCase().includes(query) ||
          m.tags.some(t => t.toLowerCase().includes(query))
      );
      setMatchedIds(localMatches.map(m => m.id));
      setSearchNarrative(`The Arcane Eyes of the Vault are resting. Offline filters located ${localMatches.length} matching scrolls.`);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setMatchedIds(null);
    setSearchNarrative(null);
  };

  // Simulate Voice Spell Search
  const triggerVoiceSpell = () => {
    setVoiceActive(true);
    setVoiceText('Listening for your spoken spell...');

    const phrases = [
      'Show Julia beneath the tree',
      'Show beach videos from 2024',
      'Find cozy winter hearth memories',
      'Look for coronation crowns',
    ];
    const chosenPhrase = phrases[Math.floor(Math.random() * phrases.length)];

    setTimeout(() => {
      setVoiceText(`"Reciting: ${chosenPhrase}"`);
    }, 1200);

    setTimeout(() => {
      setSearchQuery(chosenPhrase);
      setVoiceActive(false);
      // Automatically trigger search
      setIsSearching(true);
      fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: chosenPhrase,
          items: memories.map(m => ({
            id: m.id,
            title: m.title,
            type: m.type,
            chapter: m.chapter,
            date: m.date,
            description: m.description,
            tags: m.tags,
          })),
        }),
      })
        .then(res => res.json())
        .then(data => {
          setMatchedIds(data.matchedIds);
          setSearchNarrative(data.narrative);
          setIsSearching(false);
        })
        .catch(() => {
          setIsSearching(false);
        });
    }, 2500);
  };

  // Multi-select Chapter Suggestion
  const toggleSelectForGroup = (id: string) => {
    if (selectedIdsForGroup.includes(id)) {
      setSelectedIdsForGroup(selectedIdsForGroup.filter(i => i !== id));
    } else {
      setSelectedIdsForGroup([...selectedIdsForGroup, id]);
    }
  };

  const handleConjureChapter = async () => {
    if (selectedIdsForGroup.length === 0) return;
    setIsCreatingChapter(true);

    try {
      const selectedItems = memories.filter(m => selectedIdsForGroup.includes(m.id));
      const response = await fetch('/api/chapters/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: selectedItems.map(m => ({
            id: m.id,
            title: m.title,
            type: m.type,
            chapter: m.chapter,
            date: m.date,
            description: m.description,
            tags: m.tags,
          })),
        }),
      });

      const data = await response.json();

      const newChapter: Chapter = {
        id: `chap-${Date.now()}`,
        name: data.suggestedName,
        description: data.suggestedDescription,
        memoryCount: selectedIdsForGroup.length,
        coverUrl: selectedItems[0]?.thumbnailUrl || 'https://picsum.photos/seed/vault_chronicles/800/600',
        sealSymbol: data.sealSymbol || '❈',
      };

      onAddChapter(newChapter);
      setIsGroupingMode(false);
      setSelectedIdsForGroup([]);
      setSelectedChapter(newChapter.name); // immediately filter by newly created chapter
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreatingChapter(false);
    }
  };

  // Filter logic
  const filteredMemories = memories.filter(item => {
    // 1. Chapter filter
    if (selectedChapter && item.chapter !== selectedChapter) return false;
    // 2. Search ID match
    if (matchedIds && !matchedIds.includes(item.id)) return false;
    return true;
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 px-4 py-6 relative z-10" id="media-gallery">
      
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#C7A86D]/20 pb-6">
        <div className="space-y-1">
          <span className="font-sans text-[10px] text-[#C7A86D] tracking-[0.4em] uppercase block">
            Royal Archive Catalog
          </span>
          <h2 className="font-serif text-3xl md:text-4xl text-[#E9DFC8] font-bold tracking-tight">
            YOUR MEMORIES
          </h2>
          <p className="text-xs text-[#9E9E8E] font-serif italic">
            Chronicles of spellcraft, crowns, and voyages preserved in unyielding golden frames.
          </p>
        </div>

        {/* Action button toggles */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setIsUploadOpen(true);
              setUploadError(null);
            }}
            className="px-4 py-2 border border-[#C7A86D]/40 text-[#E9DFC8] bg-[#C7A86D]/10 hover:bg-[#C7A86D]/20 rounded-full text-[10px] tracking-wider uppercase font-sans cursor-pointer transition-all flex items-center space-x-2 shadow-md hover:shadow-lg"
          >
            <UploadCloud className="w-3.5 h-3.5 text-[#C7A86D]" />
            <span>Upload Memory</span>
          </button>

          <button
            onClick={() => {
              setIsGroupingMode(!isGroupingMode);
              setSelectedIdsForGroup([]);
            }}
            className={`px-4 py-2 border rounded-full text-[10px] tracking-wider uppercase font-sans cursor-pointer transition-all flex items-center space-x-2 ${
              isGroupingMode
                ? 'border-[#C7A86D] text-[#111512] bg-gradient-to-r from-[#D7BB7A] to-[#C7A86D]'
                : 'border-[#C7A86D]/30 text-[#E9DFC8] bg-[#111512]/60 hover:border-[#C7A86D]/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isGroupingMode ? 'Cancel Selection' : 'Group into Chapters'}</span>
          </button>
        </div>
      </div>

      {/* 2. Magical Rune Search Scanner */}
      <div className="relative">
        {/* Decorative rune line */}
        <div className="absolute top-0 bottom-0 left-4 w-[1px] bg-gradient-to-b from-transparent via-[#C7A86D]/20 to-transparent pointer-events-none" />

        <form onSubmit={handleRuneSearch} className="flex gap-2 max-w-3xl mx-auto relative">
          <div className="relative flex-1 bg-[#111512] border border-[#C7A86D]/30 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.5)] focus-within:border-[#C7A86D] transition-all overflow-hidden flex items-center pr-3">
            {/* Input icon */}
            <div className="pl-4 pr-2 text-[#C7A86D]/60">
              <Search className="w-4 h-4" />
            </div>

            {/* Input Element */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search with magic rune scanner... (e.g. 'Julia' or 'beach from 2024')"
              className="flex-1 bg-transparent py-4 text-sm text-[#E9DFC8] focus:outline-none placeholder-[#9E9E8E]/40 font-serif italic"
              id="rune-scanner-input"
            />

            {/* Clear Button */}
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="text-xs text-[#9E9E8E] hover:text-[#E9DFC8] mr-2 uppercase tracking-widest font-sans cursor-pointer"
              >
                Clear
              </button>
            )}

            {/* Crystal Orb Mic button */}
            <button
              type="button"
              onClick={triggerVoiceSpell}
              className={`p-2.5 rounded-full border cursor-pointer transition-all ${
                voiceActive
                  ? 'bg-radial from-[#F7EDD5] to-[#C7A86D] text-[#111512] border-[#C7A86D] shadow-[0_0_15px_#D7BB7A]'
                  : 'bg-[#1A221C] border-[#C7A86D]/30 text-[#C7A86D] hover:border-[#C7A86D]'
              }`}
              title="Voice Spell Scanner"
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>

          <button
            type="submit"
            disabled={isSearching}
            className="px-6 rounded-lg bg-[#C7A86D]/15 hover:bg-[#C7A86D]/25 border border-[#C7A86D]/40 text-[#E9DFC8] text-xs font-sans uppercase tracking-widest transition-all cursor-pointer flex items-center space-x-2"
          >
            <span>Scan</span>
          </button>
        </form>

        {/* Voice active overlay modal */}
        <AnimatePresence>
          {voiceActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#0B0C0A]/95 z-30 rounded-lg flex flex-col items-center justify-center p-4 border border-[#C7A86D]/30 shadow-[0_0_30px_rgba(199,168,109,0.3)]"
            >
              <div className="relative w-16 h-16 flex items-center justify-center bg-[#C7A86D]/10 rounded-full border border-[#C7A86D] mb-4">
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#C7A86D] animate-[spin_6s_linear_infinite]" />
                <Mic className="w-8 h-8 text-[#D7BB7A] animate-pulse" />
              </div>
              <p className="font-serif italic text-base text-[#E9DFC8] animate-pulse">
                {voiceText}
              </p>
              {/* Vocal wavy bar visualizer */}
              <div className="flex gap-1 items-center justify-center mt-3 h-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-[#C7A86D] rounded-full animate-bounce"
                    style={{
                      height: `${Math.random() * 100}%`,
                      animationDelay: `${i * 0.15}s`,
                      animationDuration: '0.8s',
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. Search Narrative / AI response */}
      <AnimatePresence>
        {searchNarrative && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-5 rounded-lg border border-[#C7A86D]/35 bg-gradient-to-b from-[#111512] to-[#1A221C]/80 relative overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
          >
            {/* Background grid details */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(199,168,109,0.01)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
            
            <div className="flex gap-4 items-start relative z-10">
              <div className="p-2 bg-[#C7A86D]/10 rounded border border-[#C7A86D]/30 text-[#C7A86D]">
                <Sparkles className="w-5 h-5 animate-spin" style={{ animationDuration: '8s' }} />
              </div>
              <div className="space-y-2 flex-1">
                <div className="flex justify-between items-center">
                  <span className="font-sans text-[9px] uppercase tracking-[0.25em] text-[#C7A86D]">
                    Arcane Insight (AI Search Result)
                  </span>
                  <button
                    onClick={clearSearch}
                    className="text-[9px] uppercase font-mono tracking-widest text-[#9E9E8E] hover:text-[#C7A86D] cursor-pointer"
                  >
                    Reset Filter
                  </button>
                </div>
                <p className="font-serif italic text-sm text-[#E9DFC8] leading-relaxed">
                  "{searchNarrative}"
                </p>
                {matchedIds && (
                  <div className="text-[10px] text-[#9E9E8E] font-mono">
                    Found <span className="text-[#C7A86D] font-bold">{matchedIds.length}</span> scrolls match your incantation.
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Magical Chapters (Horiz Slider) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-[#C7A86D]">
            <FolderOpen className="w-4 h-4" />
            <span className="font-sans text-xs uppercase tracking-widest font-semibold">
              Magical Chapters
            </span>
          </div>
          {selectedChapter && (
            <button
              onClick={() => setSelectedChapter(null)}
              className="text-[10px] uppercase font-mono tracking-wider text-[#9E9E8E] hover:text-[#C7A86D] cursor-pointer"
            >
              Clear Filter [Show All]
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {chapters.map((chap) => {
            const isActive = selectedChapter === chap.name;
            return (
              <motion.div
                key={chap.id}
                whileHover={{ y: -4 }}
                onClick={() => setSelectedChapter(isActive ? null : chap.name)}
                className={`relative rounded-lg p-4 cursor-pointer transition-all border flex flex-col justify-between overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.3)] min-h-[120px] ${
                  isActive
                    ? 'border-[#C7A86D] bg-[#2C2314]/90'
                    : 'border-[#C7A86D]/20 bg-[#111512] hover:border-[#C7A86D]/50'
                }`}
              >
                {/* Symbol watermark */}
                <div className="absolute right-3 top-2 text-2xl text-[#C7A86D]/15 font-serif font-bold">
                  {chap.sealSymbol}
                </div>

                <div className="space-y-1 relative z-10">
                  <h4 className="font-serif text-base text-[#E9DFC8] font-bold tracking-tight">
                    {chap.name}
                  </h4>
                  <p className="text-[10px] text-[#9E9E8E] line-clamp-2 leading-relaxed">
                    {chap.description}
                  </p>
                </div>

                <div className="flex justify-between items-center mt-3 relative z-10">
                  <span className="text-[9px] text-[#C7A86D] font-mono">
                    {memories.filter(m => m.chapter === chap.name).length} SCROLLS
                  </span>
                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#C7A86D] animate-ping" />}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 5. Group Mode Controls Floating Panel */}
      <AnimatePresence>
        {isGroupingMode && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl bg-[#111512]/95 border border-[#C7A86D] rounded-full px-6 py-4 flex items-center justify-between shadow-[0_10px_40px_rgba(0,0,0,0.8)] backdrop-blur-md"
          >
            <div className="space-y-0.5">
              <span className="font-sans text-[8px] uppercase tracking-[0.2em] text-[#C7A86D] block">
                Chapter Conjuring Tool
              </span>
              <p className="text-xs text-[#E9DFC8] font-serif">
                Selected <span className="text-[#C7A86D] font-mono font-bold">{selectedIdsForGroup.length}</span> memory scrolls
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  setIsGroupingMode(false);
                  setSelectedIdsForGroup([]);
                }}
                className="px-4 py-2 text-[10px] tracking-wider uppercase text-[#9E9E8E] hover:text-[#E9DFC8] font-sans cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConjureChapter}
                disabled={selectedIdsForGroup.length === 0 || isCreatingChapter}
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#D7BB7A] to-[#C7A86D] text-[#111512] font-semibold text-[10px] uppercase tracking-[0.15em] hover:shadow-[0_0_15px_rgba(199,168,109,0.3)] disabled:opacity-40 transition-all cursor-pointer flex items-center space-x-2"
              >
                {isCreatingChapter ? (
                  <span>Conjuring...</span>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 text-[#111512]" />
                    <span>Conjure Chapter</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6. Pinterest Masonry Grid */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
        {filteredMemories.map((item, index) => {
          const isSelectedForGroup = selectedIdsForGroup.includes(item.id);

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: Math.min(index * 0.05, 0.4) }}
              whileHover={{ y: -6, scale: 1.01 }}
              onClick={() => {
                if (isGroupingMode) {
                  toggleSelectForGroup(item.id);
                } else if (item.type === 'video') {
                  onSelectVideo(item);
                } else {
                  onSelectPhoto(item);
                }
              }}
              className={`relative break-inside-avoid rounded-lg overflow-hidden border cursor-pointer transition-all duration-300 shadow-[0_10px_25px_rgba(0,0,0,0.4)] flex flex-col group ${
                isSelectedForGroup
                  ? 'border-[#C7A86D] ring-2 ring-[#C7A86D]/50'
                  : 'border-[#C7A86D]/25 bg-[#111512] hover:border-[#C7A86D]/70 hover:shadow-[0_0_30px_rgba(199,168,109,0.15)]'
              }`}
            >
              {/* Antique Gold Engraved Frame Borders */}
              <div className="absolute inset-1 border border-[#C7A86D]/15 pointer-events-none rounded-md z-10 transition-colors group-hover:border-[#C7A86D]/40" />
              <div className="absolute inset-2 border border-[#C7A86D]/5 pointer-events-none rounded z-10 transition-colors group-hover:border-[#C7A86D]/20" />

              {/* Thumbnail Container */}
              <div className="relative overflow-hidden w-full bg-[#0B0C0A] flex-shrink-0">
                {/* Stagger heights based on seed to simulate masonry variety */}
                <div
                  className="w-full relative"
                  style={{
                    aspectRatio: item.type === 'video' ? '16/9' : index % 3 === 0 ? '4/5' : index % 3 === 1 ? '1/1' : '4/3',
                  }}
                >
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-95 group-hover:brightness-100"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Subtle shadows & depth */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111512] via-transparent to-transparent opacity-80" />

                  {/* Play Overlay if Video */}
                  {item.type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#0B0C0A]/30 group-hover:bg-[#0B0C0A]/10 transition-colors">
                      <div className="p-3 rounded-full border border-[#C7A86D]/40 bg-[#111512]/80 shadow-lg text-[#C7A86D] group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-[#C7A86D] ml-0.5" />
                      </div>
                    </div>
                  )}

                  {/* Multi-select check icon */}
                  {isGroupingMode && (
                    <div className="absolute top-4 right-4 z-20">
                      {isSelectedForGroup ? (
                        <CheckCircle2 className="w-6 h-6 text-[#D7BB7A] fill-[#111512]" />
                      ) : (
                        <div className="w-6 h-6 rounded-full border border-[#C7A86D]/50 bg-[#111512]/65" />
                      )}
                    </div>
                  )}

                  {/* Delete memory button */}
                  {!isGroupingMode && onDeleteMemory && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Apakah Anda yakin ingin menghapus memori ini secara permanen?')) {
                          onDeleteMemory(item.id);
                        }
                      }}
                      className="absolute top-4 right-4 z-20 p-2 rounded-full bg-[#111512]/95 border border-red-500/40 text-red-400 hover:bg-red-950 hover:text-red-200 hover:scale-105 transition-all cursor-pointer shadow-lg"
                      title="Hapus Memori"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Type/Chapter Badge */}
                  <div className="absolute bottom-3 left-3 flex gap-2 items-center z-10">
                    <span className="px-2 py-0.5 rounded bg-[#111512]/90 border border-[#C7A86D]/30 text-[8px] font-sans tracking-widest text-[#C7A86D] uppercase">
                      {item.chapter}
                    </span>
                    <span className="text-[10px] text-[#9E9E8E] font-mono">
                      {item.type === 'video' ? '🎞️' : '📸'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Editorial Caption Area */}
              <div className="p-4 space-y-2 relative bg-[#111512]">
                <div className="flex justify-between items-start">
                  <h3 className="font-serif text-sm text-[#E9DFC8] group-hover:text-[#C7A86D] transition-colors font-semibold leading-tight line-clamp-1">
                    {item.title}
                  </h3>
                </div>

                <p className="text-xs text-[#9E9E8E] line-clamp-2 leading-relaxed">
                  {item.description}
                </p>

                <div className="flex items-center justify-between text-[9px] text-[#9E9E8E]/60 pt-2 border-t border-[#C7A86D]/10">
                  <div className="flex items-center space-x-1 font-mono">
                    <Calendar className="w-3 h-3 text-[#C7A86D]/50" />
                    <span>{item.date}</span>
                  </div>
                  <div className="flex gap-1">
                    {item.tags.slice(0, 2).map(t => (
                      <span key={t} className="px-1 border border-[#C7A86D]/10 rounded bg-[#1A221C]/20 text-[8px]">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredMemories.length === 0 && (
        <div className="text-center py-16 space-y-4">
          <div className="p-4 bg-[#111512] rounded-full border border-dashed border-[#C7A86D]/30 w-16 h-16 mx-auto flex items-center justify-center">
            <ShieldAlert className="w-8 h-8 text-[#C7A86D]/50" />
          </div>
          <h3 className="font-serif text-xl text-[#E9DFC8] font-semibold">No Archives Found</h3>
          <p className="text-sm text-[#9E9E8E] max-w-sm mx-auto">
            The scrolls you seek reside in another castle or have dissolved in stardust. Reset your rune scanner or filter chapters to show other items.
          </p>
          <button
            onClick={() => {
              clearSearch();
              setSelectedChapter(null);
            }}
            className="px-5 py-2 border border-[#C7A86D] rounded-full text-[10px] tracking-wider uppercase text-[#E9DFC8] bg-[#C7A86D]/5 hover:bg-[#C7A86D]/15 transition-all cursor-pointer"
          >
            Show All Chronicles
          </button>
        </div>
      )}

      {/* 7. Magical Upload Memory Modal Overlay */}
      <AnimatePresence>
        {isUploadOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0C0A]/85 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-3xl bg-[#111512] border border-[#C7A86D]/40 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col my-8"
            >
              {/* Antique Borders inside dialog */}
              <div className="absolute inset-1 border border-[#C7A86D]/15 pointer-events-none rounded-lg z-10" />
              <div className="absolute inset-2 border border-[#C7A86D]/5 pointer-events-none rounded-md z-10" />

              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-[#C7A86D]/20 p-5 relative z-20 bg-[#111512]">
                <div className="space-y-0.5">
                  <span className="font-sans text-[8px] text-[#C7A86D] tracking-[0.3em] uppercase block">
                    Vault Inscription Chamber
                  </span>
                  <h3 className="font-serif text-xl font-bold text-[#E9DFC8]">
                    Unggah Memori Baru
                  </h3>
                </div>
                <button
                  onClick={() => setIsUploadOpen(false)}
                  className="p-1.5 rounded-full border border-[#C7A86D]/20 text-[#9E9E8E] hover:text-[#E9DFC8] hover:border-[#C7A86D]/40 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body / Form */}
              <form onSubmit={handleUploadSubmit} className="p-6 space-y-6 relative z-20 max-h-[75vh] overflow-y-auto">
                {uploadError && (
                  <div className="p-3 bg-red-950/40 border border-red-500/30 rounded text-red-200 text-xs font-serif italic flex items-center space-x-2">
                    <span className="text-red-400">✦</span>
                    <span>{uploadError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Left Column: Drag Zone & Preview */}
                  <div className="md:col-span-5 space-y-4">
                    <label className="block text-[10px] uppercase font-sans tracking-widest text-[#C7A86D]">
                      Foto / Video Berkas
                    </label>

                    {!uploadFile ? (
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer min-h-[220px] transition-all ${
                          isDragging
                            ? 'border-[#C7A86D] bg-[#C7A86D]/10'
                            : 'border-[#C7A86D]/30 bg-[#0B0C0A]/40 hover:border-[#C7A86D]/60'
                        }`}
                      >
                        <UploadCloud className="w-10 h-10 text-[#C7A86D]/60 mb-3 animate-pulse" />
                        <p className="text-xs font-serif text-[#E9DFC8] font-bold">
                          Seret & Lepas di sini
                        </p>
                        <p className="text-[10px] text-[#9E9E8E] mt-1 font-serif italic">
                          atau klik untuk memilih dari galeri lokal
                        </p>
                        <p className="text-[9px] text-[#9E9E8E]/50 mt-3 uppercase tracking-wider font-mono">
                          Image & Video support
                        </p>
                      </div>
                    ) : (
                      <div className="relative border border-[#C7A86D]/30 rounded-lg overflow-hidden bg-[#0B0C0A] min-h-[220px] flex items-center justify-center group">
                        {uploadType === 'video' ? (
                          <video
                            src={uploadPreview}
                            controls
                            className="w-full max-h-[240px] object-contain"
                          />
                        ) : (
                          <img
                            src={uploadPreview}
                            alt="Upload preview"
                            className="w-full max-h-[240px] object-contain"
                            referrerPolicy="no-referrer"
                          />
                        )}

                        {/* Replace File trigger overlay */}
                        <div className="absolute inset-0 bg-[#0B0C0A]/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => {
                              setUploadFile(null);
                              setUploadPreview('');
                            }}
                            className="px-4 py-2 bg-red-950 border border-red-500/30 text-red-200 rounded-full text-[10px] uppercase font-sans tracking-widest hover:bg-red-900 transition-colors cursor-pointer"
                          >
                            Hapus & Ganti File
                          </button>
                        </div>
                      </div>
                    )}

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*,video/*"
                      className="hidden"
                    />
                  </div>

                  {/* Right Column: Inscription Fields */}
                  <div className="md:col-span-7 space-y-4">
                    {/* Title */}
                    <div className="space-y-1">
                      <label className="block text-[10px] uppercase font-sans tracking-widest text-[#C7A86D]">
                        Judul Memori
                      </label>
                      <input
                        type="text"
                        required
                        value={uploadTitle}
                        onChange={(e) => setUploadTitle(e.target.value)}
                        placeholder="Nama dari rekaman ini..."
                        className="w-full bg-[#0B0C0A]/60 border border-[#C7A86D]/30 rounded px-3 py-2 text-sm text-[#E9DFC8] focus:outline-none focus:border-[#C7A86D] font-serif italic"
                      />
                    </div>

                    {/* Date & Chapter */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[10px] uppercase font-sans tracking-widest text-[#C7A86D]">
                          Tanggal
                        </label>
                        <input
                          type="date"
                          required
                          value={uploadDate}
                          onChange={(e) => setUploadDate(e.target.value)}
                          className="w-full bg-[#0B0C0A]/60 border border-[#C7A86D]/30 rounded px-3 py-2 text-xs text-[#E9DFC8] focus:outline-none focus:border-[#C7A86D] font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] uppercase font-sans tracking-widest text-[#C7A86D]">
                          Bab / Chapter
                        </label>
                        <select
                          value={uploadChapter}
                          onChange={(e) => setUploadChapter(e.target.value)}
                          className="w-full bg-[#0B0C0A]/60 border border-[#C7A86D]/30 rounded px-3 py-2 text-xs text-[#E9DFC8] focus:outline-none focus:border-[#C7A86D] h-[34px]"
                        >
                          {chapters.map(c => (
                            <option key={c.id} value={c.name} className="bg-[#111512] text-[#E9DFC8]">
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-1">
                      <label className="block text-[10px] uppercase font-sans tracking-widest text-[#C7A86D]">
                        Deskripsi Memori
                      </label>
                      <textarea
                        value={uploadDescription}
                        onChange={(e) => setUploadDescription(e.target.value)}
                        placeholder="Tuliskan kisah menarik dibalik peristiwa magis ini..."
                        rows={3}
                        className="w-full bg-[#0B0C0A]/60 border border-[#C7A86D]/30 rounded px-3 py-2 text-xs text-[#E9DFC8] focus:outline-none focus:border-[#C7A86D] font-serif leading-relaxed"
                      />
                    </div>

                    {/* Tags */}
                    <div className="space-y-1">
                      <label className="block text-[10px] uppercase font-sans tracking-widest text-[#C7A86D]">
                        Tag / Kata Kunci
                      </label>
                      <input
                        type="text"
                        value={uploadTags}
                        onChange={(e) => setUploadTags(e.target.value)}
                        placeholder="Contoh: liburan, kastil, kelana (pisahkan dengan koma)"
                        className="w-full bg-[#0B0C0A]/60 border border-[#C7A86D]/30 rounded px-3 py-2 text-xs text-[#E9DFC8] focus:outline-none focus:border-[#C7A86D] font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit button */}
                <div className="flex justify-end pt-4 border-t border-[#C7A86D]/15 gap-3">
                  <button
                    type="button"
                    onClick={() => setIsUploadOpen(false)}
                    className="px-4 py-2 border border-[#C7A86D]/20 text-[#9E9E8E] hover:text-[#E9DFC8] rounded-full text-xs font-sans uppercase tracking-widest cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading || !uploadFile}
                    className="px-6 py-2 bg-gradient-to-r from-[#D7BB7A] to-[#C7A86D] hover:scale-105 active:scale-95 text-[#111512] rounded-full text-xs font-bold font-sans uppercase tracking-widest cursor-pointer transition-all disabled:opacity-40 flex items-center space-x-2"
                  >
                    {isUploading ? (
                      <span>Menyimpan...</span>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-[#111512]" />
                        <span>Meteraikan Memori</span>
                      </>
                    )}
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
