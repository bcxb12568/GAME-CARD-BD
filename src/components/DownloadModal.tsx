import { Game } from '../types';
import { X, Download, ShieldCheck, Clock, Share2, Info, Monitor, Cpu, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { cn } from '../lib/utils';

interface DownloadModalProps {
  game: Game;
  adCode: string;
  onClose: () => void;
}

export default function DownloadModal({ game, adCode, onClose }: DownloadModalProps) {
  const [timer, setTimer] = useState(5);
  const [canDownload, setCanDownload] = useState(false);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    } else {
      setCanDownload(true);
    }
  }, [timer]);

  const handleDownload = () => {
    if (!canDownload) return;
    
    // If it's a local upload, use our secure download API
    if (game.downloadUrl.startsWith('/uploads/')) {
      const filename = game.downloadUrl.split('/').pop();
      window.location.href = `/api/download/${filename}`;
    } else {
      // If it's an external link (Drive/Mega), open in new tab
      window.open(game.downloadUrl, '_blank');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-black/95 backdrop-blur-2xl"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="relative w-full h-full md:h-auto md:max-w-4xl md:max-h-[90vh] bg-[#0a0a0a] border-y md:border border-white/10 md:rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row shadow-[0_0_100px_rgba(37,99,235,0.1)]"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 md:top-6 md:right-6 z-50 p-2 bg-white/10 md:bg-white/5 hover:bg-white/20 rounded-full transition-colors text-white"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Left Side: Game Info */}
        <div className="w-full md:w-[40%] bg-gradient-to-b from-[#111] to-[#0a0a0a] p-6 md:p-8 border-b md:border-b-0 md:border-r border-white/5 shrink-0 overflow-y-auto md:overflow-visible">
          <div className="aspect-square md:aspect-square w-32 md:w-full rounded-2xl md:rounded-3xl overflow-hidden mb-4 md:mb-6 shadow-2xl mx-auto">
            <img 
              src={game.image} 
              alt={game.name} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-lg md:text-2xl font-bold mb-2 tracking-tight">{game.name}</h2>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4 md:mb-6">
              <span className="px-2.5 py-1 bg-blue-600/10 text-blue-400 text-[8px] md:text-[10px] font-black rounded-lg border border-blue-500/10 uppercase tracking-widest">{game.category}</span>
              <span className="px-2.5 py-1 bg-white/5 text-white/40 text-[8px] md:text-[10px] font-black rounded-lg border border-white/5 uppercase tracking-widest">{game.size}</span>
            </div>

            <div className="space-y-2 md:space-y-3 mb-6 md:mb-8 text-left">
              <div className="flex items-center gap-3 text-white/40">
                <Monitor className="w-3.5 h-3.5 text-blue-500/50 shrink-0" />
                <span className="text-[10px] md:text-xs truncate">Requires: {game.requirements}</span>
              </div>
              <div className="flex items-center gap-3 text-white/40">
                <ShieldCheck className="w-3.5 h-3.5 text-green-500/50 shrink-0" />
                <span className="text-[10px] md:text-xs tracking-wide">Secure & Verified</span>
              </div>
            </div>

            <div className="hidden md:inline-block p-4 bg-white/5 rounded-2xl border border-white/5">
               <div className="flex flex-col items-center gap-2">
                  <QRCodeSVG value={window.location.href} size={100} bgColor="transparent" fgColor="white" />
                  <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">Mobile Scan</span>
               </div>
            </div>
          </div>
        </div>

        {/* Right Side: Action Area */}
        <div className="flex-grow p-6 md:p-8 overflow-y-auto custom-scrollbar bg-slate-900/10">
          {/* Waiting Ad Page */}
          {!canDownload ? (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center">
               <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-white/5 flex items-center justify-center relative mb-6">
                  <div className="absolute inset-0 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                  <span className="text-xl md:text-2xl font-black">{timer}</span>
               </div>
               <h3 className="text-base md:text-lg font-bold mb-2 tracking-tight">ডাউনলোড প্রস্তুত হচ্ছে...</h3>
               <p className="text-[10px] md:text-xs text-white/30 max-w-[280px] mb-8 leading-relaxed font-medium">নিচের অ্যাডটি দেখুন, কিছুক্ষণেই আপনার ডাউনলোড লিংক পেয়ে যাবেন।</p>
               
               {/* Waiting Ad Content */}
               <div className="w-full max-w-sm aspect-video bg-white/5 rounded-2xl border border-white/5 flex items-center justify-center overflow-hidden"
                 dangerouslySetInnerHTML={{ __html: adCode }}
               />
               <div className="mt-4 text-[8px] text-white/10 font-black uppercase tracking-[0.3em]">Commercial Ad</div>
            </div>
          ) : (
            <div className="space-y-6">
              <section>
                <div className="flex items-center gap-2 text-blue-500 mb-3">
                  <Info className="w-4 h-4" />
                  <h3 className="text-[9px] font-black uppercase tracking-[0.25em]">Description</h3>
                </div>
                <p className="text-[11px] md:text-xs text-white/50 leading-relaxed font-medium">{game.description}</p>
              </section>

              <section>
                <div className="flex items-center gap-2 text-blue-500 mb-3">
                  <ShieldCheck className="w-4 h-4" />
                  <h3 className="text-[9px] font-black uppercase tracking-[0.25em]">File Verification</h3>
                </div>
                <div className="p-5 rounded-xl bg-blue-600/5 border border-blue-500/20 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-3">
                    <Zap className="w-6 h-6 text-blue-500" />
                  </div>
                  <h4 className="text-sm font-bold mb-1">{game.name}</h4>
                  <p className="text-[10px] text-white/40 mb-3 uppercase tracking-widest font-black">{game.size} • Verified & Secure</p>
                  <p className="text-[10px] text-blue-300 leading-relaxed max-w-[240px]">আমাদের হাই-স্পীড সার্ভার থেকে সরাসরি ডাউনলোড করার জন্য নিচের বাটনে ক্লিক করুন।</p>
                </div>
              </section>

                      <div className="flex flex-col gap-4 pb-10 md:pb-0">
                <button
                  onClick={handleDownload}
                  disabled={!canDownload}
                  className={cn(
                    "w-full py-4 font-black rounded-xl shadow-xl transition-all flex items-center justify-center gap-3 text-[10px] md:text-xs uppercase tracking-widest",
                    canDownload 
                      ? "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20" 
                      : "bg-white/5 text-white/20 cursor-not-allowed border border-white/5"
                  )}
                >
                  {canDownload ? (
                    <>
                      <Download className="w-4 h-4 md:w-5 md:h-5" />
                      {game.downloadUrl.startsWith('/uploads/') ? 'সরাসরি ডাউনলোড করুন' : 'ডাউনলোড লিঙ্ক ওপেন করুন'}
                    </>
                  ) : (
                    <>
                      <span className="w-5 h-5 flex items-center justify-center border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mr-2" />
                      অপেক্ষা করুন ({timer} সেকেন্ড)
                    </>
                  )}
                </button>
                <div className="flex items-center justify-center gap-6 text-white/10 text-[8px] font-black uppercase tracking-[0.3em]">
                  <span className="flex items-center gap-1.5"><ShieldCheck className="w-3 h-3" /> Secure</span>
                  <span className="flex items-center gap-1.5"><Zap className="w-3 h-3" /> Fast</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
