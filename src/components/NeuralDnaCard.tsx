import React from 'react';
import { Sparkles, Dna, ShieldCheck } from 'lucide-react';
import { CompositionDNA } from '../types';

interface NeuralDnaCardProps {
  dna: CompositionDNA;
  title: string;
  genre: string;
}

export const NeuralDnaCard: React.FC<NeuralDnaCardProps> = ({ dna, title, genre }) => {
  // Generate polygon SVG coordinates
  const size = 220;
  const center = size / 2;
  const maxRadius = 78;

  const points = dna.polygonPoints || [0.6, 0.7, 0.5, 0.8, 0.4, 0.7, 0.9, 0.6];
  const axisCount = points.length;
  const angleStep = (Math.PI * 2) / axisCount;

  // Calculate coordinates
  const polygonCoords = points.map((p, idx) => {
    const angle = idx * angleStep - Math.PI / 2;
    const r = p * maxRadius;
    const x = center + Math.cos(angle) * r;
    const y = center + Math.sin(angle) * r;
    return `${x},${y}`;
  }).join(' ');

  // Background concentric radar rings
  const ringRadii = [0.3, 0.6, 0.9].map(factor => factor * maxRadius);

  const traits = [
    { label: 'Harmonic Depth', value: dna.harmonicComplexity, color: 'text-violet-400' },
    { label: 'Syncopation', value: dna.rhythmicSyncopation, color: 'text-cyan-400' },
    { label: 'Melodic Entropy', value: dna.melodicEntropy, color: 'text-pink-400' },
    { label: 'Dynamic Range', value: dna.dynamicRange, color: 'text-emerald-400' },
    { label: 'Tonal Centricity', value: dna.tonalCentricity, color: 'text-blue-400' },
  ];

  return (
    <div className="rounded-xl border border-white/10 bg-[#090b11] p-5 shadow-xl flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-gradient-to-tr from-cyan-500/20 to-violet-500/20 border border-cyan-500/30 flex items-center justify-center">
            <Dna className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white truncate max-w-[170px]">
              {title}
            </h4>
            <span className="text-[10px] text-slate-400">Neural DNA Signature</span>
          </div>
        </div>

        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/40">
          {genre}
        </span>
      </div>

      {/* Sacred Generative Shape Visualization */}
      <div className="relative py-4 flex items-center justify-center">
        <svg width={size} height={size} className="overflow-visible">
          <defs>
            <linearGradient id="dnaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0.9" />
            </linearGradient>
            <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Concentric Webs */}
          {ringRadii.map((r, idx) => (
            <circle
              key={idx}
              cx={center}
              cy={center}
              r={r}
              fill="none"
              stroke="rgba(255, 255, 255, 0.06)"
              strokeDasharray={idx === 1 ? '3 3' : 'none'}
            />
          ))}

          {/* Axis Spoke Lines */}
          {points.map((_, idx) => {
            const angle = idx * angleStep - Math.PI / 2;
            const x = center + Math.cos(angle) * maxRadius;
            const y = center + Math.sin(angle) * maxRadius;
            return (
              <line
                key={idx}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth={1}
              />
            );
          })}

          {/* The Neural DNA Generative Polygon */}
          <polygon
            points={polygonCoords}
            fill="url(#dnaGrad)"
            fillOpacity={0.3}
            stroke="#06b6d4"
            strokeWidth={2}
            filter="url(#glowFilter)"
            className="transition-all duration-500 ease-out"
          />

          {/* Vertex Nodes */}
          {points.map((p, idx) => {
            const angle = idx * angleStep - Math.PI / 2;
            const r = p * maxRadius;
            const x = center + Math.cos(angle) * r;
            const y = center + Math.sin(angle) * r;
            return (
              <circle
                key={idx}
                cx={x}
                cy={y}
                r={3}
                fill="#ffffff"
                stroke="#8b5cf6"
                strokeWidth={1.5}
              />
            );
          })}
        </svg>

        {/* Center Pulsing Nucleus */}
        <div className="absolute w-3 h-3 rounded-full bg-cyan-400 blur-[1px] animate-ping opacity-40 pointer-events-none" />
      </div>

      {/* Trait breakdown indicators */}
      <div className="space-y-1.5 pt-2 border-t border-white/5">
        {traits.map((t) => (
          <div key={t.label} className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">{t.label}</span>
            <div className="flex items-center gap-2">
              <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-400 rounded-full"
                  style={{ width: `${t.value}%` }}
                />
              </div>
              <span className={`font-mono tabular-nums ${t.color} text-[10px] w-7 text-right`}>
                {t.value}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
