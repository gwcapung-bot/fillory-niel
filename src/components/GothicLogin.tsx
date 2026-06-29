import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, Key, Sparkles, LogIn } from 'lucide-react';
import { signInWithGoogle } from '../firebase';

interface GothicLoginProps {
  onLoginSuccess: (user: any) => void;
}

export default function GothicLogin({ onLoginSuccess }: GothicLoginProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithGoogle();
      if (result.user) {
        onLoginSuccess(result.user);
      }
    } catch (err: any) {
      console.error('Authentication error:', err);
      setError(err.message || 'Failed to unlock the Sanguine Archive. The blood wards rejected your key.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#0B0C0A] text-[#E9DFC8] overflow-hidden px-4 font-sans select-none">
      
      {/* Gothic Atmospheric Background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,0,0,0.15)_0%,rgba(11,12,10,1)_80%)] z-0" />
      
      {/* Animated Red Crimson Mist / Blood Ember particles */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-red-900/40 blur-xl"
            style={{
              width: Math.random() * 200 + 100,
              height: Math.random() * 200 + 100,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, Math.random() * 40 - 20, 0],
              y: [0, Math.random() * 40 - 20, 0],
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Floating bat-like runes or symbols */}
      <div className="absolute inset-x-0 bottom-10 flex justify-around pointer-events-none opacity-20 text-red-700/50 text-2xl font-mono">
        <span>☥</span>
        <span>☠</span>
        <span>⚜</span>
        <span>♰</span>
        <span>𓆩♡𓆪</span>
        <span>☦</span>
      </div>

      {/* Main Reliquary Panel */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="relative z-10 max-w-md w-full p-8 md:p-10 rounded-2xl bg-[#111512]/95 border-2 border-[#C7A86D]/30 shadow-[0_0_50px_rgba(0,0,0,0.8),_0_0_20px_rgba(139,0,0,0.2)] text-center backdrop-blur-md"
      >
        {/* Ancient Corner Ornaments */}
        <div className="absolute top-2 left-2 text-[#C7A86D]/30 text-sm font-mono">✦</div>
        <div className="absolute top-2 right-2 text-[#C7A86D]/30 text-sm font-mono">✦</div>
        <div className="absolute bottom-2 left-2 text-[#C7A86D]/30 text-sm font-mono">✦</div>
        <div className="absolute bottom-2 right-2 text-[#C7A86D]/30 text-sm font-mono">✦</div>

        {/* Central Relic Icon */}
        <div className="mx-auto mb-6 w-20 h-20 rounded-full border border-[#C7A86D]/40 bg-gradient-to-b from-[#1A221C] to-[#0B0C0A] flex items-center justify-center relative shadow-[0_0_25px_rgba(199,168,109,0.15)] group">
          <motion.div
            className="absolute inset-0 rounded-full bg-red-600/10 blur-md opacity-0 group-hover:opacity-100 transition-opacity"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <Shield className="w-9 h-9 text-[#D7BB7A] animate-pulse" />
          <Lock className="w-4 h-4 text-red-600 absolute bottom-3 right-3" />
        </div>

        {/* Gothic Heading */}
        <h2 className="font-serif text-3xl font-extrabold tracking-widest text-[#E9DFC8] uppercase mb-2">
          Fillory Vault
        </h2>
        
        {/* Subtitle / Domain Stamp */}
        <div className="flex items-center justify-center space-x-2 text-[9px] font-mono tracking-widest text-[#9E9E8E] uppercase mb-6 pb-4 border-b border-[#C7A86D]/15">
          <span>Castle Fillory Niel</span>
          <span className="text-[#C7A86D]/40">•</span>
          <span className="text-red-500">Sanguine Archive</span>
        </div>

        {/* Description / Gothic Lore */}
        <p className="text-xs text-[#9E9E8E] leading-relaxed font-sans mb-8 max-w-xs mx-auto">
          "The chambers of Castle Fillory Niel are locked under ancient blood covenants. Only those registered within the sacred bloodline registry may open the gates."
        </p>

        {/* Google Sign-In Action */}
        <div className="space-y-4">
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: "0 0 25px rgba(139, 0, 0, 0.4)" }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSignIn}
            disabled={loading}
            className="w-full relative py-3.5 px-6 rounded-lg bg-gradient-to-r from-red-950/80 via-red-900 to-red-950/80 hover:from-red-900 hover:to-red-800 text-[#F7EDD5] font-serif font-bold tracking-widest text-xs uppercase border border-red-600/40 shadow-lg cursor-pointer flex items-center justify-center space-x-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-[#E9DFC8] border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                {/* Custom Google Styled Icon inside Gothic theme */}
                <svg className="w-4 h-4 fill-current text-[#D7BB7A]" viewBox="0 0 24 24">
                  <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 6.133 1 1.157 5.925 1.157 12s4.976 11 11.083 11c6.378 0 10.623-4.482 10.623-10.8 0-.727-.078-1.282-.175-1.915H12.24z"/>
                </svg>
                <span>Sign in with Google</span>
              </>
            )}
          </motion.button>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-3 rounded bg-red-950/40 border border-red-900/60 text-red-400 text-[11px] leading-relaxed text-left"
            >
              <span className="font-mono text-red-500 font-bold uppercase block mb-0.5">⚠️ Blood Ward Error:</span>
              {error}
            </motion.div>
          )}
        </div>

        {/* Footer Lore */}
        <div className="mt-8 pt-4 border-t border-[#C7A86D]/10 text-[9px] font-mono text-[#9E9E8E]/40 tracking-widest flex items-center justify-center space-x-2">
          <Key className="w-2.5 h-2.5" />
          <span>REQUIRES SECURE GOOGLE DECREE</span>
        </div>
      </motion.div>
    </div>
  );
}
