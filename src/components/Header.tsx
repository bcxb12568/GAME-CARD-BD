import { Layout, User, Bell } from 'lucide-react';
import { motion } from 'motion/react';
import { useRef } from 'react';
import React from 'react';
import { SiteSettings } from '../types';

interface HeaderProps {
  onAdminTrigger: () => void;
  settings?: SiteSettings;
}

export default function Header({ onAdminTrigger, settings }: HeaderProps) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    // Clear any existing timer
    if (timerRef.current) clearTimeout(timerRef.current);
    
    timerRef.current = setTimeout(() => {
      onAdminTrigger();
      // Provide haptic feedback if possible
      if (window.navigator && window.navigator.vibrate) {
        try {
          window.navigator.vibrate(200);
        } catch (err) {
          // ignore vibrate security constraints check
        }
      }
    }, 5000); // Exactly 5 seconds long press as requested
  };

  const handleEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  return (
    <header className="h-16 md:h-20 shrink-0 flex items-center justify-between px-4 md:px-8 bg-black/20 backdrop-blur-xl border-b border-white/5 z-50">
      <div className="flex items-center gap-4 md:gap-12">
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 md:gap-4 cursor-pointer group active:scale-95 transition-transform select-none"
          onMouseDown={handleStart}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchEnd={handleEnd}
          onContextMenu={(e) => e.preventDefault()} // Disable right click context menu on logo
        >
          {/* High Fidelity Custom Game Card Shield Logo */}
          <div 
            className="relative flex items-center justify-center shrink-0"
            style={{ 
              width: `${settings?.logoSize || 64}px`, 
              height: `${settings?.logoSize || 64}px` 
            }}
          >
            {settings?.logoImage ? (
              <img 
                src={settings.logoImage} 
                alt="Game Card BD Logo" 
                className="w-full h-full object-contain drop-shadow-[0_0_12px_rgba(0,243,255,0.45)] transition-transform duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
            ) : (
              <svg 
                viewBox="0 0 100 100" 
                className="relative w-full h-full drop-shadow-[0_0_12px_rgba(6,182,212,0.45)] transition-transform duration-500 group-hover:scale-105" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  {/* Advanced gradients & glows to match the uploaded logo’s neon premium aesthetics */}
                  <linearGradient id="shieldBorder" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00ffff" />
                    <stop offset="50%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#1d4ed8" />
                  </linearGradient>
                  <linearGradient id="shieldFill" x1="50%" y1="0%" x2="50%" y2="100%">
                    <stop offset="0%" stopColor="#020617" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#0a0f24" stopOpacity="0.95" />
                  </linearGradient>
                  <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="1.5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  {/* Define the precise shield inner boundary mask to clip rotated background card corners */}
                  <clipPath id="shieldInnerClip">
                    <path d="M 50,14 Q 78,21 76,53 Q 74,72 50,85 Q 26,72 24,53 Q 22,21 50,14 Z" />
                  </clipPath>
                </defs>

                {/* Outer Shield Outline matching the exact reference logo profile */}
                <path 
                  d="M 50,8 Q 85,16 83,55 Q 81,78 50,94 Q 19,78 17,55 Q 15,16 50,8 Z" 
                  stroke="url(#shieldBorder)" 
                  strokeWidth="3.2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  fill="url(#shieldFill)"
                />
                
                {/* Inner Shield Overlay Stroke */}
                <path 
                  d="M 50,14 Q 78,21 76,53 Q 74,72 50,85 Q 26,72 24,53 Q 22,21 50,14 Z" 
                  stroke="#00f3ff" 
                  strokeWidth="1" 
                  strokeOpacity="0.4"
                  strokeLinejoin="round"
                  fill="none"
                />

                {/* Angle Deck of Stacked Playing Cards inside the Shield */}
                <g transform="translate(0, -1)">
                  {/* Perfectly clipped background card group to prevent diagonal/vertical corners from sticking out */}
                  <g clipPath="url(#shieldInnerClip)">
                    {/* Backmost Left Card */}
                    <rect 
                      x="25" y="27" width="28" height="42" rx="4" 
                      transform="rotate(-12, 39, 48)" 
                      fill="#030712" 
                      stroke="#1d4ed8" 
                      strokeWidth="1.5"
                      strokeOpacity="0.75"
                    />
                    
                    {/* Midmost Right Card */}
                    <rect 
                      x="47" y="27" width="28" height="42" rx="4" 
                      transform="rotate(10, 61, 48)" 
                      fill="#030712" 
                      stroke="#1e293b" 
                      strokeWidth="1.5"
                      strokeOpacity="0.75"
                    />
                  </g>

                  {/* Primary Frontmost Gaming Card */}
                  <g transform="rotate(5, 52, 52)">
                    <rect 
                      x="34" y="27" width="32" height="46" rx="5" 
                      fill="#090d16" 
                      stroke="#00ffff" 
                      strokeWidth="2.5"
                      filter="url(#neonGlow)"
                    />
                    
                    {/* Glowing inner micro-border */}
                    <rect 
                      x="36" y="29" width="28" height="42" rx="3.5" 
                      stroke="#0284c7" 
                      strokeWidth="0.8"
                      opacity="0.5"
                      fill="none"
                    />
                    
                    {/* Top-Left Ace Symbol 'A' */}
                    <text 
                      x="38.5" y="35" 
                      fill="#00ffff" 
                      fontSize="6.5" 
                      fontWeight="900"
                      fontFamily="monospace"
                    >
                      A
                    </text>
                    
                    {/* Top-Right gamepad/buttons cluster */}
                    <g opacity="0.9">
                      <line x1="59" y1="33" x2="59" y2="40" stroke="#00ffff" strokeWidth="0.3" opacity="0.5" />
                      <line x1="55.5" y1="36.5" x2="62.5" y2="36.5" stroke="#00ffff" strokeWidth="0.3" opacity="0.5" />
                      <circle cx="59" cy="33" r="1.1" fill="#00ffff" />
                      <circle cx="55.5" cy="36.5" r="1.1" fill="#00ffff" />
                      <circle cx="62.5" cy="36.5" r="1.1" fill="#00ffff" />
                      <circle cx="59" cy="40" r="1.1" fill="#00ffff" />
                    </g>

                    {/* High Quality Styled King's Crown in Center */}
                    <g filter="url(#neonGlow)">
                      <path 
                        d="M 43,54 L 41,45 L 46.5,49.5 L 50,40 L 53.5,49.5 L 59,45 L 57,54 Z" 
                        fill="#00ffff" 
                        fillOpacity="0.25"
                        stroke="#00ffff"
                        strokeWidth="0.8"
                        strokeLinejoin="round"
                      />
                      <line x1="43" y1="54" x2="57" y2="54" stroke="#00ffff" strokeWidth="1.2" />
                      <line x1="44" y1="55.6" x2="56" y2="55.6" stroke="#3b82f6" strokeWidth="0.8" opacity="0.8" />
                      
                      {/* Crown Jewel Top Spheres */}
                      <circle cx="50" cy="40" r="1" fill="#ffffff" stroke="#00ffff" strokeWidth="0.4" />
                      <circle cx="41" cy="45" r="0.8" fill="#ffffff" stroke="#00ffff" strokeWidth="0.4" />
                      <circle cx="59" cy="45" r="0.8" fill="#ffffff" stroke="#00ffff" strokeWidth="0.4" />
                    </g>

                    {/* Standard directional + D-pad Controller on Bottom-Left */}
                    <path 
                      d="M 38.5,60 H 42.1 V 56.5 H 44.1 V 60 H 47.7 V 62 H 44.1 V 65.5 H 42.1 V 62 H 38.5 Z" 
                      fill="#00ffff" 
                      stroke="#1d4ed8" 
                      strokeWidth="0.4"
                      opacity="0.9"
                    />
                    
                    {/* Bottom-Right Glyph 'Y' */}
                    <text 
                      x="56.5" y="64.5" 
                      fill="#00ffff" 
                      fontSize="6.5" 
                      fontWeight="900"
                      fontFamily="monospace"
                    >
                      Y
                    </text>
                  </g>
                </g>
              </svg>
            )}
          </div>

          <div className="flex flex-col justify-center select-none pl-1 md:pl-2">
            {/* Beautiful customized layout matching original text and glows */}
            <div className="flex items-baseline gap-1 md:gap-2 font-oxanium text-lg md:text-2xl font-extrabold italic tracking-tight leading-none">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f3ff] via-[#3bf3ff] to-[#00b0ff] drop-shadow-[0_0_12px_rgba(0,243,255,0.45)]">
                GAME
              </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffffff] via-[#f8fafc] to-[#cbd5e1] drop-shadow-[0_0_8px_rgba(255,255,255,0.25)] pl-0.5 md:pl-1">
                CARD BD
              </span>
            </div>
            {/* Perfectly tracking uppercase label */}
            <p className="text-[7px] md:text-[8px] font-montserrat font-extrabold tracking-[0.24em] md:tracking-[0.28em] text-slate-300 uppercase mt-1 leading-none drop-shadow-[0_0_6px_rgba(203,213,225,0.2)] opacity-95">
              PREMIUM GAMING ACCESS
            </p>
          </div>
        </motion.div>
      </div>

      <div className="flex items-center gap-2 md:gap-6">
        <nav className="hidden lg:flex items-center gap-8 text-[10px] md:text-xs font-bold uppercase tracking-widest">
          <a href="#" className="text-blue-400">Library</a>
          <a href="#" className="text-slate-400 hover:text-white transition-colors">News</a>
          <a href="#" className="text-slate-400 hover:text-white transition-colors">Support</a>
        </nav>

        <div className="flex items-center gap-2 md:gap-4 md:pl-6 md:border-l md:border-white/5">
          <motion.button 
            whileHover={{ scale: 1.1, color: '#fff' }}
            whileTap={{ scale: 0.9 }}
            className="p-2 text-slate-500 hover:text-white transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-blue-500 rounded-full" />
          </motion.button>
        </div>
      </div>
    </header>
  );
}
