import React, { useState } from 'react';
import { 
  Sparkles, 
  Play, 
  Pause, 
  Layers, 
  Sliders, 
  Cpu, 
  Music, 
  SlidersHorizontal, 
  Download, 
  Wand2, 
  RotateCcw,
  Zap,
  Volume2
} from 'lucide-react';
import { AIModelType, Composition, Genre, Mood } from '../types';
import { GenerationParams } from '../services/aiComposer';
import { downloadMidiFile } from '../services/midiWriter';
import { NeuralDnaCard } from '../components/NeuralDnaCard';
import { ActiveTab } from '../components/Navbar';

interface StudioViewProps {
  currentComposition: Composition;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onTriggerGenerate: (params: GenerationParams) => void;
  onNavigate: (tab: ActiveTab) => void;
}

const GENRES: Genre[] = [
  'Electronic',
  'Classical',
  'Cinematic',
  'Lo-fi',
  'Jazz',
  'Ambient',
  'Rock',
  'Indian Classical',
  'Experimental',
];

const MOODS: Mood[] = [
  'Dark',
  'Epic',
  'Calm',
  'Melancholic',
  'Dreamy',
  'Energetic',
  'Happy',
];

const KEYS = [
  'C Minor',
  'C# Minor',
  'D Minor',
  'Eb Major',
  'E Minor',
  'F Minor',
  'G Minor',
  'A Minor',
  'Bb Dorian',
  'C Bhairav',
];

const MODELS: AIModelType[] = [
  'Transformer Composer',
  'LSTM Composer',
  'GRU Composer',
  'GAN Music Generator',
];

export const StudioView: React.FC<StudioViewProps> = ({
  currentComposition,
  isPlaying,
  onTogglePlay,
  onTriggerGenerate,
  onNavigate,
}) => {
  const [selectedGenre, setSelectedGenre] = useState<Genre>(currentComposition.genre || 'Electronic');
  const [selectedMood, setSelectedMood] = useState<Mood>(currentComposition.mood || 'Dark');
  const [selectedKey, setSelectedKey] = useState<string>(currentComposition.key || 'F Minor');
  const [selectedModel, setSelectedModel] = useState<AIModelType>(currentComposition.model || 'Transformer Composer');
  const [bpm, setBpm] = useState<number>(currentComposition.bpm || 128);
  const [bars, setBars] = useState<number>(16);
  const [complexity, setComplexity] = useState<number>(75);
  const [creativity, setCreativity] = useState<number>(85);
  const [temperature, setTemperature] = useState<number>(0.9);
  const [humanization, setHumanization] = useState<number>(45);
  const [variation, setVariation] = useState<number>(35);

  const handleGenerate = () => {
    onTriggerGenerate({
      genre: selectedGenre,
      mood: selectedMood,
      key: selectedKey,
      model: selectedModel,
      bpm,
      timeSignature: '4/4',
      bars,
      complexity,
      creativity,
      temperature,
      humanization,
      variation,
    });
  };

  const applyPreset = (presetName: string) => {
    if (presetName === 'cyberpunk') {
      setSelectedGenre('Electronic');
      setSelectedMood('Dark');
      setSelectedKey('F Minor');
      setSelectedModel('Transformer Composer');
      setBpm(130);
      setComplexity(85);
      setTemperature(1.0);
    } else if (presetName === 'chopin') {
      setSelectedGenre('Classical');
      setSelectedMood('Melancholic');
      setSelectedKey('C# Minor');
      setSelectedModel('LSTM Composer');
      setBpm(76);
      setComplexity(70);
      setTemperature(0.7);
    } else if (presetName === 'lofi') {
      setSelectedGenre('Lo-fi');
      setSelectedMood('Calm');
      setSelectedKey('Eb Major');
      setSelectedModel('GRU Composer');
      setBpm(80);
      setComplexity(45);
      setTemperature(0.8);
    } else if (presetName === 'cinematic') {
      setSelectedGenre('Cinematic');
      setSelectedMood('Epic');
      setSelectedKey('D Minor');
      setSelectedModel('Transformer Composer');
      setBpm(92);
      setComplexity(90);
      setTemperature(0.9);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 pb-16">
      
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-400">
              Model Online · Deep Learning Inferencing Engine
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-display text-white uppercase tracking-tight">
            AI Composer Studio
          </h1>
        </div>

        {/* Quick Style Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          <span className="text-[11px] font-mono text-slate-500 uppercase mr-1">Presets:</span>
          <button
            onClick={() => applyPreset('cyberpunk')}
            className="px-2.5 py-1 text-xs font-medium rounded-md bg-white/5 hover:bg-white/10 text-cyan-300 border border-cyan-800/40 transition-colors whitespace-nowrap"
          >
            Cyberpunk
          </button>
          <button
            onClick={() => applyPreset('chopin')}
            className="px-2.5 py-1 text-xs font-medium rounded-md bg-white/5 hover:bg-white/10 text-violet-300 border border-violet-800/40 transition-colors whitespace-nowrap"
          >
            Chopin
          </button>
          <button
            onClick={() => applyPreset('lofi')}
            className="px-2.5 py-1 text-xs font-medium rounded-md bg-white/5 hover:bg-white/10 text-pink-300 border border-pink-800/40 transition-colors whitespace-nowrap"
          >
            Lo-Fi Chill
          </button>
          <button
            onClick={() => applyPreset('cinematic')}
            className="px-2.5 py-1 text-xs font-medium rounded-md bg-white/5 hover:bg-white/10 text-amber-300 border border-amber-800/40 transition-colors whitespace-nowrap"
          >
            Cinematic
          </button>
        </div>
      </div>

      {/* Main Grid: Parameters on Left, Output & DNA on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Generation Controls */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Genre Selection Chips */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
              Musical Genre
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {GENRES.map((g) => {
                const isSelected = selectedGenre === g;
                return (
                  <button
                    key={g}
                    onClick={() => setSelectedGenre(g)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all text-center ${
                      isSelected
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                        : 'bg-white/[0.03] text-slate-400 hover:text-white border border-white/5 hover:border-white/10'
                    }`}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mood Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
              Emotional Mood
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
              {MOODS.map((m) => {
                const isSelected = selectedMood === m;
                return (
                  <button
                    key={m}
                    onClick={() => setSelectedMood(m)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all text-center ${
                      isSelected
                        ? 'bg-violet-500/20 text-violet-300 border border-violet-500/50 shadow-sm'
                        : 'bg-white/[0.03] text-slate-400 hover:text-white border border-white/5 hover:border-white/10'
                    }`}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Neural Model & Scale Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* AI Model */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                Neural Model
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value as AIModelType)}
                className="w-full bg-[#0d1017] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                {MODELS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Key & Scale */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                Key / Tonic
              </label>
              <select
                value={selectedKey}
                onChange={(e) => setSelectedKey(e.target.value)}
                className="w-full bg-[#0d1017] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                {KEYS.map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>

            {/* Sequence Length (Bars) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                Sequence Length
              </label>
              <select
                value={bars}
                onChange={(e) => setBars(parseInt(e.target.value))}
                className="w-full bg-[#0d1017] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value={8}>8 Bars (Phrase)</option>
                <option value={16}>16 Bars (Standard)</option>
                <option value={32}>32 Bars (Full Section)</option>
                <option value={64}>64 Bars (Extended Theme)</option>
              </select>
            </div>

          </div>

          {/* Sliders: BPM, Complexity, Creativity, Temperature, Humanization */}
          <div className="p-5 rounded-xl border border-white/10 bg-[#090b11] space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Tempo / BPM */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Tempo / BPM</span>
                  <span className="font-mono text-cyan-400 font-semibold tabular-nums">{bpm} BPM</span>
                </div>
                <input
                  type="range"
                  min={60}
                  max={180}
                  value={bpm}
                  onChange={(e) => setBpm(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer"
                />
              </div>

              {/* Temperature / Softmax Entropy */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Temperature (Entropy)</span>
                  <span className="font-mono text-cyan-400 font-semibold tabular-nums">{temperature.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={2.0}
                  step={0.05}
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer"
                />
              </div>

              {/* Complexity */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Harmonic Complexity</span>
                  <span className="font-mono text-violet-400 font-semibold tabular-nums">{complexity}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={complexity}
                  onChange={(e) => setComplexity(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer"
                />
              </div>

              {/* Humanization */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Humanization / Groove Jitter</span>
                  <span className="font-mono text-pink-400 font-semibold tabular-nums">{humanization}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={humanization}
                  onChange={(e) => setHumanization(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer"
                />
              </div>

            </div>
          </div>

          {/* Large Futuristic Generate Button */}
          <button
            onClick={handleGenerate}
            className="w-full py-4 px-6 rounded-xl font-display font-black text-sm tracking-wider uppercase text-black bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-400 hover:opacity-95 shadow-[0_0_35px_rgba(6,182,212,0.35)] transition-all flex items-center justify-center gap-3 cursor-pointer active:scale-[0.99]"
          >
            <Sparkles className="w-5 h-5 fill-current" />
            <span>Generate Composition ({selectedModel.split(' ')[0]})</span>
            <Zap className="w-5 h-5" />
          </button>

        </div>

        {/* Right 1 Col: Current Master Monitor & DNA */}
        <div className="space-y-6">
          
          {/* Master Monitor Card */}
          <div className="rounded-xl border border-white/10 bg-[#090b11] p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5" />
                Active Track
              </span>
              <button
                onClick={onTogglePlay}
                className="p-1.5 rounded-full bg-cyan-400 text-black hover:bg-cyan-300 transition-colors"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">
                {currentComposition.title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                <span>{currentComposition.genre}</span>
                <span>·</span>
                <span>{currentComposition.key}</span>
                <span>·</span>
                <span>{currentComposition.bpm} BPM</span>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 space-y-0.5">
                <span className="text-[10px] text-slate-500 uppercase">Notes</span>
                <div className="text-sm font-semibold text-white tabular-nums">{currentComposition.notes.length}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 space-y-0.5">
                <span className="text-[10px] text-slate-500 uppercase">Duration</span>
                <div className="text-sm font-semibold text-cyan-400 tabular-nums">{currentComposition.duration}s</div>
              </div>
            </div>

            {/* DAW Navigation Actions */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => onNavigate('pianoroll')}
                className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors flex items-center justify-center gap-2"
              >
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Edit in Piano Roll DAW</span>
              </button>

              <button
                onClick={() => onNavigate('audiolab')}
                className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors flex items-center justify-center gap-2"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-violet-400" />
                <span>Audio Mixer & FX Rack</span>
              </button>

              <button
                onClick={() => onNavigate('variations')}
                className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                <span>Generate 4 Variations</span>
              </button>

              <button
                onClick={() => downloadMidiFile(currentComposition)}
                className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-white/5 hover:bg-white/10 text-emerald-400 border border-white/10 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Standard MIDI</span>
              </button>
            </div>
          </div>

          {/* Generative DNA Card */}
          <NeuralDnaCard
            dna={currentComposition.dna}
            title={currentComposition.title}
            genre={currentComposition.genre}
          />

        </div>

      </div>

    </div>
  );
};
