import React, { useEffect, useRef, useState } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  Volume2, 
  VolumeX, 
  Download, 
  Layers, 
  FileAudio, 
  Sparkles,
  RefreshCw,
  SlidersHorizontal
} from 'lucide-react';
import { Composition } from '../types';
import { globalAudioEngine } from '../services/audioEngine';
import { downloadMidiFile } from '../services/midiWriter';

interface AudioPlayerBarProps {
  composition: Composition | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onStop: () => void;
  onOpenPianoRoll: () => void;
  onOpenAudioLab: () => void;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  composition,
  isPlaying,
  onTogglePlay,
  onStop,
  onOpenPianoRoll,
  onOpenAudioLab,
}) => {
  const [currentBeat, setCurrentBeat] = useState<number>(0);
  const [currentSec, setCurrentSec] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isExportingWav, setIsExportingWav] = useState<boolean>(false);
  const miniCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const totalBeats = (composition?.bars || 16) * 4;
  const bpm = composition?.bpm || 120;
  const totalSeconds = (totalBeats * 60) / bpm;

  useEffect(() => {
    globalAudioEngine.setOnTimeUpdate((beat, sec) => {
      setCurrentBeat(beat);
      setCurrentSec(sec);
    });

    globalAudioEngine.setOnPlaybackEnded(() => {
      setCurrentBeat(0);
      setCurrentSec(0);
    });
  }, []);

  // Mini canvas spectrum animation loop
  useEffect(() => {
    let animId: number;
    const canvas = miniCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const analyser = globalAudioEngine.getAnalyser();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (analyser && isPlaying) {
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        const barCount = 20;
        const barWidth = canvas.width / barCount;

        for (let i = 0; i < barCount; i++) {
          const sampleIndex = Math.floor((i / barCount) * (bufferLength / 3));
          const val = dataArray[sampleIndex] || 0;
          const barHeight = (val / 255) * canvas.height;

          // Gradient color from cyan to violet
          const hue = 180 + (i / barCount) * 80;
          ctx.fillStyle = `hsl(${hue}, 90%, 60%)`;
          ctx.fillRect(i * barWidth, canvas.height - barHeight, barWidth - 1.5, barHeight);
        }
      } else {
        // Idle subtle baseline
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(0, canvas.height - 2, canvas.width, 2);
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isPlaying]);

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetBeat = parseFloat(e.target.value);
    setCurrentBeat(targetBeat);
    if (composition && isPlaying) {
      globalAudioEngine.playComposition(composition, targetBeat);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (isMuted) setIsMuted(false);
    globalAudioEngine.setMasterVolume(val);
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      globalAudioEngine.setMasterVolume(volume);
    } else {
      setIsMuted(true);
      globalAudioEngine.setMasterVolume(0);
    }
  };

  const handleDownloadMidi = () => {
    if (composition) {
      downloadMidiFile(composition);
    }
  };

  const handleExportWav = async () => {
    if (!composition) return;
    try {
      setIsExportingWav(true);
      await globalAudioEngine.exportWavAudio(composition);
    } finally {
      setIsExportingWav(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!composition) return null;

  return (
    <aside aria-label="Audio Playback Bar" className="fixed bottom-0 left-0 right-0 z-40 bg-[#090b11]/95 border-t border-white/10 backdrop-blur-xl px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Track Info & Visual Spectrum */}
        <div className="flex items-center gap-3 w-full md:w-1/4 min-w-0">
          <div className="relative w-10 h-10 rounded-lg bg-gradient-to-tr from-cyan-900/60 to-violet-900/60 border border-white/10 flex items-center justify-center shrink-0">
            <Sparkles className={`w-4 h-4 text-cyan-400 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-white truncate flex items-center gap-1.5">
              <span>{composition.title}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 truncate">
              <span>{composition.genre}</span>
              <span aria-hidden="true">·</span>
              <span>{composition.key}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{composition.bpm} BPM</span>
            </div>
          </div>
          {/* Mini frequency spectrum */}
          <canvas 
            ref={miniCanvasRef} 
            width={60} 
            height={20} 
            className="hidden sm:block rounded shrink-0 opacity-80" 
          />
        </div>

        {/* Central Transport & Timeline Scrubber */}
        <div className="flex flex-col items-center gap-1.5 w-full md:w-2/4">
          <div className="flex items-center gap-3">
            <button
              onClick={onStop}
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-white/5 transition-colors"
              title="Stop playback"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
            </button>
            <button
              onClick={onTogglePlay}
              className="w-9 h-9 rounded-full bg-cyan-400 hover:bg-cyan-300 text-black flex items-center justify-center shadow-lg shadow-cyan-500/20 transition-transform active:scale-95 cursor-pointer"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>
            <div className="text-[11px] font-mono tabular-nums text-slate-400 flex items-center gap-1 min-w-[70px]">
              <span>{formatTime(currentSec)}</span>
              <span>/</span>
              <span>{formatTime(totalSeconds)}</span>
            </div>
          </div>

          {/* Timeline range scrubber */}
          <div className="w-full flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-500 tabular-nums">Bar 1</span>
            <input
              type="range"
              min={0}
              max={totalBeats}
              step={0.25}
              value={currentBeat}
              onChange={handleScrub}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-[10px] font-mono text-slate-500 tabular-nums">Bar {composition.bars}</span>
          </div>
        </div>

        {/* Right Actions: Volume & DAW Shortcuts */}
        <div className="flex items-center justify-end gap-2 w-full md:w-1/4">
          {/* Volume slider */}
          <div className="hidden lg:flex items-center gap-1.5 pr-2 border-r border-white/10">
            <button onClick={toggleMute} className="text-slate-400 hover:text-white p-1">
              {isMuted || volume === 0 ? (
                <VolumeX className="w-3.5 h-3.5 text-rose-400" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-16 h-1 bg-slate-800 rounded appearance-none cursor-pointer"
              title="Master Volume"
            />
          </div>

          {/* Piano Roll shortcut */}
          <button
            onClick={onOpenPianoRoll}
            className="px-2 py-1 text-[11px] font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded border border-white/10 transition-colors flex items-center gap-1"
            title="Open in DAW Piano Roll"
          >
            <Layers className="w-3 h-3 text-cyan-400" />
            <span className="hidden sm:inline">Piano Roll</span>
          </button>

          {/* Audio Lab / Mixer */}
          <button
            onClick={onOpenAudioLab}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/5 rounded border border-white/10 transition-colors"
            title="Audio Mixer & Effects"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-violet-400" />
          </button>

          {/* Download MIDI */}
          <button
            onClick={handleDownloadMidi}
            className="px-2 py-1 text-[11px] font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded border border-white/10 transition-colors flex items-center gap-1"
            title="Download Standard MIDI File (.mid)"
          >
            <Download className="w-3 h-3 text-emerald-400" />
            <span className="hidden sm:inline">MIDI</span>
          </button>

          {/* Export WAV */}
          <button
            onClick={handleExportWav}
            disabled={isExportingWav}
            className="px-2.5 py-1 text-[11px] font-medium text-black bg-emerald-400 hover:bg-emerald-300 rounded transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
            title="Render and Download WAV Audio"
          >
            {isExportingWav ? (
              <RefreshCw className="w-3 h-3 animate-spin" />
            ) : (
              <FileAudio className="w-3 h-3" />
            )}
            <span>WAV</span>
          </button>
        </div>

      </div>
    </aside>
  );
};
