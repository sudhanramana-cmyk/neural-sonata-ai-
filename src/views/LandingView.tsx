import React from 'react';
import { 
  Sparkles, 
  Play, 
  Pause, 
  ArrowRight, 
  Cpu, 
  Database, 
  Music, 
  Layers, 
  Sliders, 
  CheckCircle2, 
  Disc,
  Activity,
  FileCode2,
  Volume2
} from 'lucide-react';
import { Composition } from '../types';
import { NeuralVisualizer } from '../components/NeuralVisualizer';
import { NeuralDnaCard } from '../components/NeuralDnaCard';
import { ActiveTab } from '../components/Navbar';

interface LandingViewProps {
  featuredComposition: Composition;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNavigate: (tab: ActiveTab) => void;
  onOpenComposer: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  featuredComposition,
  isPlaying,
  onTogglePlay,
  onNavigate,
  onOpenComposer,
}) => {
  const pipelineSteps = [
    {
      num: '01',
      title: 'MIDI Data',
      desc: 'Ingest polyphonic multi-track MIDI libraries and corpus collections.',
      tab: 'datasets' as ActiveTab,
      icon: Database,
    },
    {
      num: '02',
      title: 'Preprocessing',
      desc: 'Quantize timing, extract chords, normalize pitch & tokenise note events.',
      tab: 'datasets' as ActiveTab,
      icon: FileCode2,
    },
    {
      num: '03',
      title: 'AI Training',
      desc: 'Train LSTM, Bi-GRU, Transformer attention networks & generative GANs.',
      tab: 'training' as ActiveTab,
      icon: Cpu,
    },
    {
      num: '04',
      title: 'Music Generation',
      desc: 'Autoregressive sequence decoding with temperature & style control.',
      tab: 'studio' as ActiveTab,
      icon: Sparkles,
    },
    {
      num: '05',
      title: 'MIDI Export',
      desc: 'Standard MIDI 1.0 binary generation compatible with all DAWs.',
      tab: 'pianoroll' as ActiveTab,
      icon: Layers,
    },
    {
      num: '06',
      title: 'Audio Synthesis',
      desc: 'Real-time multi-timbral Web Audio synthesis, FX rack & 16-bit WAV.',
      tab: 'audiolab' as ActiveTab,
      icon: Volume2,
    },
  ];

  return (
    <div className="space-y-24 pb-12">
      
      {/* Hero Section */}
      <section className="relative pt-8 sm:pt-14 pb-10">
        
        {/* Ambient background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-600/10 via-violet-600/10 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto text-center space-y-6 px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-950/20 text-cyan-300 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>DEEP LEARNING MUSIC WORKSPACE · TASK 3 ARCHITECTURE</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black font-display tracking-tight text-white uppercase leading-[1.08] text-balance">
            Compose beyond human <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">imagination.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed text-balance">
            Train neural networks on musical patterns. Generate original polyphonic compositions. Shape them into something uniquely yours in an interactive DAW piano roll.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                onNavigate('studio');
                onOpenComposer();
              }}
              className="px-6 py-3 text-sm font-semibold text-black bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-lg shadow-cyan-500/25 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch AI Composer</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </button>

            <button
              onClick={onTogglePlay}
              className="px-5 py-3 text-sm font-medium text-white bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all flex items-center gap-2 cursor-pointer"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 text-cyan-400 fill-current" />
              ) : (
                <Play className="w-4 h-4 text-cyan-400 fill-current ml-0.5" />
              )}
              <span>{isPlaying ? 'Pause Audio' : 'Explore Demo Track'}</span>
            </button>
          </div>
        </div>

        {/* Hero Interactive Visualizer Canvas */}
        <div className="max-w-5xl mx-auto mt-12 px-4">
          <NeuralVisualizer
            composition={featuredComposition}
            isPlaying={isPlaying}
          />
        </div>

      </section>

      {/* Stats Counter Section */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-xl border border-white/10 bg-[#0a0d14]/70 backdrop-blur-md">
          <div className="space-y-1 border-r border-white/5 pr-4">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">MIDI Datasets Analyzed</span>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-white tabular-nums">4,820+</div>
            <p className="text-[11px] text-slate-500">Curated & tokenized</p>
          </div>
          <div className="space-y-1 sm:border-r border-white/5 sm:pr-4">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Musical Notes Processed</span>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-cyan-400 tabular-nums">1.84M</div>
            <p className="text-[11px] text-slate-500">MAESTRO & Lakh corpus</p>
          </div>
          <div className="space-y-1 border-r border-white/5 pr-4">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Compositions Synthesized</span>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-violet-400 tabular-nums">48,920</div>
            <p className="text-[11px] text-slate-500">Polyphonic 4-track files</p>
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Training Coherence</span>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-400 tabular-nums">99.4%</div>
            <p className="text-[11px] text-slate-500">Loss convergence &lt; 0.85</p>
          </div>
        </div>
      </section>

      {/* Visual Pipeline Section */}
      <section className="max-w-6xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-mono text-cyan-400 tracking-widest uppercase">
            End-To-End Deep Learning Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">
            The Neural Sonata Pipeline
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            From raw unquantized MIDI scores to multi-layer deep learning sequence models and real-time audio playback.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pipelineSteps.map((step) => (
            <div
              key={step.num}
              onClick={() => onNavigate(step.tab)}
              className="p-5 rounded-xl border border-white/10 bg-[#090b11] hover:bg-[#0e121a] hover:border-cyan-500/40 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-cyan-400 font-bold">{step.num}</span>
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
                    <step.icon className="w-4 h-4 text-slate-400 group-hover:text-cyan-300" />
                  </div>
                </div>
                <h3 className="text-base font-semibold text-white group-hover:text-cyan-300 transition-colors">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>

              <div className="pt-4 mt-2 border-t border-white/5 flex items-center gap-1 text-[11px] text-slate-500 group-hover:text-cyan-400 font-mono transition-colors">
                <span>Inspect Stage</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Demonstration & Neural DNA Showcase */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="p-6 sm:p-8 rounded-2xl border border-white/10 bg-gradient-to-b from-[#0e121c] to-[#08090d] shadow-2xl grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          
          <div className="lg:col-span-2 space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>CURRENT MASTER COMPOSITION</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold font-display text-white">
              {featuredComposition.title}
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              Generated using the <strong className="text-cyan-300">{featuredComposition.model}</strong>. Featuring {featuredComposition.notes.length} quantized polyphonic note events arranged into four distinct orchestral tracks: Lead Melody, Chords, Sub Bass, and 808 Percussion.
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 pt-1">
              <span>Genre: <strong className="text-white">{featuredComposition.genre}</strong></span>
              <span>·</span>
              <span>Key: <strong className="text-white">{featuredComposition.key}</strong></span>
              <span>·</span>
              <span>Tempo: <strong className="text-white tabular-nums">{featuredComposition.bpm} BPM</strong></span>
              <span>·</span>
              <span>Duration: <strong className="text-white tabular-nums">{featuredComposition.duration}s</strong></span>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-3">
              <button
                onClick={onTogglePlay}
                className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-black font-semibold rounded-lg text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isPlaying ? 'Pause Playback' : 'Audition Audio'}</span>
              </button>

              <button
                onClick={() => onNavigate('pianoroll')}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs border border-white/10 flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Open in Piano Roll DAW</span>
              </button>

              <button
                onClick={() => onNavigate('variations')}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs border border-white/10 flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                <span>Generate 4 Variations</span>
              </button>
            </div>
          </div>

          {/* Generative Neural DNA Card */}
          <div className="w-full max-w-sm mx-auto">
            <NeuralDnaCard
              dna={featuredComposition.dna}
              title={featuredComposition.title}
              genre={featuredComposition.genre}
            />
          </div>

        </div>
      </section>

    </div>
  );
};
