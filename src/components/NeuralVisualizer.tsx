import React, { useEffect, useRef, useState } from 'react';
import { Activity, Disc, Cpu, Layers } from 'lucide-react';
import { Composition } from '../types';
import { globalAudioEngine } from '../services/audioEngine';

interface NeuralVisualizerProps {
  composition: Composition | null;
  isPlaying: boolean;
}

type VisualizerMode = 'synapse' | 'circular' | 'waveform' | 'waterfall';

export const NeuralVisualizer: React.FC<NeuralVisualizerProps> = ({ composition, isPlaying }) => {
  const [mode, setMode] = useState<VisualizerMode>('synapse');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Simulation nodes for Synapse Network
    const nodeCount = 36;
    const nodes: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      baseRadius: number;
      color: string;
      activity: number;
    }> = [];

    const palette = ['#06b6d4', '#8b5cf6', '#3b82f6', '#ec4899', '#10b981'];

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        baseRadius: Math.random() * 3 + 2,
        color: palette[Math.floor(Math.random() * palette.length)],
        activity: 0.1,
      });
    }

    // Particles for Waveform mode
    const particles: Array<{ x: number; y: number; vy: number; alpha: number; color: string }> = [];

    const render = () => {
      // Ensure canvas matches display resolution
      if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
      }

      const width = canvas.width;
      const height = canvas.height;
      const analyser = globalAudioEngine.getAnalyser();

      const freqData = new Uint8Array(analyser ? analyser.frequencyBinCount : 256);
      const timeData = new Uint8Array(analyser ? analyser.fftSize : 256);

      if (analyser && isPlaying) {
        analyser.getByteFrequencyData(freqData);
        analyser.getByteTimeDomainData(timeData);
      } else {
        // Subtle simulated idle noise
        const t = performance.now() * 0.002;
        for (let i = 0; i < freqData.length; i++) {
          freqData[i] = Math.max(10, Math.sin(t + i * 0.1) * 30 + 20);
        }
        for (let i = 0; i < timeData.length; i++) {
          timeData[i] = 128 + Math.sin(t + i * 0.05) * 12;
        }
      }

      // Calculate audio energy
      let totalEnergy = 0;
      for (let i = 0; i < 40; i++) totalEnergy += freqData[i];
      const avgEnergy = totalEnergy / 40; // Bass/mid energy 0 - 255
      const energyNorm = avgEnergy / 255;

      // Dark background with slight trail for glow
      ctx.fillStyle = 'rgba(8, 9, 13, 0.45)';
      ctx.fillRect(0, 0, width, height);

      if (mode === 'synapse') {
        // MODE 1: NEURAL SYNAPSE NETWORK
        // Update nodes
        nodes.forEach((n, idx) => {
          n.x += n.vx * (1 + energyNorm * 2);
          n.y += n.vy * (1 + energyNorm * 2);

          if (n.x < 20 || n.x > width - 20) n.vx *= -1;
          if (n.y < 20 || n.y > height - 20) n.vy *= -1;

          const freqVal = freqData[idx * 3 % freqData.length] / 255;
          n.activity = Math.max(0.1, freqVal);
        });

        // Draw connections
        ctx.lineWidth = 1;
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const dx = nodes[i].x - nodes[j].x;
            const dy = nodes[i].y - nodes[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const maxDist = 140 + energyNorm * 60;

            if (dist < maxDist) {
              const alpha = (1 - dist / maxDist) * Math.max(nodes[i].activity, nodes[j].activity) * 0.85;
              ctx.strokeStyle = `rgba(6, 182, 212, ${alpha})`;
              ctx.beginPath();
              ctx.moveTo(nodes[i].x, nodes[i].y);
              ctx.lineTo(nodes[j].x, nodes[j].y);
              ctx.stroke();

              // Neural pulse packet along connection
              if (energyNorm > 0.4 && Math.random() < 0.02) {
                const pulseT = (performance.now() * 0.003) % 1;
                const px = nodes[i].x + (nodes[j].x - nodes[i].x) * pulseT;
                const py = nodes[i].y + (nodes[j].y - nodes[i].y) * pulseT;
                ctx.fillStyle = '#ec4899';
                ctx.beginPath();
                ctx.arc(px, py, 2.5, 0, Math.PI * 2);
                ctx.fill();
              }
            }
          }
        }

        // Draw nodes
        nodes.forEach(n => {
          const r = n.baseRadius + n.activity * 6;
          const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 2.5);
          grad.addColorStop(0, n.color);
          grad.addColorStop(1, 'transparent');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(n.x, n.y, r * 2, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(n.x, n.y, r * 0.5, 0, Math.PI * 2);
          ctx.fill();
        });

      } else if (mode === 'circular') {
        // MODE 2: CIRCULAR AUDIO HALO
        const centerX = width / 2;
        const centerY = height / 2;
        const baseRadius = Math.min(width, height) * 0.22 + (energyNorm * 25);
        const bars = 72;
        const step = (Math.PI * 2) / bars;

        // Inner core glow
        const coreGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, baseRadius);
        coreGrad.addColorStop(0, `rgba(139, 92, 246, ${0.15 + energyNorm * 0.2})`);
        coreGrad.addColorStop(0.8, `rgba(6, 182, 212, ${0.1 + energyNorm * 0.15})`);
        coreGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2);
        ctx.fill();

        // Radiating frequency bars
        for (let i = 0; i < bars; i++) {
          const angle = i * step;
          const sample = freqData[Math.floor((i / bars) * (freqData.length * 0.6))] / 255;
          const barHeight = sample * (Math.min(width, height) * 0.28) + 4;

          const x1 = centerX + Math.cos(angle) * baseRadius;
          const y1 = centerY + Math.sin(angle) * baseRadius;
          const x2 = centerX + Math.cos(angle) * (baseRadius + barHeight);
          const y2 = centerY + Math.sin(angle) * (baseRadius + barHeight);

          const hue = 180 + (i / bars) * 120;
          ctx.strokeStyle = `hsl(${hue}, 90%, ${50 + sample * 30}%)`;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();

          // Outer tip spark
          if (sample > 0.6) {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(x2, y2, 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }

      } else if (mode === 'waveform') {
        // MODE 3: CYBER WAVEFORM & PARTICLES
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#06b6d4';
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#06b6d4';

        ctx.beginPath();
        const sliceWidth = width / timeData.length;
        let x = 0;

        for (let i = 0; i < timeData.length; i++) {
          const v = timeData[i] / 128.0;
          const y = (v * height) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }
        ctx.stroke();
        ctx.shadowBlur = 0; // reset

        // Floating particles
        if (isPlaying && Math.random() < 0.6) {
          particles.push({
            x: Math.random() * width,
            y: height / 2 + (Math.random() - 0.5) * 100,
            vy: -Math.random() * 2 - 1,
            alpha: 1,
            color: Math.random() > 0.5 ? '#8b5cf6' : '#06b6d4',
          });
        }

        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.y += p.vy;
          p.alpha -= 0.015;
          if (p.alpha <= 0) {
            particles.splice(i, 1);
            continue;
          }
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1.0;
        }

      } else if (mode === 'waterfall') {
        // MODE 4: WATERFALL FREQUENCY CASCADE
        const barCount = 48;
        const barWidth = width / barCount;

        for (let i = 0; i < barCount; i++) {
          const freqVal = freqData[Math.floor((i / barCount) * (freqData.length * 0.7))] / 255;
          const barHeight = freqVal * (height * 0.75);

          const grad = ctx.createLinearGradient(0, height, 0, height - barHeight);
          grad.addColorStop(0, '#06b6d4');
          grad.addColorStop(0.6, '#8b5cf6');
          grad.addColorStop(1, '#ec4899');

          ctx.fillStyle = grad;
          ctx.fillRect(i * barWidth, height - barHeight, barWidth - 2, barHeight);

          // Peak cap
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(i * barWidth, height - barHeight - 3, barWidth - 2, 2);
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [mode, isPlaying]);

  return (
    <div className="relative w-full h-[380px] sm:h-[460px] rounded-xl overflow-hidden border border-white/10 bg-[#08090d] shadow-2xl flex flex-col">
      {/* Top Overlay Controls */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        
        {/* Track telemetry */}
        <div className="pointer-events-auto bg-[#0a0d14]/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-semibold text-white truncate max-w-[200px]">
            {composition?.title || 'Neural Sonata Synth Engine'}
          </span>
          <span className="text-slate-500">·</span>
          <span className="font-mono text-cyan-400 tabular-nums">
            {composition?.bpm || 120} BPM
          </span>
        </div>

        {/* Visualizer Mode Switcher */}
        <div className="pointer-events-auto flex items-center gap-1 bg-[#0a0d14]/80 backdrop-blur-md p-1 rounded-lg border border-white/10">
          <button
            onClick={() => setMode('synapse')}
            className={`px-2.5 py-1 text-xs font-medium rounded flex items-center gap-1.5 transition-colors ${
              mode === 'synapse' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Synapse Net</span>
          </button>
          <button
            onClick={() => setMode('circular')}
            className={`px-2.5 py-1 text-xs font-medium rounded flex items-center gap-1.5 transition-colors ${
              mode === 'circular' ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Disc className="w-3.5 h-3.5" />
            <span>Radial Halo</span>
          </button>
          <button
            onClick={() => setMode('waveform')}
            className={`px-2.5 py-1 text-xs font-medium rounded flex items-center gap-1.5 transition-colors ${
              mode === 'waveform' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Oscilloscope</span>
          </button>
          <button
            onClick={() => setMode('waterfall')}
            className={`px-2.5 py-1 text-xs font-medium rounded flex items-center gap-1.5 transition-colors ${
              mode === 'waterfall' ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Spectrum</span>
          </button>
        </div>

      </div>

      {/* Main Reactive Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair"
      />

      {/* Subtle bottom legend */}
      <div className="absolute bottom-3 left-4 text-[11px] font-mono text-slate-500 flex items-center gap-3 pointer-events-none">
        <span>FFT: 512 Bins</span>
        <span>·</span>
        <span>Sampling: 44.1 kHz</span>
        <span>·</span>
        <span>Latency: &lt; 5ms</span>
      </div>
    </div>
  );
};
