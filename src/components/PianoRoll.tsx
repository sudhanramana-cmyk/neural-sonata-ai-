import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Wand2, 
  ZoomIn, 
  ZoomOut, 
  Sliders, 
  Music, 
  Sparkles,
  Trash2,
  Grid
} from 'lucide-react';
import { Composition, MidiNote } from '../types';
import { globalAudioEngine } from '../services/audioEngine';
import { applyAiAssist } from '../services/aiComposer';

interface PianoRollProps {
  composition: Composition;
  onUpdateComposition: (updated: Composition) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

const PITCH_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function getPitchName(pitch: number): string {
  const octave = Math.floor(pitch / 12) - 1;
  const noteName = PITCH_NAMES[pitch % 12];
  return `${noteName}${octave}`;
}

function isBlackKey(pitch: number): boolean {
  const note = pitch % 12;
  return [1, 3, 6, 8, 10].includes(note);
}

const TRACK_COLORS: Record<number, { border: string; bg: string; text: string }> = {
  0: { border: 'border-cyan-400', bg: 'bg-cyan-500/80', text: 'text-cyan-200' }, // Lead
  1: { border: 'border-violet-400', bg: 'bg-violet-500/80', text: 'text-violet-200' }, // Chords
  2: { border: 'border-blue-400', bg: 'bg-blue-500/80', text: 'text-blue-200' }, // Bass
  3: { border: 'border-pink-400', bg: 'bg-pink-500/80', text: 'text-pink-200' }, // Drums
};

export const PianoRoll: React.FC<PianoRollProps> = ({
  composition,
  onUpdateComposition,
  isPlaying,
  onTogglePlay,
}) => {
  // 3 octaves: C3 (48) to B5 (83) = 36 pitches
  const minPitch = 48;
  const maxPitch = 83;
  const pitches: number[] = [];
  for (let p = maxPitch; p >= minPitch; p--) {
    pitches.push(p);
  }

  const [activeTrack, setActiveTrack] = useState<number>(0); // 0=Lead, 1=Chords, 2=Bass, 3=Drums
  const [zoomX, setZoomX] = useState<number>(40); // pixels per beat
  const [snapGrid, setSnapGrid] = useState<number>(0.5); // 0.25 = 1/16th, 0.5 = 1/8th, 1.0 = 1/4th
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [currentBeat, setCurrentBeat] = useState<number>(0);
  const [velocityVal, setVelocityVal] = useState<number>(90);

  // Undo / Redo history
  const [history, setHistory] = useState<MidiNote[][]>([composition.notes]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Synchronize playback cursor
  useEffect(() => {
    globalAudioEngine.setOnTimeUpdate((beat) => {
      setCurrentBeat(beat);
    });
  }, []);

  const totalBeats = composition.bars * 4;
  const rowHeight = 22; // px per piano key

  const pushHistory = (newNotes: MidiNote[]) => {
    const updatedHistory = history.slice(0, historyIndex + 1);
    updatedHistory.push(newNotes);
    setHistory(updatedHistory);
    setHistoryIndex(updatedHistory.length - 1);
    onUpdateComposition({ ...composition, notes: newNotes });
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIdx = historyIndex - 1;
      setHistoryIndex(newIdx);
      onUpdateComposition({ ...composition, notes: history[newIdx] });
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIdx = historyIndex + 1;
      setHistoryIndex(newIdx);
      onUpdateComposition({ ...composition, notes: history[newIdx] });
    }
  };

  // Preview piano key note
  const handleKeyClick = (pitch: number) => {
    globalAudioEngine.playNotePreview(pitch, activeTrack, 0.4);
  };

  // Click on grid to add or select note
  const handleGridClick = (e: React.MouseEvent<HTMLDivElement>, pitch: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const rawBeat = clickX / zoomX;
    const snappedBeat = Math.floor(rawBeat / snapGrid) * snapGrid;

    // Check if clicked an existing note
    const existing = composition.notes.find(
      n => n.pitch === pitch && snappedBeat >= n.startTime && snappedBeat < (n.startTime + n.duration)
    );

    if (existing) {
      setSelectedNoteId(existing.id);
      setVelocityVal(existing.velocity);
      return;
    }

    // Otherwise create new note
    const newNote: MidiNote = {
      id: `manual-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      pitch,
      startTime: snappedBeat,
      duration: snapGrid * 2, // default 1 beat or half beat
      velocity: velocityVal,
      track: activeTrack,
    };

    globalAudioEngine.playNotePreview(pitch, activeTrack, 0.3);
    pushHistory([...composition.notes, newNote]);
    setSelectedNoteId(newNote.id);
  };

  const handleDeleteSelected = () => {
    if (!selectedNoteId) return;
    const remaining = composition.notes.filter(n => n.id !== selectedNoteId);
    pushHistory(remaining);
    setSelectedNoteId(null);
  };

  const handleNoteDurationChange = (noteId: string, deltaBeats: number) => {
    const updated = composition.notes.map(n => {
      if (n.id === noteId) {
        return { ...n, duration: Math.max(snapGrid, n.duration + deltaBeats) };
      }
      return n;
    });
    pushHistory(updated);
  };

  const handleVelocityChange = (newVel: number) => {
    setVelocityVal(newVel);
    if (selectedNoteId) {
      const updated = composition.notes.map(n => {
        if (n.id === selectedNoteId) {
          return { ...n, velocity: newVel };
        }
        return n;
      });
      pushHistory(updated);
    }
  };

  const handleAiAssist = (command: string) => {
    const result = applyAiAssist(composition, command);
    pushHistory(result.notes);
  };

  const trackLabels = [
    { id: 0, name: 'Lead / Melody', color: 'text-cyan-400' },
    { id: 1, name: 'Chords / Harmony', color: 'text-violet-400' },
    { id: 2, name: 'Bassline', color: 'text-blue-400' },
    { id: 3, name: 'Drums / Percussion', color: 'text-pink-400' },
  ];

  return (
    <div className="w-full rounded-xl border border-white/10 bg-[#090b10] shadow-2xl flex flex-col overflow-hidden">
      
      {/* Top DAW Toolbar */}
      <div className="px-4 py-2.5 bg-[#0d1017] border-b border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Left: Playback & Track selector */}
        <div className="flex items-center gap-3">
          <button
            onClick={onTogglePlay}
            className="px-3 py-1.5 bg-cyan-400 hover:bg-cyan-300 text-black font-semibold rounded flex items-center gap-1.5 shadow-sm transition-all"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isPlaying ? 'Pause' : 'Play DAW'}</span>
          </button>

          {/* Active Track Selector */}
          <div className="flex items-center gap-1 p-0.5 bg-black/40 rounded border border-white/5">
            {trackLabels.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTrack(t.id)}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                  activeTrack === t.id
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className={t.color}>● </span>
                <span>{t.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Center: AI Assist Action Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          <span className="text-[11px] font-mono text-cyan-400 flex items-center gap-1 mr-1">
            <Sparkles className="w-3 h-3" />
            <span>AI ASSIST:</span>
          </span>
          <button
            onClick={() => handleAiAssist('continue')}
            className="px-2 py-1 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded border border-white/10 transition-colors whitespace-nowrap"
            title="Extend melody with predictive neural patterns"
          >
            + Continue
          </button>
          <button
            onClick={() => handleAiAssist('harmonize')}
            className="px-2 py-1 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded border border-white/10 transition-colors whitespace-nowrap"
            title="Add counter-melody harmony voice"
          >
            Harmonize
          </button>
          <button
            onClick={() => handleAiAssist('add_bassline')}
            className="px-2 py-1 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded border border-white/10 transition-colors whitespace-nowrap"
            title="Generate root progression bassline"
          >
            + Bass
          </button>
          <button
            onClick={() => handleAiAssist('add_drums')}
            className="px-2 py-1 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded border border-white/10 transition-colors whitespace-nowrap"
            title="Add 808 kick, snare and hats"
          >
            + 808 Drums
          </button>
          <button
            onClick={() => handleAiAssist('humanize')}
            className="px-2 py-1 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded border border-white/10 transition-colors whitespace-nowrap"
            title="Add micro-timing jitter and velocity dynamics"
          >
            Humanize
          </button>
        </div>

        {/* Right: Grid Snap, Zoom, Undo, Redo */}
        <div className="flex items-center gap-2">
          {/* Snap */}
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <Grid className="w-3 h-3 text-slate-500" />
            <select
              value={snapGrid}
              onChange={(e) => setSnapGrid(parseFloat(e.target.value))}
              className="bg-black/50 border border-white/10 text-slate-300 rounded px-1.5 py-0.5 text-[11px] focus:outline-none"
            >
              <option value={1.0}>1/4 Beat</option>
              <option value={0.5}>1/8 Beat</option>
              <option value={0.25}>1/16 Beat</option>
            </select>
          </div>

          {/* Zoom */}
          <button
            onClick={() => setZoomX(Math.max(20, zoomX - 8))}
            className="p-1 hover:bg-white/10 text-slate-400 hover:text-white rounded"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomX(Math.min(80, zoomX + 8))}
            className="p-1 hover:bg-white/10 text-slate-400 hover:text-white rounded"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          {/* Undo / Redo */}
          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="p-1 hover:bg-white/10 text-slate-400 hover:text-white rounded disabled:opacity-30"
            title="Undo (Ctrl+Z)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="p-1 hover:bg-white/10 text-slate-400 hover:text-white rounded disabled:opacity-30"
            title="Redo"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          {selectedNoteId && (
            <button
              onClick={handleDeleteSelected}
              className="p-1 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 rounded"
              title="Delete Note"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>

      {/* Main Piano Roll Viewport */}
      <div 
        ref={containerRef}
        className="relative flex-1 overflow-x-auto overflow-y-auto max-h-[520px] bg-[#07080c] select-none"
      >
        <div 
          className="relative flex" 
          style={{ width: `${zoomX * totalBeats + 80}px`, height: `${pitches.length * rowHeight}px` }}
        >
          {/* Vertical Piano Keys Column (Sticky Left) */}
          <div className="sticky left-0 z-30 w-16 bg-[#0d0f17] border-r border-white/10 flex flex-col shrink-0 shadow-lg">
            {pitches.map((pitch) => {
              const isBlack = isBlackKey(pitch);
              const name = getPitchName(pitch);
              return (
                <button
                  key={pitch}
                  onClick={() => handleKeyClick(pitch)}
                  style={{ height: `${rowHeight}px` }}
                  className={`w-full text-right pr-2 text-[10px] font-mono border-b border-black/40 flex items-center justify-end transition-colors ${
                    isBlack
                      ? 'bg-[#151922] text-slate-400 hover:bg-[#202736]'
                      : 'bg-[#222938] text-slate-200 hover:bg-[#2d374a]'
                  }`}
                  title={`Preview ${name}`}
                >
                  <span>{name}</span>
                </button>
              );
            })}
          </div>

          {/* Grid Rows & Notes Area */}
          <div className="relative flex-1">
            
            {/* Playhead Vertical Line */}
            <div
              className="absolute top-0 bottom-0 z-20 pointer-events-none border-l-2 border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]"
              style={{ left: `${currentBeat * zoomX}px` }}
            >
              <div className="w-2.5 h-2.5 -ml-1 -top-1 bg-cyan-400 rotate-45" />
            </div>

            {/* Horizontal pitch rows */}
            {pitches.map((pitch, idx) => {
              const isBlack = isBlackKey(pitch);
              return (
                <div
                  key={pitch}
                  onClick={(e) => handleGridClick(e, pitch)}
                  style={{ 
                    top: `${idx * rowHeight}px`, 
                    height: `${rowHeight}px`,
                    width: `${zoomX * totalBeats}px`
                  }}
                  className={`absolute left-0 border-b border-white/[0.04] cursor-crosshair ${
                    isBlack ? 'bg-black/40' : 'bg-white/[0.01]'
                  }`}
                />
              );
            })}

            {/* Vertical Beat & Bar measure lines */}
            {Array.from({ length: totalBeats + 1 }).map((_, beatIdx) => {
              const isBarStart = beatIdx % 4 === 0;
              return (
                <div
                  key={beatIdx}
                  style={{ 
                    left: `${beatIdx * zoomX}px`,
                    height: `${pitches.length * rowHeight}px`
                  }}
                  className={`absolute top-0 pointer-events-none ${
                    isBarStart 
                      ? 'border-l border-white/20' 
                      : 'border-l border-white/[0.04]'
                  }`}
                >
                  {isBarStart && (
                    <span className="absolute top-1 left-1.5 text-[9px] font-mono text-slate-500 select-none">
                      {beatIdx / 4 + 1}
                    </span>
                  )}
                </div>
              );
            })}

            {/* Active Notes Overlay */}
            {composition.notes.map((note) => {
              const pitchIdx = pitches.indexOf(note.pitch);
              if (pitchIdx === -1) return null; // out of visible register

              const top = pitchIdx * rowHeight;
              const left = note.startTime * zoomX;
              const width = Math.max(6, note.duration * zoomX);
              const isSelected = selectedNoteId === note.id;
              const trackStyle = TRACK_COLORS[note.track] || TRACK_COLORS[0];
              const velOpacity = 0.4 + (note.velocity / 127) * 0.6;

              return (
                <div
                  key={note.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNoteId(note.id);
                    setVelocityVal(note.velocity);
                    globalAudioEngine.playNotePreview(note.pitch, note.track, 0.3);
                  }}
                  style={{
                    top: `${top + 1}px`,
                    left: `${left}px`,
                    width: `${width}px`,
                    height: `${rowHeight - 2}px`,
                    opacity: velOpacity,
                  }}
                  className={`absolute rounded-[3px] border ${trackStyle.border} ${trackStyle.bg} cursor-pointer group shadow-sm z-10 transition-shadow ${
                    isSelected ? 'ring-2 ring-white ring-offset-1 ring-offset-black' : ''
                  }`}
                >
                  <div className="h-full px-1 flex items-center justify-between text-[9px] font-mono text-white truncate pointer-events-none">
                    <span className="truncate">{getPitchName(note.pitch)}</span>
                  </div>

                  {/* Right resize handle */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNoteDurationChange(note.id, snapGrid);
                    }}
                    className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/40 opacity-0 group-hover:opacity-100"
                    title="Extend length"
                  />
                </div>
              );
            })}

          </div>
        </div>
      </div>

      {/* Bottom Note Velocity & Properties Panel */}
      <div className="px-4 py-2 bg-[#0d1017] border-t border-white/10 flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-400">Velocity:</span>
            <input
              type="range"
              min={1}
              max={127}
              value={velocityVal}
              onChange={(e) => handleVelocityChange(parseInt(e.target.value))}
              className="w-24 h-1 bg-slate-700 rounded appearance-none cursor-pointer"
            />
            <span className="font-mono text-cyan-400 tabular-nums text-[11px] w-8">
              {velocityVal}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-400">
            <span>Notes: <strong className="text-white font-mono tabular-nums">{composition.notes.length}</strong></span>
            <span>·</span>
            <span>Bars: <strong className="text-white font-mono tabular-nums">{composition.bars}</strong></span>
            <span>·</span>
            <span>Scale: <strong className="text-white">{composition.key}</strong></span>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 font-mono">
          Click cell to add · Click note to select · Drag edge to resize
        </div>
      </div>

    </div>
  );
};
