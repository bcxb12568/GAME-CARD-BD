import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Game, AdSettings, SiteSettings } from './types';
import Header from './components/Header';
import Hero from './components/Hero';
import GameCard from './components/GameCard';
import DownloadModal from './components/DownloadModal';
import AdminPanel from './components/AdminPanel';
import { Search, Zap } from 'lucide-react';
import { cn } from './lib/utils';
import { QRCodeSVG } from 'qrcode.react';

export default function App() {
  const [games, setGames] = useState<Game[]>([]);
  const [ads, setAds] = useState<AdSettings>({ headerAd: '', downloadPageAd: '' });
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<SiteSettings>({
    backgroundImage: '',
    backgroundVideo: '',
    backgroundType: 'image',
    backgroundColor: '#050505',
    backgroundAnimation: 'none',
    overlayOpacity: 0.5
  });
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const faviconElement = document.getElementById('favicon') as HTMLLinkElement | null;
    const shortcutElement = document.getElementById('favicon-shortcut') as HTMLLinkElement | null;
    const appleElement = document.getElementById('favicon-apple') as HTMLLinkElement | null;
    
    const elements = [faviconElement, shortcutElement, appleElement];
    const defaultIcon = '/uploads/1780932924288-667597334-1000012555.png';
    const activeUrl = settings?.faviconImage || settings?.logoImage || defaultIcon;

    elements.forEach(el => {
      if (el) {
        el.href = activeUrl;
      }
    });
  }, [settings?.faviconImage, settings?.logoImage]);

  const fetchData = async () => {
    try {
      const [gamesRes, adsRes, settingsRes] = await Promise.all([
        fetch('/api/games'),
        fetch('/api/ads'),
        fetch('/api/settings')
      ]);
      const gamesData = await gamesRes.json();
      const adsData = await adsRes.json();
      const settingsData = await settingsRes.json();
      setGames(gamesData);
      setAds(adsData);
      setSettings(settingsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredGames = games.filter(game => {
    const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || game.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', 'Open World', 'Racing', 'RPG', 'Action', 'Sports'];

  if (showAdmin) {
    return <AdminPanel onClose={() => setShowAdmin(false)} onRefresh={fetchData} />;
  }

  return (
    <div 
      className="h-screen text-slate-100 flex flex-col overflow-hidden selection:bg-blue-500/30 relative"
      style={{ backgroundColor: settings.backgroundColor }}
    >
      {/* Background Layer */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {settings.backgroundType === 'video' && settings.backgroundVideo ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            src={settings.backgroundVideo}
          />
        ) : settings.backgroundImage ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 1,
              scale: settings.backgroundAnimation === 'slow-pulse' ? [1, 1.05, 1] : 1,
              x: settings.backgroundAnimation === 'gentle-orbit' ? [0, 20, -20, 0] : 0,
              y: settings.backgroundAnimation === 'gentle-orbit' ? [0, -20, 20, 0] : 0
            }}
            transition={{
              duration: settings.backgroundAnimation === 'slow-pulse' ? 20 : 40,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${settings.backgroundImage})` }}
          />
        ) : null}
        <div 
          className="absolute inset-0" 
          style={{ backgroundColor: `rgba(0,0,0,${settings.overlayOpacity})` }} 
        />
        {/* Decorative Gradients */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.1),transparent_50%)]" />
      </div>

      <div className="relative z-10 flex flex-col h-full bg-transparent">
        {/* Header Ad Slot */}
        <div 
          className="w-full bg-black/40 backdrop-blur-sm border-b border-white/5 py-1 flex justify-center items-center min-h-[32px] text-[9px] font-bold text-blue-400 uppercase tracking-[0.2em] overflow-hidden whitespace-nowrap"
          dangerouslySetInnerHTML={{ __html: ads.headerAd || '⚡️ Premium Gaming Platform - High Speed Downloads ⚡️' }}
        />

        <Header 
          onAdminTrigger={() => setShowAdmin(true)} 
          settings={settings}
        />
        
        <div className="flex flex-1 overflow-hidden relative">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:flex w-64 bg-black/20 backdrop-blur-md border-r border-white/1 character-sidebar flex-col p-6 overflow-y-auto custom-scrollbar">
          <div className="mb-8">
            <h3 className="text-[10px] uppercase tracking-widest text-slate-500 mb-4 font-bold">Categories</h3>
            <ul className="space-y-1">
              {categories.map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => setActiveCategory(cat)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
                      activeCategory === cat 
                        ? "text-blue-400 font-semibold bg-blue-500/5" 
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full transition-all",
                      activeCategory === cat ? "bg-blue-500 shadow-[0_0_8px_#3b82f6]" : "bg-slate-700"
                    )} />
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-auto p-4 bg-blue-600/10 rounded-2xl border border-blue-500/20">
            <p className="text-[11px] text-blue-300 mb-3 font-medium">Installation Issues?</p>
            <button className="text-[10px] font-bold bg-blue-500 hover:bg-blue-400 text-white w-full py-2.5 rounded-lg uppercase tracking-tighter transition-all">
              View Setup Guide
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto custom-scrollbar p-4 md:p-6 pb-6">
          <Hero />

          <div className="mt-8 relative group max-w-3xl mx-auto w-full">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[1.5rem] blur opacity-10 group-focus-within:opacity-30 transition duration-1000" />
            <div className="relative flex items-center bg-slate-900/60 border border-white/5 rounded-[1.2rem] overflow-hidden focus-within:border-blue-500/30 transition-all shadow-xl">
              <div className="pl-5">
                <Search className="w-5 h-5 text-blue-500/50" />
              </div>
              <input
                type="text"
                placeholder="আপনার গেমটি সার্চ করুন..."
                className="flex-1 bg-transparent py-4 px-4 text-xs md:text-sm outline-none placeholder:text-slate-600 text-white font-medium tracking-wide"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="pr-5 text-slate-500 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Categories - Compact & Professional */}
          <div className="mt-8 flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-[9px] uppercase tracking-[0.25em] font-black text-slate-600">Categories</h3>
              <div className="h-[1px] flex-1 bg-white/5 ml-4" />
            </div>
            <div className="overflow-x-auto scrollbar-hide flex gap-2 pb-2 -mx-1 px-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "px-5 py-2.5 rounded-xl whitespace-nowrap text-[10px] font-bold uppercase tracking-widest transition-all border shrink-0",
                    activeCategory === cat 
                      ? "bg-blue-600 border-blue-500 text-white shadow-lg" 
                      : "bg-slate-900/40 border-white/5 text-slate-500 hover:text-slate-300"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 mb-5 flex items-center justify-between">
            <h2 className="text-sm md:text-base font-bold tracking-tight text-white/80">
              {activeCategory === 'All' ? 'সব গেমসমূহ' : `${activeCategory} গেম`}
            </h2>
            <div className="flex items-center gap-2 px-2.5 py-1 bg-white/5 rounded-lg border border-white/5">
              <span className="w-1 h-1 rounded-full bg-blue-500" />
              <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">{filteredGames.length} গেম</span>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-[4/3] bg-slate-900/40 rounded-2xl md:rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : filteredGames.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-6">
              {filteredGames.map((game, index) => (
                <GameCard 
                  key={game.id} 
                  game={game} 
                  index={index} 
                  onClick={() => setSelectedGame(game)} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-900/20 rounded-3xl border border-white/5 border-dashed">
              <Zap className="w-12 h-12 mx-auto mb-4 text-blue-500 opacity-20" />
              <p className="text-slate-500 text-sm font-medium">কোনো গেম পাওয়া যায়নি!</p>
            </div>
          )}

          {/* Footer Promo Section */}
          <section className="mt-10 p-6 md:p-8 rounded-3xl glass-card relative overflow-hidden group border-white/10 shrink-0">
            <div className="absolute -right-24 -bottom-24 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
              <div className="max-w-md">
                <span className="text-[9px] bg-blue-600 px-2.5 py-1 rounded-full mb-3 inline-block font-bold tracking-widest uppercase">Premium Speed</span>
                <h2 className="text-xl md:text-2xl font-bold mb-2 tracking-tight">প্রিমিয়াম গিগাবিট ডাউনলোড লাইন</h2>
                <p className="text-xs md:text-sm text-slate-400">আমাদের স্পেশাল সার্ভার থেকে কোনো লিমিট ছাড়াই সরাসরি ডাউনলোড করুন আপনার পছন্দের গেম।</p>
              </div>
            </div>
          </section>

          <footer className="mt-12 py-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 opacity-40 text-center">
             <p className="text-[10px] uppercase font-bold tracking-[0.2em]">© 2026 Game-Cart BD. PREMIUM TECH.</p>
             <div className="flex gap-6 text-[10px] uppercase tracking-widest font-bold">
               <a href="#" className="hover:text-blue-400">Privacy</a>
               <a href="#" className="hover:text-blue-400">Terms</a>
             </div>
          </footer>
        </main>

        {/* Desktop Right Panel */}
        <aside className="hidden xl:flex w-72 bg-slate-900/20 border-l border-white/5 flex-col p-6 overflow-y-auto custom-scrollbar gap-6">
          <div className="bg-slate-800/20 rounded-2xl p-5 border border-white/5 shadow-inner">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Quick Mobile Sync</h4>
            <div className="w-32 h-32 bg-white/5 p-3 mx-auto rounded-2xl border border-white/10 flex items-center justify-center">
              <div className="w-full h-full text-slate-100 opacity-80">
                <QRCodeSVG value={window.location.href} size={104} bgColor="transparent" fgColor="currentColor" />
              </div>
            </div>
            <p className="text-[10px] text-center text-slate-400 mt-4 leading-relaxed px-2 font-medium">Scan to browse and download from your smartphone.</p>
          </div>

          <div className="bg-gradient-to-br from-indigo-900/40 to-blue-900/40 p-5 rounded-2xl border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3">
               <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse ring-4 ring-red-500/20" />
            </div>
            <h4 className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-2 flex items-center gap-2">
              Live Stats
            </h4>
            <div className="text-3xl font-bold font-mono tracking-tighter">1,248</div>
            <p className="text-[10px] text-white/40 mt-1 font-medium">Users currently active</p>
          </div>
        </aside>
      </div>

      <AnimatePresence>
        {selectedGame && (
          <DownloadModal 
            game={selectedGame} 
            adCode={ads.downloadPageAd}
            onClose={() => setSelectedGame(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  </div>
  );
}
