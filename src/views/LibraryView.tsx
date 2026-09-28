import React, { useState } from 'react';
import { 
  Disc, 
  Play, 
  Pause, 
  Download, 
  Layers, 
  Sparkles, 
  BarChart3, 
  FileAudio, 
  Search, 
  Filter, 
  SlidersHorizontal,
  Clock,
  Music,
  Trash2
} from 'lucide-react';
import { Composition, Genre } from '../types';
import { downloadMidiFile } from '../services/midiWriter';
import { globalAudioEngine } from '../services/audioEngine';
import { ActiveTab } from '../components/Navbar';

interface LibraryViewProps {
  compositions: Composition[];
  activeCompositionId: string | null;
  isPlaying: boolean;
  onSelectComposition: (comp: Composition) => void;
  onTogglePlay: () => void;
  onNavigate: (tab: ActiveTab) => void;
  onDeleteComposition?: (id: string) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  compositions,
  activeCompositionId,
  isPlaying,
  onSelectComposition,
  onTogglePlay,
  onNavigate,
  onDeleteComposition,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [genreFilter, setGenreFilter] = useState<string>('All');
  const [modelFilter, setModelFilter] = useState<string>('All');

  const filtered = compositions.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.key.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = genreFilter === 'All' || c.genre === genreFilter;
    const matchesModel = modelFilter === 'All' || c.model.includes(modelFilter);
    return matchesSearch && matchesGenre && matchesModel;
  });

  const handleExportWav = async (comp: Composition) => {
    await globalAudioEngine.exportWavAudio(comp);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400">
              Vault & Audio Archive · {compositions.length} Master Compositions
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-display text-white uppercase tracking-tight">
            Generated Music Library
          </h1>
        </div>

        {/* Quick Launch Composer */}
        <button
          onClick={() => onNavigate('studio')}
          className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-black font-semibold text-xs rounded-lg shadow-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap"
        >
          <Sparkles className="w-4 h-4" />
          <span>New AI Composition</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tracks, keys, models..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0d1017] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto py-1">
          {/* Genre select */}
          <select
            value={genreFilter}
            onChange={(e) => setGenreFilter(e.target.value)}
            className="bg-[#0d1017] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
          >
            <option value="All">All Genres</option>
            <option value="Electronic">Electronic</option>
            <option value="Classical">Classical</option>
            <option value="Lo-fi">Lo-fi</option>
            <option value="Cinematic">Cinematic</option>
            <option value="Jazz">Jazz</option>
            <option value="Indian Classical">Indian Classical</option>
          </select>

          {/* Model select */}
          <select
            value={modelFilter}
            onChange={(e) => setModelFilter(e.target.value)}
            className="bg-[#0d1017] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
          >
            <option value="All">All Models</option>
            <option value="Transformer">Transformer</option>
            <option value="LSTM">LSTM</option>
            <option value="GRU">GRU</option>
            <option value="GAN">GAN</option>
          </select>
        </div>
      </div>

      {/* Tracks Grid */}
      <div className="space-y-3">
        {filtered.map((track) => {
          const isSelected = activeCompositionId === track.id;
          const isTrackPlaying = isSelected && isPlaying;

          return (
            <div
              key={track.id}
              className={`p-4 sm:p-5 rounded-xl border transition-all ${
                isSelected
                  ? 'border-cyan-500/50 bg-[#0c111c] shadow-lg shadow-cyan-500/10'
                  : 'border-white/10 bg-[#090b11] hover:border-white/20'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                {/* Track Primary Info */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <button
                    onClick={() => {
                      if (isSelected) {
                        onTogglePlay();
                      } else {
                        onSelectComposition(track);
                        globalAudioEngine.playComposition(track, 0);
                      }
                    }}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform active:scale-95 shadow-md ${
                      isTrackPlaying
                        ? 'bg-cyan-400 text-black shadow-cyan-500/30'
                        : 'bg-white/5 hover:bg-cyan-500/20 text-slate-200 hover:text-cyan-300 border border-white/10'
                    }`}
                    title={isTrackPlaying ? 'Pause' : 'Play'}
                  >
                    {isTrackPlaying ? (
                      <Pause className="w-5 h-5 fill-current" />
                    ) : (
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    )}
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-white truncate">
                        {track.title}
                      </h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/50 text-cyan-300 border border-cyan-800/40 shrink-0">
                        {track.genre}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 font-mono mt-0.5">
                      <span>{track.key}</span>
                      <span>·</span>
                      <span className="tabular-nums">{track.bpm} BPM</span>
                      <span>·</span>
                      <span className="tabular-nums">{track.duration}s</span>
                      <span>·</span>
                      <span className="text-slate-500">{track.model.split(' ')[0]}</span>
                    </div>
                  </div>
                </div>

                {/* Track Actions */}
                <div className="flex flex-wrap items-center gap-1.5 self-end md:self-center">
                  
                  {/* Open in Piano Roll DAW */}
                  <button
                    onClick={() => {
                      onSelectComposition(track);
                      onNavigate('pianoroll');
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-medium border border-white/10 transition-colors flex items-center gap-1.5"
                    title="Open in DAW Piano Roll"
                  >
                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Piano Roll</span>
                  </button>

                  {/* Variation */}
                  <button
                    onClick={() => {
                      onSelectComposition(track);
                      onNavigate('variations');
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-medium border border-white/10 transition-colors flex items-center gap-1.5"
                    title="Generate 4 Variations"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                    <span>Variations</span>
                  </button>

                  {/* Analyze */}
                  <button
                    onClick={() => {
                      onSelectComposition(track);
                      onNavigate('analysis');
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-medium border border-white/10 transition-colors flex items-center gap-1.5"
                    title="Music Analysis & Neural DNA"
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-violet-400" />
                    <span>Analysis</span>
                  </button>

                  {/* Download MIDI */}
                  <button
                    onClick={() => downloadMidiFile(track)}
                    className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-emerald-400 text-xs font-medium border border-white/10 transition-colors flex items-center gap-1.5"
                    title="Download Standard MIDI File (.mid)"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>MIDI</span>
                  </button>

                  {/* Export WAV */}
                  <button
                    onClick={() => handleExportWav(track)}
                    className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-400 text-xs font-medium border border-white/10 transition-colors flex items-center gap-1.5"
                    title="Render WAV Audio"
                  >
                    <FileAudio className="w-3.5 h-3.5" />
                    <span>WAV</span>
                  </button>

                </div>

              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="p-12 text-center rounded-xl border border-white/10 bg-[#090b11] text-slate-400 text-xs">
            No compositions match your search or filter.
          </div>
        )}
      </div>

    </div>
  );
};
