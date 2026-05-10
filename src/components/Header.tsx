import { Layout, User, Bell } from 'lucide-react';
import { motion } from 'motion/react';
import { useRef } from 'react';
import React from 'react';

interface HeaderProps {
  onAdminTrigger: () => void;
}

export default function Header({ onAdminTrigger }: HeaderProps) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    // Prevent default context menu on mobile
    if ('touches' in e) {
      // e.preventDefault(); // Don't prevent default on start as it might block scrolling
    }
    
    // Clear any existing timer
    if (timerRef.current) clearTimeout(timerRef.current);
    
    timerRef.current = setTimeout(() => {
      onAdminTrigger();
      // Provide haptic feedback if possible
      if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(200);
      }
    }, 4000); // 4 seconds long press
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
          className="flex items-center gap-2 md:gap-3 cursor-pointer group active:scale-95 transition-transform select-none"
          onMouseDown={handleStart}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchEnd={handleEnd}
          onContextMenu={(e) => e.preventDefault()} // Disable right click context menu on logo
        >
          <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-600 rounded-lg md:rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all group-hover:rotate-6">
            <Layout className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm md:text-lg font-black tracking-tighter leading-none group-hover:text-blue-500 transition-colors">
              GAME-CART <span className="text-blue-600">BD</span>
            </h1>
            <p className="text-[7px] md:text-[8px] text-slate-500 uppercase tracking-[0.25em] font-black mt-1">Premium Gaming</p>
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
