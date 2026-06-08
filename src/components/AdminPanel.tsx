import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Plus, Trash2, Save, Layout, Megaphone, Lock, ArrowLeft, Upload, Link, Palette, ImageIcon, Cloud, Zap } from 'lucide-react';
import { Game, AdSettings, SiteSettings } from '../types';
import { cn } from '../lib/utils';
import React from 'react';

interface AdminPanelProps {
  onClose: () => void;
  onRefresh: () => void;
}

export default function AdminPanel({ onClose, onRefresh }: AdminPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'add-game' | 'manage-games' | 'ads' | 'settings'>('manage-games');
  const [games, setGames] = useState<Game[]>([]);
  const [ads, setAds] = useState<AdSettings>({ headerAd: '', downloadPageAd: '' });
  const [settings, setSettings] = useState<SiteSettings>({
    backgroundImage: '',
    backgroundVideo: '',
    backgroundType: 'image',
    backgroundColor: '#050505',
    backgroundAnimation: 'none',
    overlayOpacity: 0.5,
    logoImage: '',
    logoSize: 64
  });
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [downloadMethod, setDownloadMethod] = useState<'link' | 'file'>('link');
  
  // New Game Form
  const [newGame, setNewGame] = useState<Partial<Game>>({
    name: '',
    size: '',
    category: 'Action',
    rating: 4.5,
    image: '',
    description: '',
    downloadUrl: '',
    requirements: '4GB RAM, 10GB HDD',
    videoUrl: ''
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'image' | 'downloadUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024 * 1024) {
      alert('File size exceeds 10GB limit!');
      return;
    }

    setUploading(true);
    try {
      if (field === 'image') {
        // Image handling: Use Base64 for stability on Vercel/serverless
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          setNewGame(prev => ({ ...prev, image: result }));
          setUploading(false);
          alert('ছবি লোড হয়েছে!');
        };
        reader.readAsDataURL(file);
      } else {
        // Game File handling: Send to server API
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });

        if (!res.ok) {
          const text = await res.text();
          console.error('Server response:', text);
          throw new Error('আপনার সার্ভার বড় ফাইল গ্রহণ করতে পারছে না। ছোট ফাইল ট্রাই করুন বা External Link ব্যবহার করুন।');
        }

        const data = await res.json();
        const fileUrl = data.url;
        const sizeInBytes = file.size;
        let sizeDisplay = '';
        if (sizeInBytes > 1024 * 1024 * 1024) {
          sizeDisplay = `${(sizeInBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
        } else {
          sizeDisplay = `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
        }

        setNewGame(prev => ({ 
          ...prev, 
          [field]: fileUrl,
          size: sizeDisplay
        }));
        alert('ফাইল আপলোড হয়েছে!');
        setUploading(false);
      }
    } catch (error: any) {
      console.error('Upload Error Details:', error);
      alert(`ত্রুটি: ${error.message}`);
      setUploading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAdminData();
    }
  }, [isAuthenticated]);

  const fetchAdminData = async () => {
    const [gRes, aRes, sRes] = await Promise.all([
      fetch('/api/games'),
      fetch('/api/ads'),
      fetch('/api/settings')
    ]);
    setGames(await gRes.json());
    setAds(await aRes.json());
    setSettings(await sRes.json());
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect Password');
    }
  };

  const handleAddGame = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      const res = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, game: newGame })
      });
      if (res.ok) {
        setNewGame({ name: '', size: '', category: 'Action', rating: 4.5, image: '', description: '', downloadUrl: '', requirements: '4GB RAM, 10GB HDD', videoUrl: '' });
        await fetchAdminData();
        onRefresh();
        alert('Game published successfully!');
      } else {
        const err = await res.json();
        alert(`Error: ${err.error || 'Failed to publish game'}. Large files might exceed upload limits.`);
      }
    } catch (error) {
      console.error(error);
      alert('Network error or payload too large. If uploading a file, try using a link instead.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteGame = async (gameId: string) => {
    if (!gameId) {
      alert('গেমটির কোনো আইডি নেই, ডিলিট করা সম্ভব নয়।');
      return;
    }

    // if (!confirm('আপনি কি নিশ্চিত যে এই গেমটি ডিলিট করতে চান?')) return;
    
    setDeletingId(gameId);
    try {
      console.log(`Sending delete request for game ID: ${gameId}`);
      // Ensure the string conversion happens clearly
      const cleanId = String(gameId).trim();
      
      const res = await fetch(`/api/games/${cleanId}/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      
      if (res.ok) {
        // Optimistic update
        setGames(prev => prev.filter(g => String(g.id).trim() !== cleanId));
        await fetchAdminData();
        onRefresh();
        alert('গেমটি সফলভাবে ডিলিট করা হয়েছে।');
      } else {
        const err = await res.json();
        alert(`ভুল হয়েছে: ${err.error || 'গেমটি ডিলিট করা যায়নি'}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('সার্ভার এর সাথে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSaveAds = async () => {
    try {
      const res = await fetch('/api/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, ads })
      });
      if (res.ok) {
        alert('অ্যাড সেটিংস সফলভাবে আপডেট করা হয়েছে।');
        onRefresh();
      } else {
        const err = await res.json();
        alert(`ভুল: ${err.error || 'সেটিংস সেভ করতে ব্যর্থ হয়েছে'}`);
      }
    } catch (error) {
      console.error('Ads save error:', error);
      alert('সার্ভার এর সাথে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    }
  };

  const handleSaveSettings = async () => {
    setUploading(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, settings })
      });
      if (res.ok) {
        alert('সাইট সেটিংস সফলভাবে সেভ করা হয়েছে।');
        onRefresh();
      } else {
        const err = await res.json();
        alert(`ভুল: ${err.error || 'সেটিংস সেভ করতে ব্যর্থ হয়েছে'}`);
      }
    } catch (error) {
      console.error('Settings save error:', error);
      alert('সার্ভার এর সাথে সমস্যা হয়েছে। আবার চেষ্টা করুন। ইমেজ বা ভিডিও এর সাইজ হয়তো অনেক বড়।');
    } finally {
      setUploading(false);
    }
  };

  const handleSettingUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'logo') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (limit to 1GB for faster network speeds)
    if (file.size > 1024 * 1024 * 1024) {
      alert('File size too large. Please keep it under 1GB.');
      return;
    }

    setUploading(true);
    
    if (type === 'logo') {
      try {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });

        if (!res.ok) throw new Error('Logo upload failed. Please try a smaller image.');

        const data = await res.json();
        setSettings(prev => ({ ...prev, logoImage: data.url }));
        alert('লোগো সফলভাবে আপলোড করা হয়েছে!');
      } catch (error: any) {
        console.error(error);
        alert(error.message);
      } finally {
        setUploading(false);
      }
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (type === 'image') {
        setSettings(prev => ({ ...prev, backgroundImage: result }));
      } else {
        setSettings(prev => ({ ...prev, backgroundVideo: result }));
      }
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 shadow-2xl"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Login</h1>
            <p className="text-white/40 mt-1">Authorized Access Only</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">Password</label>
              <input 
                type="password" 
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
            </div>
            <div className="flex gap-4">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button" 
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 text-white/60 rounded-xl transition-all"
              >
                Back to Site
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.02, backgroundColor: '#3b82f6' }}
                whileTap={{ scale: 0.98 }}
                type="submit" 
                disabled={uploading}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                    <Zap className="w-5 h-5 fill-current" />
                  </motion.div>
                ) : (
                  'Login'
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 md:mb-12">
          <div className="flex items-center gap-4">
            <motion.button 
              whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-white/60"
            >
              <ArrowLeft className="w-4 h-4" />
            </motion.button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg md:text-xl font-bold tracking-tight">Admin Console</h1>
                <div className="flex items-center gap-1 px-1.5 py-0.5 bg-green-500/10 border border-green-500/20 rounded-md">
                  <Cloud className="w-2.5 h-2.5 text-green-500" />
                  <span className="text-[7px] font-black uppercase text-green-500 tracking-tighter">Supabase Synced</span>
                </div>
              </div>
              <p className="text-white/30 text-[9px] md:text-[10px] uppercase font-bold tracking-widest">System Control</p>
            </div>
          </div>
          
          <div className="flex p-0.5 bg-white/5 rounded-xl border border-white/5 overflow-x-auto scrollbar-hide">
            <button 
              onClick={() => setActiveTab('manage-games')}
              className={`flex items-center gap-1.5 px-4 md:px-5 py-2 rounded-lg transition-all whitespace-nowrap text-[10px] font-black uppercase tracking-widest ${activeTab === 'manage-games' ? 'bg-blue-600 text-white shadow-md' : 'text-white/40 hover:text-white'}`}
            >
              <Layout className="w-3.5 h-3.5" />
              Library
            </button>
            <button 
              onClick={() => setActiveTab('add-game')}
              className={`flex items-center gap-1.5 px-4 md:px-5 py-2 rounded-lg transition-all whitespace-nowrap text-[10px] font-black uppercase tracking-widest ${activeTab === 'add-game' ? 'bg-blue-600 text-white shadow-md' : 'text-white/40 hover:text-white'}`}
            >
              <Plus className="w-3.5 h-3.5" />
              Upload
            </button>
            <button 
              onClick={() => setActiveTab('ads')}
              className={`flex items-center gap-1.5 px-4 md:px-5 py-2 rounded-lg transition-all whitespace-nowrap text-[10px] font-black uppercase tracking-widest ${activeTab === 'ads' ? 'bg-blue-600 text-white shadow-md' : 'text-white/40 hover:text-white'}`}
            >
              <Megaphone className="w-3.5 h-3.5" />
              AdSense
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-1.5 px-4 md:px-5 py-2 rounded-lg transition-all whitespace-nowrap text-[10px] font-black uppercase tracking-widest ${activeTab === 'settings' ? 'bg-blue-600 text-white shadow-md' : 'text-white/40 hover:text-white'}`}
            >
              <Palette className="w-3.5 h-3.5" />
              Theme
            </button>
          </div>
        </header>

        {activeTab === 'add-game' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl md:rounded-3xl p-6 md:p-8">
              <h2 className="text-lg md:text-xl font-bold mb-6 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-500" />
                Add New Game
              </h2>
              <form onSubmit={handleAddGame} className="space-y-4">
                <div className="space-y-3 md:space-y-4">
                  <input 
                    placeholder="Game Name"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:ring-1 focus:ring-blue-500 text-sm"
                    value={newGame.name}
                    onChange={e => setNewGame({...newGame, name: e.target.value})}
                    required
                  />
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <input 
                      placeholder="Size (e.g. 10 GB)"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:ring-1 focus:ring-blue-500 text-sm"
                      value={newGame.size}
                      onChange={e => setNewGame({...newGame, size: e.target.value})}
                      required={downloadMethod === 'link'}
                    />
                    <select 
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:ring-1 focus:ring-blue-500 text-sm"
                      value={newGame.category}
                      onChange={e => setNewGame({...newGame, category: e.target.value})}
                    >
                      <option value="Action">Action</option>
                      <option value="Open World">Open World</option>
                      <option value="Racing">Racing</option>
                      <option value="RPG">RPG</option>
                      <option value="Sports">Sports</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    {/* Resource Options (Image) */}
                    <div className="space-y-2">
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-500">গেমের কভার ফটো (Image)</label>
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-white/5 rounded-2xl border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                          {newGame.image ? (
                            <img src={newGame.image} className="w-full h-full object-cover" />
                          ) : (
                            <Plus className="w-6 h-6 text-white/20" />
                          )}
                        </div>
                        <label className="flex-1 cursor-pointer">
                          <div className="bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 rounded-xl py-3 px-4 text-center transition-all">
                            <span className="text-xs font-bold text-blue-400">গ্যালারি থেকে ফটো দিন</span>
                          </div>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => handleFileUpload(e, 'image')}
                          />
                        </label>
                      </div>
                    </div>

                    {/* Download Source Toggle */}
                    <div className="space-y-3">
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-500">ডাউনলোড মেথড সিলেক্ট করুন</label>
                      <div className="flex p-1 bg-white/5 rounded-xl border border-white/10">
                        <button 
                          type="button"
                          onClick={() => {
                            setNewGame(prev => ({ ...prev, downloadUrl: '', size: '' }));
                            setDownloadMethod('link');
                          }}
                          className={cn(
                            "flex-1 py-2 text-[10px] font-bold uppercase rounded-lg transition-all",
                            downloadMethod === 'link' ? "bg-blue-600 text-white" : "text-white/40 hover:text-white"
                          )}
                        >
                          External Link
                        </button>
                        <button 
                          type="button"
                          onClick={() => {
                            setNewGame(prev => ({ ...prev, downloadUrl: '', size: '' }));
                            setDownloadMethod('file');
                          }}
                          className={cn(
                            "flex-1 py-2 text-[10px] font-bold uppercase rounded-lg transition-all",
                            downloadMethod === 'file' ? "bg-blue-600 text-white" : "text-white/40 hover:text-white"
                          )}
                        >
                          Upload File
                        </button>
                      </div>
                      <p className="text-[10px] text-white/30 italic leading-relaxed">
                        * আপনার গেম ফাইল যদি অনেক বড় হয় (যেমন ১-১০ জিবি), তবে সেটি Google Drive-এ আপলোড করে তার "Direct Link" এখানে ব্যবহার করা সবচেয়ে নিরাপদ এবং দ্রুত।
                      </p>

                      {downloadMethod === 'file' ? (
                        <div className="space-y-2">
                          <label className="block cursor-pointer group">
                            <div className={cn(
                              "bg-white/5 border border-dashed border-white/10 rounded-xl py-8 px-4 text-center transition-all group-hover:border-blue-500/50 group-hover:bg-blue-500/5",
                              newGame.downloadUrl ? "border-blue-500/50 bg-blue-500/10" : ""
                            )}>
                              <Upload className={cn("w-6 h-6 mx-auto mb-2 transition-colors", newGame.downloadUrl ? "text-blue-500" : "text-white/20")} />
                              <span className="text-xs font-bold text-white/60 block uppercase">গেম ফাইল আপলোড করুন (Direct)</span>
                              {newGame.size && <span className="text-[10px] text-blue-400 font-mono mt-1 block">{newGame.size}</span>}
                            </div>
                            <input 
                              type="file" 
                              accept=".zip,.rar,.7z,.exe,.apk,.msi,.bin,.iso,application/*"
                              className="hidden" 
                              onChange={(e) => handleFileUpload(e, 'downloadUrl')}
                            />
                          </label>
                          <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest mt-2 block text-center">
                            Max Limit: 10 GB
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                           <input 
                              placeholder="গেমের ডাউনলোড লিংক পেষ্ট করুন (Google Drive/Mega)"
                              className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 focus:ring-1 focus:ring-blue-500 text-[11px] font-mono"
                              value={newGame.downloadUrl}
                              onChange={e => setNewGame({...newGame, downloadUrl: e.target.value})}
                              required
                            />
                            <input 
                              placeholder="ফাইল সাইজ লিখে দিন (যেমন: 15 GB)"
                              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:ring-1 focus:ring-blue-500 text-xs"
                              value={newGame.size}
                              onChange={e => setNewGame({...newGame, size: e.target.value})}
                              required={downloadMethod === 'link'}
                            />
                        </div>
                      )}
                    </div>

                    <textarea 
                      placeholder="Description (গেমের বর্ণনা এখানে লিখুন...)"
                      rows={4}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:ring-1 focus:ring-blue-500 resize-none text-sm"
                      value={newGame.description}
                      onChange={e => setNewGame({...newGame, description: e.target.value})}
                      required
                    />
                  </div>
                  <input 
                    placeholder="Requirements"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:ring-1 focus:ring-blue-500 text-xs md:text-sm"
                    value={newGame.requirements}
                    onChange={e => setNewGame({...newGame, requirements: e.target.value})}
                  />
                </div>
                <motion.button 
                  whileHover={{ scale: uploading ? 1 : 1.02, backgroundColor: uploading ? '#1e40af' : '#3b82f6' }}
                  whileTap={{ scale: 0.98 }}
                  disabled={uploading}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 mt-4 text-sm uppercase tracking-widest"
                >
                  {uploading ? (
                    <>
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                        <Zap className="w-5 h-5 fill-current" />
                      </motion.div>
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Publish Game
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'manage-games' && (
          <div className="max-w-4xl mx-auto space-y-4">
            <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6">Published Games ({games.length})</h2>
            <div className="grid gap-3">
              {games.map(game => (
                <div key={game.id} className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-4 md:p-6 flex items-center justify-between group hover:border-white/20 transition-all">
                  <div className="flex items-center gap-4 md:gap-6 min-w-0">
                    <img src={game.image} className="w-12 h-12 md:w-16 md:h-16 rounded-xl object-cover shrink-0" referrerPolicy="no-referrer" />
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm md:text-lg truncate">{game.name}</h3>
                      <div className="flex flex-wrap gap-2 md:gap-4 text-[10px] md:text-xs text-white/40 mt-1">
                        <span className="uppercase font-bold tracking-widest">{game.category}</span>
                        <span className="opacity-50">•</span>
                        <span>{game.size}</span>
                        <span className="opacity-50">•</span>
                        <span className="text-yellow-500 font-bold">★ {game.rating}</span>
                      </div>
                    </div>
                  </div>
                  <motion.button 
                    whileHover={{ scale: deletingId === game.id ? 1 : 1.1, backgroundColor: deletingId === game.id ? '' : '#ef4444' }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDeleteGame(game.id)}
                    disabled={deletingId !== null}
                    className={cn(
                      "p-2.5 md:p-3 rounded-xl transition-all shrink-0 ml-4 flex items-center justify-center",
                      deletingId === game.id ? "bg-red-500/50 text-white cursor-not-allowed" : "bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white"
                    )}
                  >
                    {deletingId === game.id ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                        <Zap className="w-5 h-5 fill-current" />
                      </motion.div>
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                  </motion.button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'ads' && (
          <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
            <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl md:rounded-3xl p-6 md:p-8">
              <div className="flex items-center gap-2 mb-4 md:mb-6">
                <Link className="w-5 h-5 text-blue-500" />
                <h2 className="text-lg md:text-xl font-bold">AdSense Configuration</h2>
              </div>
              <div className="space-y-6">
                <div>
                   <p className="text-white/60 text-xs md:text-sm font-bold uppercase tracking-widest mb-3">Google AdSense Script (Header)</p>
                   <p className="text-[10px] text-white/30 mb-2 leading-relaxed italic">আপনার গুগল এডসেন্স এর অটো-এডস অথবা ব্যানার স্ক্রিপ্টটি এখানে পেস্ট করুন। এটি আপনার ওয়েবসাইটের ওপরের অংশে প্রদর্শিত হবে এবং আপনি ইনকাম করতে পারবেন।</p>
                   <textarea 
                    rows={10}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:ring-1 focus:ring-blue-500 font-mono text-[10px] md:text-xs"
                    placeholder="<!-- Paste Google AdSense code here -->"
                    value={ads.headerAd}
                    onChange={e => setAds({...ads, headerAd: e.target.value})}
                  />
                </div>
              </div>

              <motion.button 
                whileHover={{ scale: uploading ? 1 : 1.02, backgroundColor: uploading ? '#166534' : '#22c55e' }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSaveAds}
                disabled={uploading}
                className="w-full mt-8 py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-green-500/20 flex items-center justify-center gap-2 text-sm uppercase tracking-widest disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                    <Zap className="w-5 h-5 fill-current" />
                  </motion.div>
                ) : (
                  <Save className="w-5 h-5" />
                )}
                Save & Start Earning
              </motion.button>
            </div>
          </div>
        )}
        {activeTab === 'settings' && (
          <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 pb-20">
            <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl md:rounded-3xl p-6 md:p-8">
              <div className="flex items-center gap-2 mb-6 md:mb-8">
                <Palette className="w-5 h-5 text-blue-500" />
                <h2 className="text-lg md:text-xl font-bold">Background & Theme</h2>
              </div>

              {/* BRAND LOGO MANAGEMENT */}
              <div className="mb-8 p-5 bg-white/5 rounded-2xl border border-white/10 space-y-4">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-cyan-400" />
                  <label className="text-[10px] uppercase tracking-widest font-extrabold text-slate-300">ওয়েবসাইট লোগো (Brand Logo Upload)</label>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-5">
                  <div className="w-20 h-20 bg-[#070b14] border border-cyan-500/20 rounded-2xl flex items-center justify-center p-2 relative shrink-0">
                    {settings.logoImage ? (
                      <img src={settings.logoImage} className="w-full h-full object-contain" alt="Current Logo" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="text-center">
                        <span className="text-[8px] font-black uppercase text-cyan-400 tracking-tighter">Default SVG</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 w-full space-y-3">
                    <p className="text-[10px] text-white/30 italic">আপনার ব্র্যান্ডের লোগোটি এখানে জেপিজি বা পিএনজি ফরমেটে আপলোড করুন। খালি রাখলে ডিফল্ট সুন্দর অ্যানিমেটেড গেমিং লোগোটিই চলবে।</p>
                    <div className="flex flex-wrap gap-2">
                      <label className="cursor-pointer">
                        <div className="bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 rounded-xl py-2.5 px-4 text-center transition-all">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">লোগো ছবি আপলোড দিন</span>
                        </div>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => handleSettingUpload(e, 'logo')} 
                        />
                      </label>
                      {settings.logoImage && (
                        <button 
                          type="button"
                          onClick={() => {
                            setSettings(prev => ({ ...prev, logoImage: '' }));
                            alert('ডিফল্ট লোগো রিস্টোর করা হয়েছে, সেভ-এ ক্লিক করুন!');
                          }}
                          className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl py-2.5 px-4 text-center text-[10px] font-bold uppercase tracking-wider text-red-500 transition-all"
                        >
                          ডিফল্ট লোগো ফিরিয়ে আনুন
                        </button>
                      )}
                    </div>
                    {/* Manual Link Input */}
                    <input 
                      type="text"
                      placeholder="অথবা লোগো ইমেজের ডিরেক্ট লিংক দিন..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-[11px] font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      value={settings.logoImage || ''}
                      onChange={e => setSettings({...settings, logoImage: e.target.value})}
                    />

                    {/* Logo Display Size adjustment */}
                    <div className="pt-3 border-t border-white/5 space-y-2 font-sans">
                      <div className="flex justify-between items-center text-[10px] uppercase tracking-wider text-slate-300 font-extrabold">
                        <span>লোগোর আকার নিয়ন্ত্রণ (Logo Display Size)</span>
                        <span className="text-cyan-400 font-mono">{(settings.logoSize || 64)}px</span>
                      </div>
                      <input 
                        type="range"
                        min="24"
                        max="160"
                        value={settings.logoSize || 64}
                        onChange={e => setSettings({...settings, logoSize: Number(e.target.value)})}
                        className="w-full accent-cyan-500 bg-white/10 rounded-lg appearance-none h-1.5 cursor-pointer"
                      />
                      <div className="flex justify-between text-[8px] uppercase tracking-tighter text-white/30 font-semibold font-mono">
                        <span>Min: 24px</span>
                        <span>Default: 64px</span>
                        <span>Max: 160px</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8 md:gap-12">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-500">ব্যাকগ্রাউন্ড টাইপ (Type)</label>
                    <div className="flex p-1 bg-white/5 rounded-xl border border-white/10">
                      <button 
                        onClick={() => setSettings({...settings, backgroundType: 'image'})}
                        className={cn(
                          "flex-1 py-2 text-[10px] font-bold uppercase rounded-lg transition-all",
                          settings.backgroundType === 'image' ? "bg-blue-600 text-white" : "text-white/40 hover:text-white"
                        )}
                      >
                        Static Image
                      </button>
                      <button 
                        onClick={() => setSettings({...settings, backgroundType: 'video'})}
                        className={cn(
                          "flex-1 py-2 text-[10px] font-bold uppercase rounded-lg transition-all",
                          settings.backgroundType === 'video' ? "bg-blue-600 text-white" : "text-white/40 hover:text-white"
                        )}
                      >
                        Live Video
                      </button>
                    </div>
                  </div>

                  {settings.backgroundType === 'image' ? (
                    <div className="space-y-3">
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-500">ব্যাকগ্রাউন্ড ওয়ালপেপার (Image)</label>
                      <div className="relative aspect-video bg-white/5 rounded-2xl border border-white/10 overflow-hidden group">
                        {settings.backgroundImage ? (
                          <img src={settings.backgroundImage} className="w-full h-full object-cover" />
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-white/20">
                            <ImageIcon className="w-10 h-10 mb-2" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">No Wallpaper Set</span>
                          </div>
                        )}
                        <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                          <span className="bg-white text-black px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest">Change Photo</span>
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleSettingUpload(e, 'image')} />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-500">লাইভ ভিডিও ওয়ালপেপার (Video)</label>
                      <div className="relative aspect-video bg-white/5 rounded-2xl border border-white/10 overflow-hidden group">
                        {settings.backgroundVideo ? (
                          <video src={settings.backgroundVideo} className="w-full h-full object-cover" muted loop />
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-white/20">
                            <Upload className="w-10 h-10 mb-2" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">No Video Uploaded</span>
                          </div>
                        )}
                        <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                          <span className="bg-white text-black px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest">Upload Video</span>
                          <input type="file" accept="video/*" className="hidden" onChange={(e) => handleSettingUpload(e, 'video')} />
                        </label>
                      </div>
                      <div className="flex gap-2">
                        <input 
                          type="text"
                          placeholder="Or paste video link"
                          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs"
                          value={settings.backgroundVideo}
                          onChange={e => setSettings({...settings, backgroundVideo: e.target.value})}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-500">ব্যাকগ্রাউন্ড কালার (Color)</label>
                    <div className="flex items-center gap-4">
                      <input 
                        type="color" 
                        className="w-12 h-12 bg-transparent border-none cursor-pointer"
                        value={settings.backgroundColor}
                        onChange={e => setSettings({...settings, backgroundColor: e.target.value})}
                      />
                      <input 
                        type="text"
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-mono w-full"
                        value={settings.backgroundColor}
                        onChange={e => setSettings({...settings, backgroundColor: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-500">ব্যাকগ্রাউন্ড এনিমেশন (Animation)</label>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        { id: 'none', label: 'No Animation' },
                        { id: 'slow-pulse', label: 'Slow Pulse' },
                        { id: 'gentle-orbit', label: 'Gentle Float' }
                      ].map(anim => (
                        <button
                          key={anim.id}
                          onClick={() => setSettings({...settings, backgroundAnimation: anim.id as any})}
                          className={cn(
                            "px-4 py-3 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all text-left",
                            settings.backgroundAnimation === anim.id 
                              ? "bg-blue-600 border-blue-500 text-white" 
                              : "bg-white/5 border-white/10 text-white/40 hover:text-white"
                          )}
                        >
                          {anim.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-500">ডার্ক ওভারলে (Opacity)</label>
                      <span className="text-[10px] font-mono text-blue-500">{(settings.overlayOpacity * 100).toFixed(0)}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.05"
                      className="w-full accent-blue-600"
                      value={settings.overlayOpacity}
                      onChange={e => setSettings({...settings, overlayOpacity: parseFloat(e.target.value)})}
                    />
                  </div>
                </div>
              </div>

              <motion.button 
                whileHover={{ scale: uploading ? 1 : 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={uploading}
                onClick={handleSaveSettings}
                className="w-full mt-10 py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.2em]"
              >
                {uploading ? (
                  <>
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                      <Zap className="w-5 h-5 fill-current" />
                    </motion.div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Apply Changes
                  </>
                )}
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
