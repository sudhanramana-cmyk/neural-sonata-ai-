import React from 'react';
import { 
  BarChart3, 
  Dna, 
  Music, 
  Layers, 
  Activity, 
  Sparkles, 
  FileText,
  PieChart,
  Sliders
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  AreaChart, 
  Area, 
  CartesianGrid 
} from 'recharts';
import { Composition } from '../types';
import { NeuralDnaCard } from '../components/NeuralDnaCard';

interface AnalysisViewProps {
  composition: Composition;
}

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const AnalysisView: React.FC<AnalysisViewProps> = ({ composition }) => {
  // 1. Calculate Pitch Histogram
  const pitchCounts: Record<string, number> = {};
  NOTE_NAMES.forEach(n => { pitchCounts[n] = 0; });

  composition.notes.forEach(note => {
    const noteName = NOTE_NAMES[note.pitch % 12];
    pitchCounts[noteName] = (pitchCounts[noteName] || 0) + 1;
  });

  const histogramData = NOTE_NAMES.map(name => ({
    pitch: name,
    count: pitchCounts[name],
  }));

  // 2. Calculate Note Density per bar
  const barsCount = composition.bars || 16;
  const barDensity = Array.from({ length: barsCount }, (_, idx) => {
    const startBeat = idx * 4;
    const endBeat = startBeat + 4;
    const notesInBar = composition.notes.filter(n => n.startTime >= startBeat && n.startTime < endBeat).length;
    return {
      bar: `Bar ${idx + 1}`,
      notes: notesInBar,
    };
  });

  // Track distribution
  const leadCount = composition.notes.filter(n => n.track === 0).length;
  const chordCount = composition.notes.filter(n => n.track === 1).length;
  const bassCount = composition.notes.filter(n => n.track === 2).length;
  const drumCount = composition.notes.filter(n => n.track === 3).length;

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-violet-400" />
            <span className="text-xs font-mono uppercase tracking-wider text-violet-400">
              Musicological Analysis & Generative Topology
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-display text-white uppercase tracking-tight">
            Music Analysis & Neural DNA
          </h1>
        </div>

        <div className="text-xs font-mono text-slate-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
          Analyzing: <strong className="text-white">{composition.title}</strong>
        </div>
      </div>

      {/* Primary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-xl border border-white/10 bg-[#090b11]">
          <span className="text-[10px] font-mono text-slate-500 uppercase block">Total Notes</span>
          <div className="text-lg font-bold font-mono text-white tabular-nums">{composition.notes.length}</div>
        </div>
        <div className="p-3.5 rounded-xl border border-white/10 bg-[#090b11]">
          <span className="text-[10px] font-mono text-slate-500 uppercase block">Scale / Key</span>
          <div className="text-lg font-bold font-mono text-cyan-400 truncate">{composition.key}</div>
        </div>
        <div className="p-3.5 rounded-xl border border-white/10 bg-[#090b11]">
          <span className="text-[10px] font-mono text-slate-500 uppercase block">Tempo / Meter</span>
          <div className="text-lg font-bold font-mono text-white tabular-nums">{composition.bpm} BPM (4/4)</div>
        </div>
        <div className="p-3.5 rounded-xl border border-white/10 bg-[#090b11]">
          <span className="text-[10px] font-mono text-slate-500 uppercase block">Harmonic Depth</span>
          <div className="text-lg font-bold font-mono text-violet-400 tabular-nums">{composition.dna.harmonicComplexity}%</div>
        </div>
        <div className="p-3.5 rounded-xl border border-white/10 bg-[#090b11]">
          <span className="text-[10px] font-mono text-slate-500 uppercase block">Syncopation</span>
          <div className="text-lg font-bold font-mono text-pink-400 tabular-nums">{composition.dna.rhythmicSyncopation}%</div>
        </div>
        <div className="p-3.5 rounded-xl border border-white/10 bg-[#090b11]">
          <span className="text-[10px] font-mono text-slate-500 uppercase block">Melodic Entropy</span>
          <div className="text-lg font-bold font-mono text-emerald-400 tabular-nums">{composition.dna.melodicEntropy}%</div>
        </div>
      </div>

      {/* Main Charts: Pitch Histogram & Note Density */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Pitch Histogram */}
        <div className="p-5 rounded-xl border border-white/10 bg-[#090b11] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              Pitch Class Distribution (12 Semitones)
            </h3>
            <span className="text-[11px] font-mono text-slate-500">Tonal Profile</span>
          </div>

          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={histogramData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                <XAxis dataKey="pitch" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0d1017', borderColor: 'rgba(255,255,255,0.1)', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#06b6d4" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Note Density Over Time */}
        <div className="p-5 rounded-xl border border-white/10 bg-[#090b11] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold flex items-center gap-2">
              <Activity className="w-4 h-4 text-violet-400" />
              Temporal Note Density (Events per Bar)
            </h3>
            <span className="text-[11px] font-mono text-slate-500">{composition.bars} Bars</span>
          </div>

          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={barDensity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="densityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                <XAxis dataKey="bar" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0d1017', borderColor: 'rgba(255,255,255,0.1)', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="notes" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#densityGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Lower Row: Neural DNA Card & AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* DNA Polygon Card */}
        <div className="lg:col-span-1">
          <NeuralDnaCard
            dna={composition.dna}
            title={composition.title}
            genre={composition.genre}
          />
        </div>

        {/* AI Composition Insights Written Report */}
        <div className="lg:col-span-2 p-6 rounded-xl border border-white/10 bg-[#090b11] space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-white/10">
            <FileText className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              AI Composition Insights Report
            </h3>
          </div>

          <div className="space-y-3 text-xs text-slate-300 leading-relaxed font-sans">
            <p>
              This composition exhibits strong tonal centricity around the root <strong className="text-cyan-400">{composition.key}</strong> with polyphonic voice leading spanning {composition.bars} musical measures. The sequence was synthesized with a temperature of 0.9 via the <strong className="text-violet-400">{composition.model}</strong>.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                <span className="text-[10px] font-mono text-cyan-400 block">Lead Line</span>
                <span className="text-sm font-bold text-white tabular-nums">{leadCount} notes</span>
              </div>
              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                <span className="text-[10px] font-mono text-violet-400 block">Harmony / Pad</span>
                <span className="text-sm font-bold text-white tabular-nums">{chordCount} notes</span>
              </div>
              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                <span className="text-[10px] font-mono text-blue-400 block">Sub Bass</span>
                <span className="text-sm font-bold text-white tabular-nums">{bassCount} notes</span>
              </div>
              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                <span className="text-[10px] font-mono text-pink-400 block">Drums / Hats</span>
                <span className="text-sm font-bold text-white tabular-nums">{drumCount} notes</span>
              </div>
            </div>

            <p className="pt-2">
              <strong>Harmonic Cadence:</strong> Root progression alternates between tonic, subdominant, and relative minor degrees. The voice leading adheres to classical counterpoint principles while maintaining modern electronic micro-timing jitter ({composition.dna.rhythmicSyncopation}% syncopation index).
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
