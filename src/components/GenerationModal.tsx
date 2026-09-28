import React, { useEffect, useState } from 'react';
import { Sparkles, Cpu, CheckCircle2, Music } from 'lucide-react';
import { AIModelType, Genre, Mood } from '../types';

interface GenerationModalProps {
  isOpen: boolean;
  model: AIModelType;
  genre: Genre;
  mood: Mood;
  onComplete: () => void;
}

const STEPS = [
  'Loading model weights & tokenizer corpus...',
  'Extracting tonal vectors & harmonic Markov space...',
  'Generating melody via attention decoder...',
  'Harmonizing polyphonic voice leading & chords...',
  'Applying humanized velocity jitter & micro-timing...',
  'Encoding Standard MIDI bytes & synthesizing audio buffer...',
];

export const GenerationModal: React.FC<GenerationModalProps> = ({
  isOpen,
  model,
  genre,
  mood,
  onComplete,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [progressPercent, setProgressPercent] = useState<number>(10);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStepIndex(0);
      setProgressPercent(10);
      return;
    }

    const interval = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 400);
          return 100;
        }
        const next = prev + 18;
        const stepIdx = Math.min(STEPS.length - 1, Math.floor((next / 100) * STEPS.length));
        setCurrentStepIndex(stepIdx);
        return next;
      });
    }, 450);

    return () => clearInterval(interval);
  }, [isOpen, onComplete]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl border border-cyan-500/30 bg-[#0a0d14] p-6 sm:p-8 shadow-[0_0_50px_rgba(6,182,212,0.15)] flex flex-col items-center text-center">
        
        {/* Animated Neural Core Graphic */}
        <div className="relative w-28 h-28 mb-6 flex items-center justify-center">
          {/* Concentric rotating rings */}
          <div className="absolute inset-0 rounded-full border border-cyan-500/30 animate-spin" style={{ animationDuration: '10s' }} />
          <div className="absolute inset-2 rounded-full border border-dashed border-violet-500/40 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '7s' }} />
          <div className="absolute inset-5 rounded-full border border-pink-500/30 animate-pulse" />

          {/* Central pulsating icon */}
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-cyan-500 to-violet-600 p-[1px] shadow-lg shadow-cyan-500/30 flex items-center justify-center">
            <div className="w-full h-full bg-[#08090d] rounded-full flex items-center justify-center">
              <Cpu className="w-7 h-7 text-cyan-400 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Status titles */}
        <div className="space-y-1 mb-6">
          <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400">
            {model}
          </span>
          <h3 className="text-xl font-bold font-display text-white">
            Synthesizing {mood} {genre}
          </h3>
          <p className="text-xs text-slate-400 font-mono">
            {STEPS[currentStepIndex]}
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full mb-6">
          <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1.5">
            <span>Neural Convergence</span>
            <span className="text-cyan-400">{Math.min(100, Math.round(progressPercent))}%</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden p-[1px]">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 via-violet-500 to-pink-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Multi-stage step checklist */}
        <div className="w-full grid grid-cols-2 gap-2 text-left">
          {STEPS.slice(0, 4).map((step, idx) => {
            const isDone = currentStepIndex > idx;
            const isCurrent = currentStepIndex === idx;
            return (
              <div
                key={idx}
                className={`p-2 rounded-lg border text-[11px] flex items-center gap-2 transition-all ${
                  isDone
                    ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300'
                    : isCurrent
                    ? 'border-cyan-500/40 bg-cyan-950/30 text-cyan-200'
                    : 'border-white/5 bg-white/[0.01] text-slate-500'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <div className={`w-2 h-2 rounded-full shrink-0 ${isCurrent ? 'bg-cyan-400 animate-ping' : 'bg-slate-700'}`} />
                )}
                <span className="truncate">{step.split(' ')[0]} {step.split(' ')[1]}</span>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
