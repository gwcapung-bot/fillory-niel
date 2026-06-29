import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, FolderHeart, Sparkles, Compass, UserCheck, Settings2, Calendar, LogIn } from 'lucide-react';

// Firebase Modules
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, doc, getDocs, setDoc, deleteDoc, query, where, getDoc } from 'firebase/firestore';
import { auth, logoutWithGoogle, db } from './firebase';

// Custom Modules
import { ThemePreset, MemoryItem, FamilyMember, Chapter } from './types';
import { INITIAL_MEMORIES, INITIAL_CHAPTERS, INITIAL_FAMILY_MEMBERS, THEME_COLORS } from './data';
import BackgroundForest from './components/BackgroundForest';
import MagicalEntrance from './components/MagicalEntrance';
import LandingPage from './components/LandingPage';
import MediaGallery from './components/MediaGallery';
import StorageVault from './components/StorageVault';
import RoyalCircle from './components/RoyalCircle';
import VideoPlayer from './components/VideoPlayer';
import PhotoViewer from './components/PhotoViewer';
import SettingsChamber from './components/SettingsChamber';
import MemoryConstellation from './components/MemoryConstellation';
import ScrollTimeline from './components/ScrollTimeline';
import GothicLogin from './components/GothicLogin';

import { 
  LocalMemoryRecord,
  KeeperProfile,
  LocalGroupMember
} from './lib/db';

export default function App() {
  const [hasEntered, setHasEntered] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<'landing' | 'gallery' | 'constellation' | 'timeline' | 'storage' | 'royal' | 'settings' | 'photo' | 'video'>('landing');

  // Firebase Auth State
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Master Lists state
  const [memories, setMemories] = useState<MemoryItem[]>(INITIAL_MEMORIES);
  const [chapters, setChapters] = useState(INITIAL_CHAPTERS);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(INITIAL_FAMILY_MEMBERS);

  // Active selections
  const [selectedPhotoItem, setSelectedPhotoItem] = useState<MemoryItem | null>(null);
  const [selectedVideoItem, setSelectedVideoItem] = useState<MemoryItem | null>(null);

  // Customizable Landing Texts state
  const [landingHeading, setLandingHeading] = useState("WELCOME TO \nFILLORY NIEL");
  const [landingSub, setLandingSub] = useState("“Every Memory Has A Story Worth Preserving.”");

  // Editable Keeper Profile state
  const [keeperProfile, setKeeperProfile] = useState<KeeperProfile>({
    id: 'active-keeper',
    name: 'Keeper gwcapung',
    email: 'gwcapung@gmail.com',
    councilTitle: 'Chief Archivist of the Clockwork',
    realmDominion: 'Sovereign High Court, Castle Fillory',
    avatarUrl: 'https://picsum.photos/seed/keeper_niel/400/400'
  });

  // Dynamic Theme Preset state
  const [currentTheme, setCurrentTheme] = useState<ThemePreset>('Forest Night');
  const activeColors = THEME_COLORS[currentTheme];

  // Helper: Convert file blob to base64 for easy firestore inline storage
  const fileToBase64 = (file: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Load customizations and data from Firestore on auth state change
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setAuthLoading(true);
        try {
          // 1. App Config (Landing text)
          const configDoc = await getDoc(doc(db, 'configs', currentUser.uid));
          if (configDoc.exists()) {
            const data = configDoc.data();
            if (data.landingHeading) setLandingHeading(data.landingHeading);
            if (data.landingSub) setLandingSub(data.landingSub);
          }

          // 2. Keeper Profile
          const profileDoc = await getDoc(doc(db, 'profiles', currentUser.uid));
          let currentProfile = keeperProfile;
          if (profileDoc.exists()) {
            const data = profileDoc.data();
            currentProfile = {
              id: 'active-keeper',
              name: data.name,
              email: data.email,
              councilTitle: data.councilTitle,
              realmDominion: data.realmDominion,
              avatarUrl: data.avatarUrl,
            };
            setKeeperProfile(currentProfile);
          } else {
            // Create default profile for new user based on Google metadata
            const initialProfile: KeeperProfile = {
              id: 'active-keeper',
              name: currentUser.displayName || 'Keeper gwcapung',
              email: currentUser.email || 'gwcapung@gmail.com',
              councilTitle: 'Chief Archivist of the Clockwork',
              realmDominion: 'Sovereign High Court, Castle Fillory',
              avatarUrl: currentUser.photoURL || 'https://picsum.photos/seed/keeper_niel/400/400'
            };
            await setDoc(doc(db, 'profiles', currentUser.uid), {
              ...initialProfile,
              userId: currentUser.uid
            });
            currentProfile = initialProfile;
            setKeeperProfile(initialProfile);
          }

          // 3. Memories
          const qMem = query(collection(db, 'memories'), where('userId', '==', currentUser.uid));
          const snapMem = await getDocs(qMem);
          const loadedMemories = snapMem.docs.map(doc => doc.data() as MemoryItem);
          setMemories(loadedMemories);

          // 4. Chapters
          const qChap = query(collection(db, 'chapters'), where('userId', '==', currentUser.uid));
          const snapChap = await getDocs(qChap);
          const loadedChapters = snapChap.docs.map(doc => doc.data() as Chapter);
          if (loadedChapters.length > 0) {
            setChapters(loadedChapters);
          } else {
            setChapters(INITIAL_CHAPTERS);
          }

          // 5. Custom Council Members
          const qMemb = query(collection(db, 'members'), where('userId', '==', currentUser.uid));
          const snapMemb = await getDocs(qMemb);
          const loadedMembers = snapMemb.docs.map(doc => doc.data() as FamilyMember);

          // Map initial base family members (update keeper in initial list with updated keeperProfile state if present)
          const baseMembersMapped = INITIAL_FAMILY_MEMBERS.map(m => {
            if (m.id === 'char-1') {
              return {
                ...m,
                name: currentProfile.name,
                role: currentProfile.councilTitle,
                avatarUrl: currentProfile.avatarUrl || m.avatarUrl,
              };
            }
            return m;
          });

          setFamilyMembers([...baseMembersMapped, ...loadedMembers]);

        } catch (err) {
          console.error('Failed to restore archive session records from Firestore:', err);
        } finally {
          setAuthLoading(false);
        }
      } else {
        setAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleUploadMemory = async (record: LocalMemoryRecord) => {
    if (!user) return;
    try {
      let fileUrl = '';
      if (record.file) {
        fileUrl = await fileToBase64(record.file);
      }
      const newMemory: MemoryItem = {
        id: record.id,
        title: record.title,
        type: record.type,
        url: fileUrl,
        thumbnailUrl: fileUrl,
        chapter: record.chapter,
        date: record.date,
        description: record.description,
        tags: record.tags,
        constellationPos: record.constellationPos,
      };

      await setDoc(doc(db, 'memories', record.id), {
        ...newMemory,
        userId: user.uid,
        createdAt: new Date().toISOString()
      });

      setMemories((prev) => [newMemory, ...prev]);
    } catch (err) {
      console.error('Failed to sync memory to cloud storage:', err);
      throw err;
    }
  };

  const handleDeleteMemory = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'memories', id));
      setMemories((prev) => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error('Failed to delete memory from cloud storage:', err);
    }
  };

  // Customizable Landing Text Saved to Firestore
  const handleUpdateLandingText = async (heading: string, sub: string) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'configs', user.uid), {
        landingHeading: heading,
        landingSub: sub,
        userId: user.uid
      });
      setLandingHeading(heading);
      setLandingSub(sub);
    } catch (err) {
      console.error('Failed to preserve landing configs on cloud:', err);
      throw err;
    }
  };

  // Editable Profile Saved to Firestore
  const handleUpdateKeeperProfile = async (profile: KeeperProfile) => {
    if (!user) return;
    try {
      let displayUrl = profile.avatarUrl || 'https://picsum.photos/seed/keeper_niel/400/400';
      if (profile.avatarFile) {
        displayUrl = await fileToBase64(profile.avatarFile);
      }
      
      const updatedProfile = {
        ...profile,
        avatarUrl: displayUrl
      };
      
      await setDoc(doc(db, 'profiles', user.uid), {
        name: profile.name,
        email: profile.email,
        councilTitle: profile.councilTitle,
        realmDominion: profile.realmDominion,
        avatarUrl: displayUrl,
        userId: user.uid
      });
      
      setKeeperProfile(updatedProfile);

      // Keep the main seat character synced with active keeper settings
      setFamilyMembers(prev => prev.map(m => {
        if (m.id === 'char-1') {
          return {
            ...m,
            name: profile.name,
            role: profile.councilTitle,
            avatarUrl: displayUrl
          };
        }
        return m;
      }));
    } catch (err) {
      console.error('Failed to save credentials profile to cloud:', err);
      throw err;
    }
  };

  // Dynamic Group/Circle Members Saved to Firestore
  const handleAddGroupMember = async (member: LocalGroupMember) => {
    if (!user) return;
    try {
      let objectUrl = member.avatarUrl || '';
      if (member.avatarFile) {
        objectUrl = await fileToBase64(member.avatarFile);
      }
      const newFamily: FamilyMember = {
        id: member.id,
        name: member.name,
        role: member.role,
        avatarUrl: objectUrl || 'https://picsum.photos/seed/goth_mage/400/400',
        privateVault: member.privateVault,
        permissionLevel: member.permissionLevel,
      };

      await setDoc(doc(db, 'members', member.id), {
        ...newFamily,
        userId: user.uid
      });

      setFamilyMembers(prev => [...prev, newFamily]);
    } catch (err) {
      console.error('Failed to sync new group member to cloud:', err);
      throw err;
    }
  };

  const handleEditGroupMember = async (member: LocalGroupMember) => {
    if (!user) return;
    try {
      let objectUrl = member.avatarUrl || '';
      if (member.avatarFile) {
        objectUrl = await fileToBase64(member.avatarFile);
      }
      
      const updatedMember = {
        id: member.id,
        name: member.name,
        role: member.role,
        avatarUrl: objectUrl || member.avatarUrl || 'https://picsum.photos/seed/goth_mage/400/400',
        privateVault: member.privateVault,
        permissionLevel: member.permissionLevel,
      };

      await setDoc(doc(db, 'members', member.id), {
        ...updatedMember,
        userId: user.uid
      });

      setFamilyMembers(prev => prev.map(m => {
        if (m.id === member.id) {
          return updatedMember;
        }
        return m;
      }));
    } catch (err) {
      console.error('Failed to sync edited group member to cloud:', err);
      throw err;
    }
  };

  const handleDeleteGroupMember = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'members', id));
      setFamilyMembers(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error('Failed to delete group member from cloud:', err);
      throw err;
    }
  };

  // Soft ambient chime on entered
  const playEntrySpellSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, audioCtx.currentTime); // A4 note
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.5); // slide to high A5

      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 1.5);
    } catch (e) {
      // AudioContext barred in some sandbox frames, fail silently
    }
  };

  const handleEntranceComplete = () => {
    setHasEntered(true);
    playEntrySpellSound();
  };

  const handleAddChapter = async (newChap: any) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'chapters', newChap.id), {
        ...newChap,
        userId: user.uid
      });
      setChapters((prev) => [newChap, ...prev]);
    } catch (err) {
      console.error('Failed to sync new chapter to cloud:', err);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#050605] text-[#E9DFC8] relative overflow-hidden" id="auth-loading">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,0,0,0.08)_0%,rgba(5,6,5,1)_80%)] z-0" />
        <div className="relative z-10 flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-full border-2 border-[#C7A86D]/20 border-t-[#C7A86D] animate-spin mb-2" />
          <span className="font-serif text-[10px] uppercase tracking-[0.3em] text-[#9E9E8E] animate-pulse">
            Unsealing the Blood Wards...
          </span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <GothicLogin onLoginSuccess={(loggedInUser) => setUser(loggedInUser)} />;
  }

  return (
    <div
      style={{
        backgroundColor: activeColors.primaryBg,
        color: activeColors.textMain,
      }}
      className="min-h-screen transition-colors duration-[1.5s] relative overflow-x-hidden font-sans select-none"
      id="fillory-vault-root"
    >
      
      {/* 1. Global Interactive Forest Canvas Background */}
      {hasEntered && <BackgroundForest />}

      {/* 2. Interactive Door Unsealing Entrance Stage */}
      <AnimatePresence>
        {!hasEntered && (
          <MagicalEntrance onComplete={handleEntranceComplete} />
        )}
      </AnimatePresence>

      {/* 3. Global Master Interface Wrapper (rendered once entered) */}
      {hasEntered && (
        <div className="relative z-10 flex flex-col min-h-screen justify-between">
          
          {/* A. Master Glassy Header Navbar */}
          {currentScreen !== 'landing' && (
            <motion.header
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              style={{
                backgroundColor: activeColors.glassBg,
                borderColor: `${activeColors.accentGold}25`,
              }}
              className="sticky top-0 z-40 backdrop-blur-md border-b px-4 py-3 shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
            >
              <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Brand Logo & Current Theme Stamp */}
                <div
                  onClick={() => setCurrentScreen('landing')}
                  className="flex items-center space-x-3 cursor-pointer group"
                >
                  <div className="p-1.5 rounded bg-gradient-to-br from-[#D7BB7A] to-[#C7A86D] text-[#111512] shadow-md group-hover:scale-105 transition-transform">
                    <Shield className="w-5 h-5 fill-[#111512]" />
                  </div>
                  <div>
                    <h1 className="font-serif text-base font-bold tracking-wider text-[#E9DFC8] group-hover:text-[#C7A86D] transition-colors leading-none">
                      FILLORY NIEL
                    </h1>
                    <span className="text-[8px] font-mono tracking-widest text-[#9E9E8E] uppercase block">
                      Realm Theme: {currentTheme}
                    </span>
                  </div>
                </div>

                {/* Navigation Hub Tabs */}
                <nav className="flex flex-wrap items-center justify-center gap-1 bg-[#0B0C0A]/40 p-1 rounded-full border border-[#C7A86D]/15">
                  {/* Catalog (Gallery) */}
                  <button
                    onClick={() => setCurrentScreen('gallery')}
                    className={`px-4 py-2 rounded-full text-[10px] tracking-wider uppercase font-sans font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
                      currentScreen === 'gallery'
                        ? 'bg-gradient-to-r from-[#D7BB7A] to-[#C7A86D] text-[#111512]'
                        : 'text-[#9E9E8E] hover:text-[#E9DFC8]'
                    }`}
                  >
                    <FolderHeart className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Catalog</span>
                  </button>

                  {/* Constellations */}
                  <button
                    onClick={() => setCurrentScreen('constellation')}
                    className={`px-4 py-2 rounded-full text-[10px] tracking-wider uppercase font-sans font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
                      currentScreen === 'constellation'
                        ? 'bg-gradient-to-r from-[#D7BB7A] to-[#C7A86D] text-[#111512]'
                        : 'text-[#9E9E8E] hover:text-[#E9DFC8]'
                    }`}
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Constellations</span>
                  </button>

                  {/* Time Travel */}
                  <button
                    onClick={() => setCurrentScreen('timeline')}
                    className={`px-4 py-2 rounded-full text-[10px] tracking-wider uppercase font-sans font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
                      currentScreen === 'timeline'
                        ? 'bg-gradient-to-r from-[#D7BB7A] to-[#C7A86D] text-[#111512]'
                        : 'text-[#9E9E8E] hover:text-[#E9DFC8]'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Time Travel</span>
                  </button>

                  {/* Arcane Storage */}
                  <button
                    onClick={() => setCurrentScreen('storage')}
                    className={`px-4 py-2 rounded-full text-[10px] tracking-wider uppercase font-sans font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
                      currentScreen === 'storage'
                        ? 'bg-gradient-to-r from-[#D7BB7A] to-[#C7A86D] text-[#111512]'
                        : 'text-[#9E9E8E] hover:text-[#E9DFC8]'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Storage Crystal</span>
                  </button>

                  {/* Royal Circle */}
                  <button
                    onClick={() => setCurrentScreen('royal')}
                    className={`px-4 py-2 rounded-full text-[10px] tracking-wider uppercase font-sans font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
                      currentScreen === 'royal'
                        ? 'bg-gradient-to-r from-[#D7BB7A] to-[#C7A86D] text-[#111512]'
                        : 'text-[#9E9E8E] hover:text-[#E9DFC8]'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Council</span>
                  </button>

                  {/* Settings */}
                  <button
                    onClick={() => setCurrentScreen('settings')}
                    className={`px-4 py-2 rounded-full text-[10px] tracking-wider uppercase font-sans font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
                      currentScreen === 'settings'
                        ? 'bg-gradient-to-r from-[#D7BB7A] to-[#C7A86D] text-[#111512]'
                        : 'text-[#9E9E8E] hover:text-[#E9DFC8]'
                    }`}
                  >
                    <Settings2 className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Settings</span>
                  </button>
                </nav>

                {/* User Info & Lock Gates */}
                <div className="flex items-center space-x-3">
                  <div className="text-right hidden xl:block">
                    <div className="text-[10px] font-medium text-[#E9DFC8]">{user?.displayName || 'Keeper'}</div>
                    <div className="text-[8px] font-mono text-[#9E9E8E]">{user?.email}</div>
                  </div>
                  {user?.photoURL && (
                    <img 
                      src={user.photoURL} 
                      alt="Keeper Avatar" 
                      className="w-7 h-7 rounded-full border border-[#C7A86D]/30"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <button
                    onClick={async () => {
                      await logoutWithGoogle();
                    }}
                    className="p-1.5 rounded-full border border-red-950 bg-red-950/20 text-red-400 hover:text-red-300 hover:bg-red-900/30 transition-all cursor-pointer"
                    title="Lock Gates"
                  >
                    <LogIn className="w-3.5 h-3.5 rotate-180" />
                  </button>
                </div>
              </div>
            </motion.header>
          )}

          {/* B. Core Interactive Screen Router Body */}
          <main className="flex-1 w-full relative z-10 flex flex-col justify-center py-6">
            <AnimatePresence mode="wait">
              {currentScreen === 'landing' && (
                <motion.div
                  key="landing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full"
                >
                  <LandingPage
                    onEnterVault={() => setCurrentScreen('gallery')}
                    memories={memories}
                    landingHeading={landingHeading}
                    landingSub={landingSub}
                    onUpdateLandingText={handleUpdateLandingText}
                    onLogout={async () => {
                      await logoutWithGoogle();
                    }}
                  />
                </motion.div>
              )}

              {currentScreen === 'gallery' && (
                <motion.div
                  key="gallery"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="w-full animate-fadeIn"
                >
                  <MediaGallery
                    memories={memories}
                    chapters={chapters}
                    onSelectPhoto={(photo) => {
                      setSelectedPhotoItem(photo);
                      setCurrentScreen('photo');
                    }}
                    onSelectVideo={(video) => {
                      setSelectedVideoItem(video);
                      setCurrentScreen('video');
                    }}
                    onAddChapter={handleAddChapter}
                    onUploadMemory={handleUploadMemory}
                    onDeleteMemory={handleDeleteMemory}
                  />
                </motion.div>
              )}

              {currentScreen === 'constellation' && (
                <motion.div
                  key="constellation"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="w-full"
                >
                  <MemoryConstellation
                    memories={memories}
                    onSelectPhoto={(photo) => {
                      setSelectedPhotoItem(photo);
                      setCurrentScreen('photo');
                    }}
                    onSelectVideo={(video) => {
                      setSelectedVideoItem(video);
                      setCurrentScreen('video');
                    }}
                  />
                </motion.div>
              )}

              {currentScreen === 'timeline' && (
                <motion.div
                  key="timeline"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="w-full"
                >
                  <ScrollTimeline
                    memories={memories}
                    onSelectPhoto={(photo) => {
                      setSelectedPhotoItem(photo);
                      setCurrentScreen('photo');
                    }}
                    onSelectVideo={(video) => {
                      setSelectedVideoItem(video);
                      setCurrentScreen('video');
                    }}
                  />
                </motion.div>
              )}

              {currentScreen === 'storage' && (
                <motion.div
                  key="storage"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="w-full animate-fadeIn"
                >
                  <StorageVault />
                </motion.div>
              )}

              {currentScreen === 'royal' && (
                <motion.div
                  key="royal"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="w-full animate-fadeIn"
                >
                  <RoyalCircle 
                    members={familyMembers}
                    onAddMember={handleAddGroupMember}
                    onDeleteMember={handleDeleteGroupMember}
                    onEditMember={handleEditGroupMember}
                  />
                </motion.div>
              )}

              {currentScreen === 'video' && selectedVideoItem && (
                <motion.div
                  key="video"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full"
                >
                  <VideoPlayer
                    item={selectedVideoItem}
                    onBackToGallery={() => setCurrentScreen('gallery')}
                  />
                </motion.div>
              )}

              {currentScreen === 'photo' && selectedPhotoItem && (
                <motion.div
                  key="photo"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full"
                >
                  <PhotoViewer
                    item={selectedPhotoItem}
                    photos={memories.filter(m => m.type === 'photo')}
                    onBackToGallery={() => setCurrentScreen('gallery')}
                    onSelectPhoto={(photo) => setSelectedPhotoItem(photo)}
                  />
                </motion.div>
              )}

              {currentScreen === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="w-full animate-fadeIn"
                >
                  <SettingsChamber
                    currentTheme={currentTheme}
                    onThemeChange={(newTheme) => setCurrentTheme(newTheme)}
                    keeperProfile={keeperProfile}
                    onUpdateKeeperProfile={handleUpdateKeeperProfile}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          {/* C. Subdued, Editorial Footer */}
          <footer
            style={{ borderColor: `${activeColors.accentGold}15` }}
            className="w-full py-6 mt-12 text-center border-t border-dashed"
          >
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-[#9E9E8E] font-mono uppercase tracking-widest opacity-60">
              <span>Sovereign Keeper: {keeperProfile.email}</span>
              <span className="flex items-center space-x-2">
                <span>Fillory Niel Storage Engine v1.0.4</span>
              </span>
              <span>Castle Library Records, Fillory Realm</span>
            </div>
          </footer>

        </div>
      )}

    </div>
  );
}
