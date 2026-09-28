import React, { useState } from 'react';
import { 
  Sparkles, 
  Music, 
  Database, 
  Cpu, 
  Disc, 
  Activity, 
  Sliders, 
  Layers, 
  Bot, 
  BarChart3, 
  FolderKanban, 
  GitFork, 
  Menu, 
  X,
  ChevronDown
} from 'lucide-react';

export type ActiveTab = 
  | 'home' 
  | 'studio' 
  | 'datasets' 
  | 'training' 
  | 'visualizer' 
  | 'pianoroll' 
  | 'library' 
  | 'audiolab' 
  | 'variations' 
  | 'cocomposer' 
  | 'analysis' 
  | 'projects' 
  | 'architecture';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenComposer: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenComposer }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const mainLinks: Array<{ id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'home', label: 'Home', icon: Music },
    { id: 'studio', label: 'Studio', icon: Sparkles },
    { id: 'pianoroll', label: 'Piano Roll', icon: Layers },
    { id: 'datasets', label: 'Datasets', icon: Database },
    { id: 'training', label: 'Training', icon: Cpu },
    { id: 'library', label: 'Library', icon: Disc },
    { id: 'visualizer', label: 'Visualizer', icon: Activity },
  ];

  const moreLinks: Array<{ id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'audiolab', label: 'Audio Lab & Mixer', icon: Sliders },
    { id: 'variations', label: 'AI Variation Engine', icon: GitFork },
    { id: 'cocomposer', label: 'AI Co-Composer', icon: Bot },
    { id: 'analysis', label: 'Music Analysis & DNA', icon: BarChart3 },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'architecture', label: 'Architecture & Docs', icon: Cpu },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#08090d]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2.5 text-left focus:outline-none group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-violet-600 p-[1px] shadow-sm">
              <div className="w-full h-full bg-[#0d1017] rounded-[7px] flex items-center justify-center group-hover:bg-[#121622] transition-colors">
                <Sparkles className="w-4 h-4 text-cyan-400 group-hover:rotate-12 transition-transform" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-black text-lg tracking-wider text-white uppercase flex items-center gap-1.5">
                NEURAL<span className="text-cyan-400">SONATA</span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" title="System Operational" />
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden lg:flex items-center gap-1">
          {mainLinks.map((link) => {
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => {
                  setActiveTab(link.id);
                  setDropdownOpen(false);
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isActive
                    ? 'text-cyan-300 bg-cyan-950/40 border border-cyan-800/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                }`}
              >
                <link.icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                {link.label}
              </button>
            );
          })}

          {/* More tools dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap flex items-center gap-1 ${
                moreLinks.some(l => l.id === activeTab)
                  ? 'text-cyan-300 bg-cyan-950/30 border border-cyan-800/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
              }`}
            >
              <span>More Labs</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-56 rounded-lg bg-[#0d1017] border border-white/10 shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                onMouseLeave={() => setDropdownOpen(false)}
              >
                {moreLinks.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs font-medium flex items-center gap-2.5 transition-colors ${
                      activeTab === item.id 
                        ? 'text-cyan-300 bg-cyan-950/50' 
                        : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
                    }`}
                  >
                    <item.icon className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded border border-white/10 bg-white/[0.02] text-[11px] font-mono text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>DEMO MODE ACTIVE</span>
          </div>

          <button
            onClick={() => {
              setActiveTab('studio');
              onOpenComposer();
            }}
            className="px-3.5 py-1.5 text-xs font-semibold text-black bg-cyan-400 hover:bg-cyan-300 rounded-md shadow-md transition-all flex items-center gap-1.5 cursor-pointer hover:shadow-cyan-500/25 whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Launch Composer</span>
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-400 hover:text-white rounded-md hover:bg-white/5"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-[#090b10] px-4 py-3 space-y-1">
          <div className="grid grid-cols-2 gap-1 pb-2">
            {[...mainLinks, ...moreLinks].map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  setActiveTab(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs font-medium rounded-md flex items-center gap-2 ${
                  activeTab === link.id
                    ? 'text-cyan-300 bg-cyan-950/50 border border-cyan-800/40'
                    : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <link.icon className="w-3.5 h-3.5 text-cyan-400" />
                <span className="truncate">{link.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
