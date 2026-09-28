import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Play, 
  Pause, 
  Music, 
  ArrowRight, 
  CheckCircle2,
  Terminal,
  Zap
} from 'lucide-react';
import { AIComposerMessage, Composition } from '../types';
import { applyAiAssist } from '../services/aiComposer';
import { globalAudioEngine } from '../services/audioEngine';

interface CoComposerViewProps {
  composition: Composition;
  onUpdateComposition: (updated: Composition) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

export const CoComposerView: React.FC<CoComposerViewProps> = ({
  composition,
  onUpdateComposition,
  isPlaying,
  onTogglePlay,
}) => {
  const [messages, setMessages] = useState<AIComposerMessage[]>([
    {
      id: 'msg-1',
      sender: 'assistant',
      text: `Hello Maestro. I am your Neural Co-Composer. I have analyzed "${composition.title}" in ${composition.key} at ${composition.bpm} BPM. How shall we sculpt the musical architecture?`,
      timestamp: '00:01',
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages]);

  const quickCommands = [
    { label: 'Make the melody darker', cmd: 'make_darker' },
    { label: 'Add 808 percussion', cmd: 'add_drums' },
    { label: 'Harmonize counter-melody', cmd: 'harmonize' },
    { label: 'Add root bassline', cmd: 'add_bassline' },
    { label: 'Humanize timing & velocity', cmd: 'humanize' },
    { label: 'Slow down tempo (-15%)', cmd: 'slow_down' },
    { label: 'Speed up tempo (+15%)', cmd: 'speed_up' },
    { label: 'Extend melody (+4 bars)', cmd: 'continue' },
  ];

  const handleExecuteCommand = (commandText: string, cmdAction?: string) => {
    const userMsg: AIComposerMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: commandText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsProcessing(true);

    setTimeout(() => {
      let actionToRun = cmdAction;
      if (!actionToRun) {
        const lower = commandText.toLowerCase();
        if (lower.includes('dark') || lower.includes('minor')) actionToRun = 'make_darker';
        else if (lower.includes('drum') || lower.includes('beat')) actionToRun = 'add_drums';
        else if (lower.includes('harm') || lower.includes('chord')) actionToRun = 'harmonize';
        else if (lower.includes('bass')) actionToRun = 'add_bassline';
        else if (lower.includes('human') || lower.includes('groove')) actionToRun = 'humanize';
        else if (lower.includes('slow')) actionToRun = 'slow_down';
        else if (lower.includes('speed') || lower.includes('fast')) actionToRun = 'speed_up';
        else actionToRun = 'continue';
      }

      const updated = applyAiAssist(composition, actionToRun);
      onUpdateComposition(updated);

      // Play audio preview of modified piece
      globalAudioEngine.playComposition(updated, 0);

      const aiResponseTexts: Record<string, string> = {
        make_darker: `Applied modal flattening to minor scale degrees and deepened harmonic tension. Notice the darker harmonic register.`,
        add_drums: `Synthesized an 808 rhythm section featuring syncopated kicks, snappy acoustic snares, and metallic closed hi-hats.`,
        harmonize: `Generated polyphonic counter-melody voices a major third and sixth above primary melody lines with smooth voice leading.`,
        add_bassline: `Generated an octave-sub bassline locked to the root progression to anchor the low-end harmonic spectrum.`,
        humanize: `Injected human micro-timing jitter and velocity dynamics across all active polyphonic note events.`,
        slow_down: `Tempered global tempo to ${updated.bpm} BPM for a more relaxed, contemplative spatial ambience.`,
        speed_up: `Accelerated tempo to ${updated.bpm} BPM to inject forward kinematic propulsion and drive.`,
        continue: `Predictively extrapolated melodic themes by 4 bars using attention autoregression.`,
      };

      const aiMsg: AIComposerMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: aiResponseTexts[actionToRun] || `Applied requested musical transformation to "${updated.title}".`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionApplied: actionToRun,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsProcessing(false);
    }, 600);
  };

  const handleSendPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim() || isProcessing) return;
    const prompt = inputPrompt.trim();
    setInputPrompt('');
    handleExecuteCommand(prompt);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400">
              Conversational Music Intelligence · Real-time Score Modification
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-display text-white uppercase tracking-tight">
            AI Co-Composer
          </h1>
        </div>

        <button
          onClick={onTogglePlay}
          className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-black font-semibold text-xs rounded-lg shadow-sm flex items-center gap-2 transition-all cursor-pointer"
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          <span>{isPlaying ? 'Pause Playback' : 'Audition Changes'}</span>
        </button>
      </div>

      {/* Main Chat Interface */}
      <div className="rounded-xl border border-white/10 bg-[#090b11] shadow-2xl overflow-hidden flex flex-col h-[520px]">
        
        {/* Chat History Messages */}
        <div
          ref={chatScrollRef}
          className="flex-1 p-5 overflow-y-auto space-y-4 font-sans text-xs scroll-smooth"
        >
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            return (
              <div
                key={m.id}
                className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    isUser
                      ? 'bg-cyan-500 text-black font-bold'
                      : 'bg-violet-600/30 text-violet-300 border border-violet-500/40'
                  }`}
                >
                  {isUser ? 'U' : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`p-3.5 rounded-xl space-y-1.5 ${
                    isUser
                      ? 'bg-cyan-500/20 text-cyan-100 border border-cyan-500/30'
                      : 'bg-[#0d1017] text-slate-200 border border-white/10'
                  }`}
                >
                  <p className="leading-relaxed">{m.text}</p>
                  
                  {m.actionApplied && (
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-400 pt-1">
                      <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                      <span>Executed: {m.actionApplied} · Synthesizer updated</span>
                    </div>
                  )}

                  <span className="text-[9px] font-mono text-slate-500 block text-right pt-0.5">
                    {m.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isProcessing && (
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 animate-pulse">
              <Sparkles className="w-4 h-4" />
              <span>Analyzing harmonic context and sculpting note arrays...</span>
            </div>
          )}
        </div>

        {/* Quick Action Command Chips */}
        <div className="px-4 py-2 bg-[#0c0f16] border-t border-white/5 flex items-center gap-1.5 overflow-x-auto">
          <span className="text-[10px] font-mono text-slate-500 uppercase shrink-0 mr-1">
            Directives:
          </span>
          {quickCommands.map((q) => (
            <button
              key={q.cmd}
              onClick={() => handleExecuteCommand(q.label, q.cmd)}
              disabled={isProcessing}
              className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 text-[11px] font-medium transition-colors whitespace-nowrap disabled:opacity-40"
            >
              {q.label}
            </button>
          ))}
        </div>

        {/* Prompt Input Form */}
        <form
          onSubmit={handleSendPrompt}
          className="p-3 bg-[#0d1017] border-t border-white/10 flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Type musical instruction (e.g. 'Make the chords more jazzy and slow down')..."
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            disabled={isProcessing}
            className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            disabled={isProcessing || !inputPrompt.trim()}
            className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 text-black font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Instruct AI</span>
          </button>
        </form>

      </div>

    </div>
  );
};
