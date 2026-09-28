import React, { useState } from 'react';
import { 
  Sliders, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Download, 
  Sparkles, 
  FileAudio, 
  Activity, 
  RefreshCw,
  Layers
} from 'lucide-react';
import { Composition } from '../types';
import { globalAudioEngine } from '../services/audioEngine';

interface AudioLabViewProps {
  composition: Composition;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

export const AudioLabView: React.FC<AudioLabViewProps> = ({
  composition,
  isPlaying,
  onTogglePlay,
}) => {
  const [leadVol, setLeadVol] = useState<number>(0.9);
  const [chordsVol, setChordsVol] = useState<number>(0.75);
  const [bassVol, setBassVol] = useState<number>(0.85);
  const [drumsVol, setDrumsVol] = useState<number>(0.8);

  const [reverbMix, setReverbMix] = useState<number>(0.28);
  const [delayMix, setDelayMix] = useState<number>(0.22);
  const [eqLow, setEqLow] = useState<number>(2.0);
  const [eqMid, setEqMid] = useState<number>(0.0);
  const [eqHigh, setEqHigh] = useState<number>(1.5);

  const [leadMuted, setLeadMuted] = useState<boolean>(false);
  const [chordsMuted, setChordsMuted] = useState<boolean>(false);
  const [bassMuted, setBassMuted] = useState<boolean>(false);
  const [drumsMuted, setDrumsMuted] = useState<boolean>(false);

  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [renderProgress, setRenderProgress] = useState<number>(0);

  const handleTrackVol = (trackIdx: number, val: number) => {
    if (trackIdx === 0) setLeadVol(val);
    if (trackIdx === 1) setChordsVol(val);
    if (trackIdx === 2) setBassVol(val);
    if (trackIdx === 3) setDrumsVol(val);
    globalAudioEngine.setTrackVolume(trackIdx, val);
  };

  const handleReverb = (val: number) => {
    setReverbMix(val);
    globalAudioEngine.setReverbMix(val);
  };

  const handleDelay = (val: number) => {
    setDelayMix(val);
    globalAudioEngine.setDelayMix(val);
  };

  const handleRenderAudio = async () => {
    setIsRendering(true);
    setRenderProgress(0);

    const interval = setInterval(() => {
      setRenderProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsRendering(false);
            globalAudioEngine.exportWavAudio(composition);
          }, 300);
          return 100;
        }
        return prev + 25;
      });
    }, 250);
  };

  const tracks = [
    {
      id: 0,
      name: 'Track 1: Lead Melody',
      instrument: 'Analog Polysynth / Grand Piano',
      vol: leadVol,
      muted: leadMuted,
      setMuted: setLeadMuted,
      color: 'border-cyan-400 text-cyan-400',
    },
    {
      id: 1,
      name: 'Track 2: Polyphonic Chords',
      instrument: 'Warm Lush Strings / Ambient Pad',
      vol: chordsVol,
      muted: chordsMuted,
      setMuted: setChordsMuted,
      color: 'border-violet-400 text-violet-400',
    },
    {
      id: 2,
      name: 'Track 3: Bassline',
      instrument: 'Moog Sub Bass / Saturated Saw',
      vol: bassVol,
      muted: bassMuted,
      setMuted: setBassMuted,
      color: 'border-blue-400 text-blue-400',
    },
    {
      id: 3,
      name: 'Track 4: Rhythm & Percussion',
      instrument: '808 Kick, Snare & Metallic Hats',
      vol: drumsVol,
      muted: drumsMuted,
      setMuted: setDrumsMuted,
      color: 'border-pink-400 text-pink-400',
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-violet-400" />
            <span className="text-xs font-mono uppercase tracking-wider text-violet-400">
              Web Audio Synthesizer & Master FX Rack
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-display text-white uppercase tracking-tight">
            Audio Lab & Mixer
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePlay}
            className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-black font-semibold text-xs rounded-lg shadow-sm flex items-center gap-2 transition-all cursor-pointer"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            <span>{isPlaying ? 'Pause Audition' : 'Play Mixer'}</span>
          </button>

          <button
            onClick={handleRenderAudio}
            disabled={isRendering}
            className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-black font-semibold text-xs rounded-lg shadow-sm flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {isRendering ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileAudio className="w-4 h-4" />}
            <span>Export 16-Bit WAV</span>
          </button>
        </div>
      </div>

      {/* Render progress banner if active */}
      {isRendering && (
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-emerald-300">Rendering OfflineAudioContext Buffer (44.1 kHz)...</span>
            <span className="text-emerald-400 font-bold">{renderProgress}%</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full transition-all duration-300"
              style={{ width: `${renderProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Multi-Track Channel Mixer Console */}
      <div className="p-6 rounded-xl border border-white/10 bg-[#090b11] space-y-6">
        <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          4-Channel Stems Mixer & Instrument Timbre
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tracks.map((t) => (
            <div
              key={t.id}
              className="p-4 rounded-xl border border-white/10 bg-[#0d1017] space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border bg-black/40 ${t.color}`}>
                    CH 0{t.id + 1}
                  </span>
                  <button
                    onClick={() => {
                      const next = !t.muted;
                      t.setMuted(next);
                      handleTrackVol(t.id, next ? 0 : t.vol);
                    }}
                    className={`p-1 rounded text-xs transition-colors ${
                      t.muted ? 'bg-rose-500/20 text-rose-400' : 'text-slate-400 hover:text-white'
                    }`}
                    title={t.muted ? 'Unmute' : 'Mute'}
                  >
                    {t.muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <h4 className="text-sm font-bold text-white truncate">
                  {t.name.split(':')[1]}
                </h4>
                <p className="text-[11px] text-slate-400 truncate">
                  {t.instrument}
                </p>
              </div>

              {/* Vertical Fader Simulation */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-slate-500">Gain</span>
                  <span className="text-cyan-400 tabular-nums">
                    {t.muted ? 'Muted' : `${Math.round(t.vol * 100)}%`}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1.2}
                  step={0.01}
                  value={t.muted ? 0 : t.vol}
                  onChange={(e) => handleTrackVol(t.id, parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer"
                />
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* Master FX Rack & EQ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 3-Band Parametric EQ */}
        <div className="p-5 rounded-xl border border-white/10 bg-[#090b11] space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            3-Band Master Equalizer (Biquad Filter)
          </h3>

          <div className="space-y-4 pt-2">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Low Shelf (250 Hz)</span>
                <span className="text-cyan-400 tabular-nums">{eqLow > 0 ? `+${eqLow}` : eqLow} dB</span>
              </div>
              <input
                type="range"
                min={-12}
                max={12}
                step={0.5}
                value={eqLow}
                onChange={(e) => setEqLow(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Mid Peaking (1.2 kHz)</span>
                <span className="text-violet-400 tabular-nums">{eqMid > 0 ? `+${eqMid}` : eqMid} dB</span>
              </div>
              <input
                type="range"
                min={-12}
                max={12}
                step={0.5}
                value={eqMid}
                onChange={(e) => setEqMid(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">High Shelf (4.5 kHz)</span>
                <span className="text-pink-400 tabular-nums">{eqHigh > 0 ? `+${eqHigh}` : eqHigh} dB</span>
              </div>
              <input
                type="range"
                min={-12}
                max={12}
                step={0.5}
                value={eqHigh}
                onChange={(e) => setEqHigh(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Spatial Reverb & Delay FX */}
        <div className="p-5 rounded-xl border border-white/10 bg-[#090b11] space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-400" />
            Time-Domain Effects (Reverb & Stereo Delay)
          </h3>

          <div className="space-y-4 pt-2">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Algorithmic Reverb Wet Mix</span>
                <span className="text-violet-400 tabular-nums">{Math.round(reverbMix * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={0.8}
                step={0.02}
                value={reverbMix}
                onChange={(e) => handleReverb(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Stereo Echo Delay Feedback Mix</span>
                <span className="text-cyan-400 tabular-nums">{Math.round(delayMix * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={0.8}
                step={0.02}
                value={delayMix}
                onChange={(e) => handleDelay(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer"
              />
            </div>

            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 text-[11px] font-mono text-slate-400 space-y-1">
              <div className="text-white font-semibold">Master Dynamics:</div>
              <div>Compressor: -18 dB Threshold · 4:1 Ratio · 5ms Attack</div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
