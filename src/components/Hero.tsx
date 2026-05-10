import { motion } from 'motion/react';
import { TrendingUp, Zap, ShieldCheck } from 'lucide-react';

export default function Hero() {
  return (
    <section className="shrink-0">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="h-48 md:h-64 bg-gradient-to-r from-blue-900/30 to-slate-800/20 rounded-[1.5rem] md:rounded-[2rem] border border-white/5 flex items-center justify-between px-6 md:px-10 relative overflow-hidden group shadow-2xl shadow-blue-500/5"
      >
        <div className="relative z-10 max-w-xl">
          <div className="flex items-center gap-2 mb-3 md:mb-4">
             <span className="text-[8px] md:text-[9px] bg-blue-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest text-white ring-4 ring-blue-500/10">SPONSORED</span>
             <div className="flex items-center gap-1.5 text-slate-400 text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] ml-2">
                <TrendingUp className="w-3 h-3" />
                <span>Trending Now</span>
             </div>
          </div>
          <h2 className="text-2xl md:text-4xl font-bold tracking-tighter mb-3 md:mb-4 leading-tight">
            GET THE ULTIMATE <br />
            <span className="text-blue-500">GAMING EXPERIENCE</span>
          </h2>
          <p className="hidden md:block text-sm text-slate-400 max-w-sm mb-6 leading-relaxed">
            High-speed mirrors for game downloads in Bangladesh. 
            Zero waiting, maximum performance.
          </p>
          <div className="flex flex-wrap items-center gap-3 md:gap-5 mt-2">
            <div className="flex items-center gap-1.5 md:gap-2">
              <div className="w-5 h-5 md:w-6 md:h-6 bg-blue-500/10 rounded-lg flex items-center justify-center border border-blue-500/10">
                <Zap className="w-3 h-3 md:w-3.5 md:h-3.5 text-blue-500" />
              </div>
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-300">Fast Link</span>
            </div>
            <div className="w-px h-3 bg-white/5 hidden md:block" />
            <div className="flex items-center gap-1.5 md:gap-2">
              <div className="w-5 h-5 md:w-6 md:h-6 bg-green-500/10 rounded-lg flex items-center justify-center border border-green-500/10">
                <ShieldCheck className="w-3 h-3 md:w-3.5 md:h-3.5 text-green-500" />
              </div>
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-300">Safe Web</span>
            </div>
            <div className="w-px h-3 bg-white/5 hidden md:block" />
            <div className="flex items-center gap-1.5 md:gap-2">
              <div className="w-5 h-5 md:w-6 md:h-6 bg-yellow-500/10 rounded-lg flex items-center justify-center border border-yellow-500/10">
                <TrendingUp className="w-3 h-3 md:w-3.5 md:h-3.5 text-yellow-500" />
              </div>
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-300">Updated</span>
            </div>
          </div>
        </div>

        <div className="hidden md:block relative z-10 p-8 glass-card rounded-[2rem] border-white/5 scale-90 group-hover:scale-100 transition-transform duration-700">
           <Zap className="w-16 h-16 text-blue-500 shadow-[0_0_50px_rgba(37,99,235,0.2)]" />
        </div>

        {/* Decorative elements */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 md:w-64 md:h-64 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,rgba(37,99,235,0.05),transparent)]" />
      </motion.div>
    </section>
  );
}
