import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  Save, 
  Cpu, 
  Terminal, 
  Activity, 
  CheckCircle2, 
  History,
  TrendingDown,
  Layers,
  Sparkles
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { AIModelType, TrainingRun } from '../types';

interface TrainingLabViewProps {
  initialRun: TrainingRun;
}

export const TrainingLabView: React.FC<TrainingLabViewProps> = ({ initialRun }) => {
  const [modelType, setModelType] = useState<AIModelType>('Transformer Composer');
  const [layers, setLayers] = useState<number>(6);
  const [hiddenUnits, setHiddenUnits] = useState<number>(512);
  const [seqLength, setSeqLength] = useState<number>(64);
  const [batchSize, setBatchSize] = useState<number>(64);
  const [learningRate, setLearningRate] = useState<number>(0.0003);
  const [totalEpochs, setTotalEpochs] = useState<number>(50);
  const [optimizer, setOptimizer] = useState<string>('AdamW');
  const [lossFunction, setLossFunction] = useState<string>('Cross-Entropy with Label Smoothing');

  const [status, setStatus] = useState<'idle' | 'training' | 'paused' | 'completed'>('idle');
  const [currentEpoch, setCurrentEpoch] = useState<number>(1);
  const [currentLoss, setCurrentLoss] = useState<number>(4.21);
  const [valLoss, setValLoss] = useState<number>(4.35);
  const [accuracy, setAccuracy] = useState<number>(22.4);
  const [history, setHistory] = useState<Array<{ epoch: number; loss: number; valLoss: number; accuracy: number }>>([
    { epoch: 1, loss: 4.21, valLoss: 4.35, accuracy: 22.4 }
  ]);
  const [logs, setLogs] = useState<string[]>([
    '[00:00:01] Deep Learning Environment initialized: PyTorch 2.4.0+cu121',
    '[00:00:02] Model architecture: Transformer Decoder (8 Multi-head Attention layers)',
    '[00:00:03] Ready to train on Lakh Cyberpunk MIDI tokenized sequences.',
  ]);

  const logTerminalRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll logs
  useEffect(() => {
    if (logTerminalRef.current) {
      logTerminalRef.current.scrollTop = logTerminalRef.current.scrollHeight;
    }
  }, [logs]);

  // Live training simulation tick
  useEffect(() => {
    let interval: number;

    if (status === 'training') {
      interval = window.setInterval(() => {
        setCurrentEpoch((prevEpoch) => {
          if (prevEpoch >= totalEpochs) {
            setStatus('completed');
            setLogs((prev) => [
              ...prev,
              `[${new Date().toLocaleTimeString()}] Training completed successfully! Final loss: ${currentLoss.toFixed(3)}`,
              `[${new Date().toLocaleTimeString()}] Checkpoint saved to models/neural_sonata_${modelType.toLowerCase().replace(/[^a-z0-9]/g, '_')}_v1.pt`,
            ]);
            return totalEpochs;
          }

          const nextEpoch = prevEpoch + 1;
          const decay = Math.exp(-nextEpoch / 14);
          const newLoss = Math.max(0.68, parseFloat((decay * 3.8 + 0.65 + (Math.random() * 0.08 - 0.04)).toFixed(3)));
          const newValLoss = parseFloat((newLoss * 1.08 + (Math.random() * 0.05)).toFixed(3));
          const newAcc = Math.min(94.2, parseFloat((20 + (1 - decay) * 72 + (Math.random() * 1.5 - 0.75)).toFixed(1)));

          setCurrentLoss(newLoss);
          setValLoss(newValLoss);
          setAccuracy(newAcc);

          setHistory((prevHistory) => [
            ...prevHistory,
            { epoch: nextEpoch, loss: newLoss, valLoss: newValLoss, accuracy: newAcc },
          ]);

          const timestamp = new Date().toLocaleTimeString();
          setLogs((prevLogs) => [
            ...prevLogs,
            `[${timestamp}] Epoch ${nextEpoch}/${totalEpochs} · Loss: ${newLoss} · Val Loss: ${newValLoss} · Acc: ${newAcc}% · LR: ${learningRate}`,
          ]);

          return nextEpoch;
        });
      }, 700);
    }

    return () => clearInterval(interval);
  }, [status, totalEpochs, currentLoss, learningRate, modelType]);

  const handleStartTraining = () => {
    if (status === 'idle' || status === 'completed') {
      setCurrentEpoch(1);
      setCurrentLoss(4.21);
      setValLoss(4.35);
      setAccuracy(22.4);
      setHistory([{ epoch: 1, loss: 4.21, valLoss: 4.35, accuracy: 22.4 }]);
      setLogs([
        `[${new Date().toLocaleTimeString()}] Initializing training for ${modelType}...`,
        `[${new Date().toLocaleTimeString()}] Hyperparameters: Layers=${layers}, Hidden=${hiddenUnits}, BatchSize=${batchSize}, LR=${learningRate}`,
        `[${new Date().toLocaleTimeString()}] Optimiser: ${optimizer} · Loss: ${lossFunction}`,
      ]);
    }
    setStatus('training');
  };

  const handlePause = () => {
    setStatus('paused');
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Training paused by composer.`]);
  };

  const handleStop = () => {
    setStatus('idle');
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Training aborted.`]);
  };

  const handleSaveModel = () => {
    setLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] User checkpoint export triggered: weights_${modelType}_epoch${currentEpoch}.safetensors`,
    ]);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2 h-2 rounded-full ${status === 'training' ? 'bg-cyan-400 animate-ping' : 'bg-slate-400'}`} />
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400">
              Deep Learning Laboratory · PyTorch Training Harness
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-display text-white uppercase tracking-tight">
            AI Training Lab
          </h1>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {status === 'training' ? (
            <button
              onClick={handlePause}
              className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>Pause Training</span>
            </button>
          ) : (
            <button
              onClick={handleStartTraining}
              className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-black font-semibold text-xs rounded-lg shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{status === 'paused' ? 'Resume Training' : 'Start Training'}</span>
            </button>
          )}

          <button
            onClick={handleStop}
            disabled={status === 'idle'}
            className="p-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg border border-white/10 disabled:opacity-30 transition-colors"
            title="Stop Training"
          >
            <Square className="w-4 h-4 fill-current" />
          </button>

          <button
            onClick={handleSaveModel}
            className="px-3.5 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/10 text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Save Checkpoint"
          >
            <Save className="w-3.5 h-3.5 text-cyan-400" />
            <span>Save Weights</span>
          </button>
        </div>
      </div>

      {/* Model & Hyperparameter Config Grid */}
      <div className="p-5 rounded-xl border border-white/10 bg-[#090b11] space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          Model Architecture & Hyperparameter Configuration
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 text-xs">
          
          {/* Model Type */}
          <div className="space-y-1">
            <label className="text-slate-400">Architecture</label>
            <select
              value={modelType}
              onChange={(e) => setModelType(e.target.value as AIModelType)}
              disabled={status === 'training'}
              className="w-full bg-[#0d1017] border border-white/10 rounded px-2.5 py-1.5 text-white focus:outline-none"
            >
              <option value="Transformer Composer">Transformer</option>
              <option value="LSTM Composer">Stacked LSTM</option>
              <option value="GRU Composer">Bidirectional GRU</option>
              <option value="GAN Music Generator">MusicGAN</option>
            </select>
          </div>

          {/* Layers */}
          <div className="space-y-1">
            <label className="text-slate-400">Layers</label>
            <select
              value={layers}
              onChange={(e) => setLayers(parseInt(e.target.value))}
              disabled={status === 'training'}
              className="w-full bg-[#0d1017] border border-white/10 rounded px-2.5 py-1.5 text-white focus:outline-none"
            >
              <option value={2}>2 Layers</option>
              <option value={4}>4 Layers</option>
              <option value={6}>6 Layers</option>
              <option value={8}>8 Layers</option>
            </select>
          </div>

          {/* Hidden Units */}
          <div className="space-y-1">
            <label className="text-slate-400">Hidden Units</label>
            <select
              value={hiddenUnits}
              onChange={(e) => setHiddenUnits(parseInt(e.target.value))}
              disabled={status === 'training'}
              className="w-full bg-[#0d1017] border border-white/10 rounded px-2.5 py-1.5 text-white focus:outline-none"
            >
              <option value={256}>256 Units</option>
              <option value={512}>512 Units</option>
              <option value={1024}>1024 Units</option>
            </select>
          </div>

          {/* Sequence Length */}
          <div className="space-y-1">
            <label className="text-slate-400">Context Window</label>
            <select
              value={seqLength}
              onChange={(e) => setSeqLength(parseInt(e.target.value))}
              disabled={status === 'training'}
              className="w-full bg-[#0d1017] border border-white/10 rounded px-2.5 py-1.5 text-white focus:outline-none"
            >
              <option value={32}>32 Tokens</option>
              <option value={64}>64 Tokens</option>
              <option value={128}>128 Tokens</option>
            </select>
          </div>

          {/* Learning Rate */}
          <div className="space-y-1">
            <label className="text-slate-400">Learning Rate</label>
            <select
              value={learningRate}
              onChange={(e) => setLearningRate(parseFloat(e.target.value))}
              disabled={status === 'training'}
              className="w-full bg-[#0d1017] border border-white/10 rounded px-2.5 py-1.5 text-white focus:outline-none"
            >
              <option value={0.001}>1e-3 (Aggressive)</option>
              <option value={0.0003}>3e-4 (Standard)</option>
              <option value={0.0001}>1e-4 (Fine-tune)</option>
            </select>
          </div>

          {/* Epochs */}
          <div className="space-y-1">
            <label className="text-slate-400">Epochs</label>
            <input
              type="number"
              min={10}
              max={200}
              value={totalEpochs}
              onChange={(e) => setTotalEpochs(parseInt(e.target.value))}
              disabled={status === 'training'}
              className="w-full bg-[#0d1017] border border-white/10 rounded px-2.5 py-1.5 text-white focus:outline-none"
            />
          </div>

        </div>
      </div>

      {/* Live Telemetry KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-white/10 bg-[#090b11]">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Training Loss</span>
          <div className="text-2xl font-bold font-mono text-cyan-400 tabular-nums">
            {currentLoss.toFixed(3)}
          </div>
          <p className="text-[10px] text-slate-500 font-mono">Cross-Entropy Loss</p>
        </div>

        <div className="p-4 rounded-xl border border-white/10 bg-[#090b11]">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Validation Loss</span>
          <div className="text-2xl font-bold font-mono text-violet-400 tabular-nums">
            {valLoss.toFixed(3)}
          </div>
          <p className="text-[10px] text-slate-500 font-mono">15% Held-out split</p>
        </div>

        <div className="p-4 rounded-xl border border-white/10 bg-[#090b11]">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Sequence Accuracy</span>
          <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
            {accuracy.toFixed(1)}%
          </div>
          <p className="text-[10px] text-slate-500 font-mono">Next-note prediction</p>
        </div>

        <div className="p-4 rounded-xl border border-white/10 bg-[#090b11]">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Epoch Progress</span>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {currentEpoch} / {totalEpochs}
          </div>
          <p className="text-[10px] text-slate-500 font-mono">
            {Math.round((currentEpoch / totalEpochs) * 100)}% Completed
          </p>
        </div>
      </div>

      {/* Real-time Loss Charts */}
      <div className="p-5 rounded-xl border border-white/10 bg-[#090b11] space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <span className="text-xs font-mono uppercase text-slate-300 font-semibold flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            Convergence Trajectory (Training vs Validation Loss)
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            Optimizer: {optimizer} · AdamW $\beta_1=0.9, \beta_2=0.98$
          </span>
        </div>

        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
              <XAxis dataKey="epoch" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[0, 5]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0d1017', borderColor: 'rgba(255,255,255,0.1)', fontSize: '12px' }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Line 
                type="monotone" 
                dataKey="loss" 
                name="Training Loss" 
                stroke="#06b6d4" 
                strokeWidth={2} 
                dot={false} 
                isAnimationActive={false} 
              />
              <Line 
                type="monotone" 
                dataKey="valLoss" 
                name="Validation Loss" 
                stroke="#8b5cf6" 
                strokeWidth={2} 
                dot={false} 
                isAnimationActive={false} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Live Training Console / Terminal */}
      <div className="p-5 rounded-xl border border-white/10 bg-[#07080c] space-y-2 shadow-2xl">
        <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span className="font-mono text-slate-200 uppercase font-semibold">
              Live PyTorch Training Stream (GPU Device: cuda:0)
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            Buffer: {logs.length} Lines
          </span>
        </div>

        <div
          ref={logTerminalRef}
          className="h-44 overflow-y-auto font-mono text-[11px] space-y-1 text-slate-300 pr-2 scroll-smooth select-text"
        >
          {logs.map((log, idx) => (
            <div key={idx} className="leading-relaxed hover:bg-white/[0.02] px-1 rounded">
              <span className="text-cyan-400">{log.substring(0, 10)}</span>
              <span>{log.substring(10)}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
