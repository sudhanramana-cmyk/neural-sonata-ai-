import React from 'react';
import { Sparkles, Music2, Cpu, Github, ExternalLink } from 'lucide-react';
import { ActiveTab } from './Navbar';

interface FooterProps {
  onNavigate: (tab: ActiveTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full border-t border-white/10 bg-[#06070a] text-slate-400 py-12 px-4 sm:px-6 lg:px-8 mt-24 mb-16 sm:mb-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
        
        {/* Brand & Mission */}
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-tr from-cyan-500 to-violet-600 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-black" />
            </div>
            <span className="font-display font-black text-base text-white tracking-wider">
              NEURAL<span className="text-cyan-400">SONATA</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
            AI Music Generation Laboratory. Deep learning sequence modeling for automated MIDI composition, dataset tokenization, polyphonic voice leading, and synthesis.
          </p>
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 pt-1">
            <span>Built with AI</span>
            <span>•</span>
            <span>MIDI</span>
            <span>•</span>
            <span>Deep Learning</span>
          </div>
        </div>

        {/* Studio & Tools */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-slate-200 tracking-wider uppercase font-mono">
            Workspaces
          </h4>
          <ul className="space-y-1.5 text-xs">
            <li>
              <button onClick={() => onNavigate('studio')} className="hover:text-cyan-400 transition-colors">
                AI Composer Studio
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('pianoroll')} className="hover:text-cyan-400 transition-colors">
                MIDI Piano Roll DAW
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('audiolab')} className="hover:text-cyan-400 transition-colors">
                Audio Lab & FX Mixer
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('variations')} className="hover:text-cyan-400 transition-colors">
                AI Variation Engine
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('cocomposer')} className="hover:text-cyan-400 transition-colors">
                AI Co-Composer Assistant
              </button>
            </li>
          </ul>
        </div>

        {/* Research & Lab */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-slate-200 tracking-wider uppercase font-mono">
            Research & Data
          </h4>
          <ul className="space-y-1.5 text-xs">
            <li>
              <button onClick={() => onNavigate('datasets')} className="hover:text-cyan-400 transition-colors">
                MIDI Dataset Lab
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('training')} className="hover:text-cyan-400 transition-colors">
                Neural Model Training
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('analysis')} className="hover:text-cyan-400 transition-colors">
                Music Theory & Neural DNA
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('architecture')} className="hover:text-cyan-400 transition-colors">
                System Architecture
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('projects')} className="hover:text-cyan-400 transition-colors">
                Project Vault
              </button>
            </li>
          </ul>
        </div>

      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <p>© 2026 Neural Sonata. Open Music Intelligence Architecture.</p>
        <div className="flex items-center gap-4">
          <button onClick={() => onNavigate('architecture')} className="hover:text-slate-300">
            PyTorch / music21 / Web Audio
          </button>
          <span>·</span>
          <span>Standard MIDI 1.0 Compliant</span>
        </div>
      </div>
    </footer>
  );
};
