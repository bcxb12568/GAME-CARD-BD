import { Game } from '../types';
import { Star, Download, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface GameCardProps {
  game: Game;
  index: number;
  onClick: () => void;
}

export default function GameCard({ game, index, onClick }: GameCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      className="group relative glass-card p-3 md:p-4 rounded-2xl md:rounded-3xl flex flex-col hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300"
      onClick={onClick}
    >
      <div className="h-32 md:h-40 bg-slate-800 rounded-xl md:rounded-2xl mb-3 md:mb-4 relative overflow-hidden shrink-0">
        <img
          src={game.image}
          alt={game.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 md:grayscale group-hover:grayscale-0"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-2 left-2 md:bottom-3 md:left-3 flex gap-1 md:gap-2">
          <span className="text-[7px] md:text-[9px] bg-blue-600/90 backdrop-blur-sm px-1.5 md:px-2 py-0.5 rounded-md font-black uppercase tracking-[0.1em]">{game.category}</span>
          <span className="hidden sm:inline-block text-[9px] bg-slate-900/60 backdrop-blur-md px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border border-white/5">{game.size}</span>
        </div>
      </div>

      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1 md:mb-2 gap-1 px-1">
          <h3 className="font-bold text-[11px] md:text-sm leading-tight group-hover:text-blue-400 transition-colors truncate">
            {game.name}
          </h3>
          <div className="flex items-center gap-0.5 md:gap-1 shrink-0">
             <Star className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500" />
             <span className="text-[9px] md:text-xs text-yellow-500 font-black">{game.rating}</span>
          </div>
        </div>
        
        <p className="hidden md:block text-[10px] text-slate-500 mb-6 line-clamp-2 leading-relaxed px-1">
           {game.description}
        </p>
        
        <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-3">
          <div className="flex items-center gap-1 md:gap-1.5 text-[7px] md:text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] truncate">
            <ShieldCheck className="w-2.5 md:w-3 h-2.5 md:h-3 text-blue-500/70" />
            <span className="hidden xs:inline">Safe</span>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-2.5 md:px-4 py-1.5 md:py-2 bg-blue-600/10 group-hover:bg-blue-600 rounded-lg text-[7px] md:text-[9px] font-black uppercase tracking-[0.15em] transition-all text-blue-500 group-hover:text-white"
          >
            <span className="xs:hidden">GET</span>
            <span className="hidden xs:inline">DOWNLOAD</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
