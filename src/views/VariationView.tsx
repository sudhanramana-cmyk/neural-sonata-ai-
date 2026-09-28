import React, { useState } from 'react';
import { 
  GitFork, 
  Sparkles, 
  Play, 
  Pause, 
  Sliders, 
  ArrowRight, 
  Check, 
  Dna,
  Zap
} from 'lucide-react';
import { Composition } from '../types';
import { generateVariations } from '../services/aiComposer';
import { globalAudioEngine } from '../services/audioEngine';
import { NeuralDnaCard } from '../components/NeuralDnaCard';

interface VariationViewProps {
  baseComposition: Composition;
  onSelectMaster: (comp: Composition) => void;
}

export const VariationView: React.FC<VariationViewProps> = ({
  baseComposition,
  onSelectMaster,
}) => {
  const [similarity, setSimilarity] = useState<number>(75);
  const [creativity, setCreativity] = useState<number>(80);
  const [energy, setEnergy] = useState<number>(70);
  const [complexity, setComplexity] = useState<number>(65);

  const [variations, setVariations] = useState<Composition[]>(() =>
    generateVariations(baseComposition, similarity)
  );

  const [playingVarId, setPlayingVarId] = useState<string | null>(null);

  const handleRegenerate = () => {
    const fresh = generateVariations(baseComposition, similarity);
    setVariations(fresh);
  };

  const handlePlayVar = (v: Composition) => {
    if (playingVarId === v.id) {
      globalAudioEngine.stopPlayback();
      setPlayingVarId(null);
    } else {
      setPlayingVarId(v.id);
      globalAudioEngine.playComposition(v, 0);
      globalAudioEngine.setOnPlaybackEnded(() => {
        setPlayingVarId(null);
      });
    }
  };

  const handlePromote = (v: Composition) => {
    onSelectMaster(v);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-pink-400" />
            <span className="text-xs font-mono uppercase tracking-wider text-pink-400">
              Evolutionary Latent Space Exploration · "More Like This"
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-display text-white uppercase tracking-tight">
            AI Variation Engine
          </h1>
        </div>

        {/* Generate Variations Button */}
        <button
          onClick={handleRegenerate}
          className="px-4 py-2 bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-400 hover:to-violet-500 text-white font-semibold text-xs rounded-lg shadow-md flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap"
        >
          <Sparkles className="w-4 h-4" />
          <span>Mutate 4 Variations</span>
        </button>
      </div>

      {/* Base Track Info Banner */}
      <div className="p-4 rounded-xl border border-white/10 bg-[#090b11] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div>
          <span className="text-[10px] font-mono uppercase text-slate-500 block">Root Composition Anchor</span>
          <h3 className="text-sm font-bold text-white">{baseComposition.title}</h3>
        </div>
        <div className="flex items-center gap-3 font-mono text-slate-400">
          <span>{baseComposition.genre}</span>
          <span>·</span>
          <span>{baseComposition.key}</span>
          <span>·</span>
          <span className="tabular-nums">{baseComposition.bpm} BPM</span>
        </div>
      </div>

      {/* Latent Sliders */}
      <div className="p-5 rounded-xl border border-white/10 bg-[#090b11] space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold flex items-center gap-2">
          <Sliders className="w-4 h-4 text-pink-400" />
          Latent Space Perturbation Vector
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Acoustic Similarity</span>
              <span className="text-pink-400 tabular-nums">{similarity}%</span>
            </div>
            <input
              type="range"
              min={20}
              max={95}
              value={similarity}
              onChange={(e) => setSimilarity(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Harmonic Mutation</span>
              <span className="text-violet-400 tabular-nums">{creativity}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              value={creativity}
              onChange={(e) => setCreativity(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Rhythmic Energy</span>
              <span className="text-cyan-400 tabular-nums">{energy}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              value={energy}
              onChange={(e) => setEnergy(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Voice Leading Complexity</span>
              <span className="text-emerald-400 tabular-nums">{complexity}%</span>
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
        </div>
      </div>

      {/* 4 Generated Variations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {variations.map((v, idx) => {
          const isPlaying = playingVarId === v.id;
          const letter = ['A', 'B', 'C', 'D'][idx];

          return (
            <div
              key={v.id}
              className="p-5 rounded-xl border border-white/10 bg-[#090b11] hover:border-pink-500/40 transition-all space-y-4 shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-gradient-to-tr from-pink-500 to-violet-600 text-white font-bold font-mono text-xs flex items-center justify-center">
                      {letter}
                    </span>
                    <h3 className="text-sm font-bold text-white">
                      {v.title}
                    </h3>
                  </div>

                  <span className="text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded bg-white/5">
                    {v.tags.find(t => t.startsWith('Var')) || 'Variation'}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono text-slate-400 pt-3">
                  <span>{v.genre}</span>
                  <span>·</span>
                  <span>{v.key}</span>
                  <span>·</span>
                  <span className="tabular-nums">{v.bpm} BPM</span>
                  <span>·</span>
                  <span className="tabular-nums">{v.notes.length} Notes</span>
                </div>
              </div>

              {/* Generative DNA Mini Visual */}
              <div className="w-full max-w-[200px] mx-auto py-1">
                <NeuralDnaCard
                  dna={v.dna}
                  title={`Variation ${letter}`}
                  genre={v.genre}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                <button
                  onClick={() => handlePlayVar(v)}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isPlaying
                      ? 'bg-pink-500 text-white shadow-md shadow-pink-500/25'
                      : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                  }`}
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                  <span>{isPlaying ? 'Pause Audition' : `Play Var ${letter}`}</span>
                </button>

                <button
                  onClick={() => handlePromote(v)}
                  className="py-2 px-3 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Make this your main active composition"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Promote to Master</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
