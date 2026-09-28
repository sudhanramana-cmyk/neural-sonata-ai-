import { Composition, MidiNote } from '../types';

// Convert MIDI pitch to frequency in Hz
export function midiToFreq(pitch: number): number {
  return 440 * Math.pow(2, (pitch - 69) / 12);
}

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  
  // Track gains
  private trackGains: GainNode[] = [];
  
  // FX nodes
  private lowEq: BiquadFilterNode | null = null;
  private midEq: BiquadFilterNode | null = null;
  private highEq: BiquadFilterNode | null = null;
  private delayNode: DelayNode | null = null;
  private delayGain: GainNode | null = null;
  private delayFeedback: GainNode | null = null;
  private reverbGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;

  // Playback state
  private isPlaying: boolean = false;
  private currentComposition: Composition | null = null;
  private playbackStartTime: number = 0;
  private startBeatOffset: number = 0;
  private scheduledEvents: number[] = [];
  private playbackTimerId: number | null = null;
  private onTimeUpdateCallback: ((currentBeat: number, currentSec: number) => void) | null = null;
  private onPlaybackEndedCallback: (() => void) | null = null;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  public init(): AudioContext {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();

      // Master gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);

      // Analyser for visuals
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 512;
      this.analyser.smoothingTimeConstant = 0.8;

      // 3-Band EQ
      this.lowEq = this.ctx.createBiquadFilter();
      this.lowEq.type = 'lowshelf';
      this.lowEq.frequency.setValueAtTime(250, this.ctx.currentTime);
      this.lowEq.gain.setValueAtTime(2, this.ctx.currentTime);

      this.midEq = this.ctx.createBiquadFilter();
      this.midEq.type = 'peaking';
      this.midEq.frequency.setValueAtTime(1200, this.ctx.currentTime);
      this.midEq.Q.setValueAtTime(1.0, this.ctx.currentTime);
      this.midEq.gain.setValueAtTime(0, this.ctx.currentTime);

      this.highEq = this.ctx.createBiquadFilter();
      this.highEq.type = 'highshelf';
      this.highEq.frequency.setValueAtTime(4500, this.ctx.currentTime);
      this.highEq.gain.setValueAtTime(1.5, this.ctx.currentTime);

      // Compressor
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-18, this.ctx.currentTime);
      this.compressor.knee.setValueAtTime(20, this.ctx.currentTime);
      this.compressor.ratio.setValueAtTime(4, this.ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.005, this.ctx.currentTime);
      this.compressor.release.setValueAtTime(0.2, this.ctx.currentTime);

      // Delay FX
      this.delayNode = this.ctx.createDelay();
      this.delayNode.delayTime.setValueAtTime(0.32, this.ctx.currentTime); // ~dotted eighth at 120
      this.delayFeedback = this.ctx.createGain();
      this.delayFeedback.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.delayGain = this.ctx.createGain();
      this.delayGain.gain.setValueAtTime(0.2, this.ctx.currentTime);

      this.delayNode.connect(this.delayFeedback);
      this.delayFeedback.connect(this.delayNode);
      this.delayNode.connect(this.delayGain);

      // Reverb FX (Simulated algorithmic diffuse network)
      this.reverbGain = this.ctx.createGain();
      this.reverbGain.gain.setValueAtTime(0.25, this.ctx.currentTime);

      // Track channels (0=Lead, 1=Chords, 2=Bass, 3=Drums)
      this.trackGains = [0, 1, 2, 3].map(() => {
        const gain = this.ctx!.createGain();
        gain.gain.setValueAtTime(0.8, this.ctx!.currentTime);
        return gain;
      });

      // Chain audio graph
      this.trackGains.forEach(tg => {
        tg.connect(this.lowEq!);
        tg.connect(this.delayNode!);
        tg.connect(this.reverbGain!);
      });

      this.delayGain.connect(this.lowEq);
      this.reverbGain.connect(this.lowEq);

      this.lowEq.connect(this.midEq);
      this.midEq.connect(this.highEq);
      this.highEq.connect(this.compressor);
      this.compressor.connect(this.masterGain);
      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    return this.ctx;
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public getAudioContext(): AudioContext | null {
    return this.ctx;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public setOnTimeUpdate(cb: (currentBeat: number, currentSec: number) => void) {
    this.onTimeUpdateCallback = cb;
  }

  public setOnPlaybackEnded(cb: () => void) {
    this.onPlaybackEndedCallback = cb;
  }

  public setMasterVolume(vol: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, vol)), this.ctx.currentTime);
    }
  }

  public setTrackVolume(trackIndex: number, vol: number) {
    if (this.trackGains[trackIndex] && this.ctx) {
      this.trackGains[trackIndex].gain.setValueAtTime(Math.max(0, Math.min(1.2, vol)), this.ctx.currentTime);
    }
  }

  public setReverbMix(mix: number) {
    if (this.reverbGain && this.ctx) {
      this.reverbGain.gain.setValueAtTime(Math.max(0, Math.min(0.8, mix)), this.ctx.currentTime);
    }
  }

  public setDelayMix(mix: number) {
    if (this.delayGain && this.ctx) {
      this.delayGain.gain.setValueAtTime(Math.max(0, Math.min(0.8, mix)), this.ctx.currentTime);
    }
  }

  /**
   * Preview a single note on-demand (e.g. clicking a piano roll key)
   */
  public playNotePreview(pitch: number, track: number = 0, durationSec: number = 0.5) {
    this.init();
    if (!this.ctx) return;
    this.synthesizeNote(pitch, this.ctx.currentTime, durationSec, 100, track, this.ctx, this.trackGains[track] || this.masterGain!);
  }

  /**
   * Play an entire composition starting at a given beat offset
   */
  public playComposition(composition: Composition, startBeat: number = 0) {
    this.init();
    if (!this.ctx) return;

    this.stopPlayback();

    this.currentComposition = composition;
    this.isPlaying = true;
    this.startBeatOffset = startBeat;

    const bpm = composition.bpm || 120;
    const secondsPerBeat = 60 / bpm;
    const now = this.ctx.currentTime + 0.05;
    this.playbackStartTime = now - (startBeat * secondsPerBeat);

    // Filter notes starting after startBeat
    const relevantNotes = composition.notes.filter(n => (n.startTime + n.duration) > startBeat);

    // Schedule synthesis for all notes
    relevantNotes.forEach(note => {
      const noteDelayBeats = Math.max(0, note.startTime - startBeat);
      const noteScheduledTime = now + (noteDelayBeats * secondsPerBeat);
      const noteDurationSec = Math.max(0.08, note.duration * secondsPerBeat);
      const trackIdx = Math.min(3, Math.max(0, note.track || 0));
      const destNode = this.trackGains[trackIdx] || this.masterGain!;

      this.synthesizeNote(note.pitch, noteScheduledTime, noteDurationSec, note.velocity, trackIdx, this.ctx!, destNode);
    });

    // Start timeline ticker
    const totalBeats = composition.bars * 4;
    const totalDurationSec = totalBeats * secondsPerBeat;

    this.playbackTimerId = window.setInterval(() => {
      if (!this.isPlaying || !this.ctx) return;
      const elapsedSec = this.ctx.currentTime - this.playbackStartTime;
      const currentBeat = elapsedSec / secondsPerBeat;

      if (this.onTimeUpdateCallback) {
        this.onTimeUpdateCallback(currentBeat, elapsedSec);
      }

      if (elapsedSec >= totalDurationSec) {
        this.stopPlayback();
        if (this.onPlaybackEndedCallback) {
          this.onPlaybackEndedCallback();
        }
      }
    }, 30);
  }

  public pausePlayback(currentBeat: number) {
    this.stopPlayback();
    this.startBeatOffset = currentBeat;
  }

  public stopPlayback() {
    this.isPlaying = false;
    if (this.playbackTimerId !== null) {
      clearInterval(this.playbackTimerId);
      this.playbackTimerId = null;
    }
    // Re-init audio context tracks to kill hanging oscillators cleanly if needed
    if (this.ctx && this.trackGains.length) {
      // Fast gain drop and restore to silence any tail
      this.trackGains.forEach(tg => {
        const currentVal = tg.gain.value;
        tg.gain.cancelScheduledValues(this.ctx!.currentTime);
        tg.gain.setValueAtTime(0, this.ctx!.currentTime);
        tg.gain.setValueAtTime(currentVal, this.ctx!.currentTime + 0.02);
      });
    }
  }

  /**
   * Sound synthesis engine per track instrument
   */
  private synthesizeNote(
    pitch: number,
    startTime: number,
    duration: number,
    velocity: number,
    track: number,
    ctx: BaseAudioContext,
    destination: AudioNode
  ) {
    const freq = midiToFreq(pitch);
    const velNorm = Math.max(0.1, Math.min(1.0, velocity / 127));

    if (track === 3) {
      // DRUMS & PERCUSSION
      this.synthesizeDrum(pitch, startTime, velNorm, ctx, destination);
      return;
    }

    if (track === 2) {
      // BASS (Sub sine + saturated triangle)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(freq, startTime);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 0.5, startTime); // sub octave

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, startTime);
      filter.frequency.exponentialRampToValueAtTime(120, startTime + duration);

      const amp = velNorm * 0.45;
      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(amp, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(amp * 0.6, startTime + Math.min(0.2, duration));
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(destination);

      osc1.start(startTime);
      osc2.start(startTime);
      osc1.stop(startTime + duration + 0.05);
      osc2.stop(startTime + duration + 0.05);
      return;
    }

    if (track === 1) {
      // CHORDS / AMBIENT PAD / EP
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(freq, startTime);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 1.003, startTime); // subtle chorus detune

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, startTime);
      filter.Q.setValueAtTime(2, startTime);

      const amp = velNorm * 0.22;
      const attack = 0.08;
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(amp, startTime + attack);
      gain.gain.exponentialRampToValueAtTime(amp * 0.7, startTime + attack + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration + 0.15);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(destination);

      osc1.start(startTime);
      osc2.start(startTime);
      osc1.stop(startTime + duration + 0.2);
      osc2.stop(startTime + duration + 0.2);
      return;
    }

    // TRACK 0: LEAD / GRAND PIANO / CINEMATIC STRINGS
    const oscMain = ctx.createOscillator();
    const oscHarmonic = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    oscMain.type = 'sawtooth';
    oscMain.frequency.setValueAtTime(freq, startTime);

    oscHarmonic.type = 'sine';
    oscHarmonic.frequency.setValueAtTime(freq * 2, startTime); // 1st overtone for shimmer

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2600, startTime);
    filter.frequency.exponentialRampToValueAtTime(600, startTime + duration);
    filter.Q.setValueAtTime(3.5, startTime);

    const amp = velNorm * 0.35;
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(amp, startTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(amp * 0.5, startTime + 0.12);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration + 0.05);

    oscMain.connect(filter);
    oscHarmonic.connect(filter);
    filter.connect(gain);
    gain.connect(destination);

    oscMain.start(startTime);
    oscHarmonic.start(startTime);
    oscMain.stop(startTime + duration + 0.1);
    oscHarmonic.stop(startTime + duration + 0.1);
  }

  /**
   * Synthesize percussion instruments (Kick 36, Snare 38, Closed Hat 42, Open Hat 46)
   */
  private synthesizeDrum(pitch: number, startTime: number, velNorm: number, ctx: BaseAudioContext, destination: AudioNode) {
    if (pitch <= 36) {
      // 808 Kick
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, startTime);
      osc.frequency.exponentialRampToValueAtTime(42, startTime + 0.15);

      gain.gain.setValueAtTime(velNorm * 0.65, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.35);

      osc.connect(gain);
      gain.connect(destination);
      osc.start(startTime);
      osc.stop(startTime + 0.36);
    } else if (pitch === 38 || pitch === 40) {
      // Snare (Noise burst + tonal snap)
      const bufferSize = ctx.sampleRate * 0.15;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1000, startTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(velNorm * 0.4, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.18);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(destination);

      noise.start(startTime);
      noise.stop(startTime + 0.2);
    } else {
      // Hi-hat / cymbal (Metallic highpass noise)
      const bufferSize = ctx.sampleRate * 0.08;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(7500, startTime);
      filter.Q.setValueAtTime(4, startTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(velNorm * 0.25, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + (pitch > 44 ? 0.18 : 0.06));

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(destination);

      noise.start(startTime);
      noise.stop(startTime + 0.2);
    }
  }

  /**
   * Render composition offline to genuine 16-bit PCM WAV file and trigger download
   */
  public async exportWavAudio(composition: Composition): Promise<void> {
    const bpm = composition.bpm || 120;
    const secondsPerBeat = 60 / bpm;
    const totalBeats = composition.bars * 4;
    const totalDurationSec = Math.max(4, totalBeats * secondsPerBeat + 1.5);
    const sampleRate = 44100;

    const offlineCtx = new OfflineAudioContext(2, Math.ceil(sampleRate * totalDurationSec), sampleRate);
    const offlineMaster = offlineCtx.createGain();
    offlineMaster.gain.setValueAtTime(0.85, 0);
    offlineMaster.connect(offlineCtx.destination);

    // Schedule all notes
    composition.notes.forEach(note => {
      const noteTime = note.startTime * secondsPerBeat;
      const noteDur = Math.max(0.08, note.duration * secondsPerBeat);
      const trackIdx = Math.min(3, Math.max(0, note.track || 0));
      this.synthesizeNote(note.pitch, noteTime, noteDur, note.velocity, trackIdx, offlineCtx, offlineMaster);
    });

    const renderedBuffer = await offlineCtx.startRendering();

    // Convert AudioBuffer to WAV Uint8Array
    const wavBytes = encodeWAV(renderedBuffer);
    const blob = new Blob([wavBytes.buffer as ArrayBuffer], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safeTitle = (composition.title || 'neural_sonata').toLowerCase().replace(/[^a-z0-9]+/g, '_');
    a.href = url;
    a.download = `${safeTitle}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// WAV encoding helper function
function encodeWAV(audioBuffer: AudioBuffer): Uint8Array {
  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;

  const leftChannel = audioBuffer.getChannelData(0);
  const rightChannel = numChannels > 1 ? audioBuffer.getChannelData(1) : leftChannel;
  const numSamples = leftChannel.length;
  const dataSize = numSamples * blockAlign;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  // Write RIFF chunk descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');

  // Write fmt subchunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);

  // Write data subchunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Write interleaved 16-bit PCM samples
  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    // Left
    let sL = Math.max(-1, Math.min(1, leftChannel[i]));
    view.setInt16(offset, sL < 0 ? sL * 0x8000 : sL * 0x7fff, true);
    offset += 2;

    // Right
    if (numChannels > 1) {
      let sR = Math.max(-1, Math.min(1, rightChannel[i]));
      view.setInt16(offset, sR < 0 ? sR * 0x8000 : sR * 0x7fff, true);
      offset += 2;
    }
  }

  return new Uint8Array(buffer);
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

// Global Singleton Instance
export const globalAudioEngine = new AudioEngine();
