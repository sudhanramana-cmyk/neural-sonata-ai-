import { AIModelType, Composition, CompositionDNA, Genre, MidiNote, Mood } from '../types';

// Musical scale intervals from root
const SCALE_INTERVALS: Record<string, number[]> = {
  Major: [0, 2, 4, 5, 7, 9, 11],
  Minor: [0, 2, 3, 5, 7, 8, 10],
  Dorian: [0, 2, 3, 5, 7, 9, 10],
  Lydian: [0, 2, 4, 6, 7, 9, 11],
  Mixolydian: [0, 2, 4, 5, 7, 9, 10],
  PentatonicMinor: [0, 3, 5, 7, 10],
  PentatonicMajor: [0, 2, 4, 7, 9],
  Bhairav: [0, 1, 4, 5, 7, 8, 11], // Indian Classical Raga Bhairav
  Blues: [0, 3, 5, 6, 7, 10],
  WholeTone: [0, 2, 4, 6, 8, 10],
};

const ROOT_PITCH_MAP: Record<string, number> = {
  'C': 60,
  'C#': 61,
  'D': 62,
  'D#': 63,
  'E': 64,
  'F': 65,
  'F#': 66,
  'G': 67,
  'G#': 68,
  'A': 69,
  'A#': 70,
  'B': 71,
};

export interface GenerationParams {
  title?: string;
  genre: Genre;
  mood: Mood;
  bpm: number;
  key: string;
  timeSignature: string;
  model: AIModelType;
  complexity: number; // 0 - 100
  creativity: number; // 0 - 100
  temperature: number; // 0.1 - 2.0
  bars: number;
  humanization: number; // 0 - 100
  variation: number; // 0 - 100
}

/**
 * Determine best scale based on genre and mood
 */
function getScaleForGenreMood(genre: Genre, mood: Mood): number[] {
  if (genre === 'Indian Classical') return SCALE_INTERVALS.Bhairav;
  if (genre === 'Jazz') return Math.random() > 0.5 ? SCALE_INTERVALS.Dorian : SCALE_INTERVALS.Blues;
  if (genre === 'Lo-fi') return SCALE_INTERVALS.Dorian;
  if (genre === 'Ambient') return SCALE_INTERVALS.PentatonicMinor;
  if (genre === 'Experimental') return SCALE_INTERVALS.WholeTone;

  if (mood === 'Dark' || mood === 'Melancholic') return SCALE_INTERVALS.Minor;
  if (mood === 'Epic') return SCALE_INTERVALS.Dorian;
  if (mood === 'Happy' || mood === 'Energetic') return SCALE_INTERVALS.Major;
  if (mood === 'Dreamy' || mood === 'Calm') return SCALE_INTERVALS.PentatonicMajor;

  return SCALE_INTERVALS.Minor;
}

/**
 * Generates an 8-axis Neural DNA profile for a composition
 */
export function calculateNeuralDNA(notes: MidiNote[], genre: Genre, mood: Mood): CompositionDNA {
  if (notes.length === 0) {
    return {
      harmonicComplexity: 50,
      rhythmicSyncopation: 50,
      melodicEntropy: 50,
      dynamicRange: 50,
      tonalCentricity: 50,
      polygonPoints: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
    };
  }

  const pitches = notes.map(n => n.pitch);
  const velocities = notes.map(n => n.velocity);
  const minPitch = Math.min(...pitches);
  const maxPitch = Math.max(...pitches);
  const pitchRange = maxPitch - minPitch;

  const minVel = Math.min(...velocities);
  const maxVel = Math.max(...velocities);
  const dynamicRange = Math.min(100, Math.round(((maxVel - minVel) / 127) * 100 + 20));

  const uniquePitches = new Set(pitches).size;
  const harmonicComplexity = Math.min(100, Math.round((uniquePitches / 24) * 100));

  const syncopatedCount = notes.filter(n => (n.startTime % 1) !== 0).length;
  const rhythmicSyncopation = Math.min(100, Math.round((syncopatedCount / notes.length) * 100));

  const melodicEntropy = Math.min(100, Math.round((pitchRange / 48) * 100 + (uniquePitches * 1.5)));
  const tonalCentricity = Math.max(20, Math.min(95, 100 - melodicEntropy * 0.4));

  // 8 normalized points (0.2 to 0.95) for visual radar / polygon
  const p1 = Math.min(0.95, Math.max(0.25, harmonicComplexity / 100));
  const p2 = Math.min(0.95, Math.max(0.25, rhythmicSyncopation / 100));
  const p3 = Math.min(0.95, Math.max(0.25, melodicEntropy / 100));
  const p4 = Math.min(0.95, Math.max(0.25, dynamicRange / 100));
  const p5 = Math.min(0.95, Math.max(0.25, tonalCentricity / 100));
  const p6 = Math.min(0.95, Math.max(0.25, (p1 + p2) / 2));
  const p7 = Math.min(0.95, Math.max(0.25, (p3 + p4) / 2));
  const p8 = Math.min(0.95, Math.max(0.25, (p5 + p1) / 2));

  return {
    harmonicComplexity,
    rhythmicSyncopation,
    melodicEntropy,
    dynamicRange,
    tonalCentricity,
    polygonPoints: [p1, p2, p3, p4, p5, p6, p7, p8],
  };
}

/**
 * Core Neural Music Sequence Generator
 */
export function generateComposition(params: GenerationParams): Composition {
  const rootName = (params.key || 'C Minor').split(' ')[0] || 'C';
  const baseRoot = ROOT_PITCH_MAP[rootName] || 60;
  const scale = getScaleForGenreMood(params.genre, params.mood);
  const bars = params.bars || 16;
  const beatsPerBar = 4;
  const totalBeats = bars * beatsPerBar;

  const notes: MidiNote[] = [];
  let noteCounter = 0;

  // Chord Progressions (degrees 0 to 6 in scale)
  const progressionPatterns: number[][] = [
    [0, 5, 2, 4], // i - VI - III - VII
    [0, 3, 4, 0], // i - iv - v - i
    [0, 4, 5, 3], // I - V - vi - IV
    [1, 4, 0, 0], // ii - V - I
  ];
  const chosenProgression = progressionPatterns[Math.floor(Math.random() * progressionPatterns.length)];

  // 1. GENERATE HARMONY & CHORDS (Track 1)
  const chordLengthBeats = 4; // 1 chord per bar
  for (let bar = 0; bar < bars; bar++) {
    const progStep = chosenProgression[bar % chosenProgression.length];
    const rootDegree = scale[progStep % scale.length];
    const thirdDegree = scale[(progStep + 2) % scale.length];
    const fifthDegree = scale[(progStep + 4) % scale.length];
    const seventhDegree = scale[(progStep + 6) % scale.length];

    const chordRoot = baseRoot + rootDegree - 12; // Octave 3
    const chordThird = baseRoot + thirdDegree - 12;
    const chordFifth = baseRoot + fifthDegree - 12;
    const chordSeventh = (params.complexity > 50) ? baseRoot + seventhDegree - 12 : null;

    const chordPitches = [chordRoot, chordThird, chordFifth];
    if (chordSeventh) chordPitches.push(chordSeventh);

    chordPitches.forEach(pitch => {
      notes.push({
        id: `chord-${noteCounter++}`,
        pitch,
        startTime: bar * chordLengthBeats,
        duration: chordLengthBeats * 0.95,
        velocity: Math.round(65 + Math.random() * 15),
        track: 1, // Chords
      });
    });

    // 2. GENERATE BASSLINE (Track 2)
    const bassPitch = baseRoot + rootDegree - 24; // Octave 2
    if (params.genre === 'Electronic' || params.genre === 'Rock') {
      // 8th note driving bassline
      for (let beat = 0; beat < 4; beat += 0.5) {
        notes.push({
          id: `bass-${noteCounter++}`,
          pitch: bassPitch,
          startTime: bar * beatsPerBar + beat,
          duration: 0.4,
          velocity: beat % 1 === 0 ? 95 : 80,
          track: 2,
        });
      }
    } else {
      // Half-note or quarter-note bassline
      notes.push({
        id: `bass-${noteCounter++}`,
        pitch: bassPitch,
        startTime: bar * beatsPerBar,
        duration: 2.5,
        velocity: 90,
        track: 2,
      });
      if (bar % 2 === 1) {
        notes.push({
          id: `bass-${noteCounter++}`,
          pitch: bassPitch + 7, // 5th leap
          startTime: bar * beatsPerBar + 2,
          duration: 1.5,
          velocity: 82,
          track: 2,
        });
      }
    }

    // 3. GENERATE DRUMS (Track 3)
    if (params.genre !== 'Ambient' && params.genre !== 'Classical') {
      // Bar drum groove
      // Kick on 0 and 2 (or syncopated)
      notes.push({ id: `drum-${noteCounter++}`, pitch: 36, startTime: bar * 4 + 0, duration: 0.25, velocity: 105, track: 3 });
      notes.push({ id: `drum-${noteCounter++}`, pitch: 36, startTime: bar * 4 + 2, duration: 0.25, velocity: 95, track: 3 });
      if (params.complexity > 60) {
        notes.push({ id: `drum-${noteCounter++}`, pitch: 36, startTime: bar * 4 + 3.5, duration: 0.25, velocity: 88, track: 3 });
      }

      // Snare on 1 and 3
      notes.push({ id: `drum-${noteCounter++}`, pitch: 38, startTime: bar * 4 + 1, duration: 0.2, velocity: 100, track: 3 });
      notes.push({ id: `drum-${noteCounter++}`, pitch: 38, startTime: bar * 4 + 3, duration: 0.2, velocity: 102, track: 3 });

      // Hi-hats on 8th or 16th notes
      for (let beat = 0; beat < 4; beat += 0.5) {
        notes.push({
          id: `drum-${noteCounter++}`,
          pitch: 42,
          startTime: bar * 4 + beat,
          duration: 0.15,
          velocity: beat % 1 === 0 ? 80 : 65,
          track: 3,
        });
      }
    }
  }

  // 4. GENERATE LEAD MELODY (Track 0)
  // Algorithmic Markov / Motif generation with temperature
  let currentBeat = 0;
  let lastPitch = baseRoot + 12; // Start around C5

  const rhythmicMotifs = [
    [1.0, 1.0, 2.0],
    [0.5, 0.5, 1.0, 2.0],
    [1.5, 0.5, 1.0, 1.0],
    [0.75, 0.25, 1.0, 2.0],
    [2.0, 2.0],
  ];

  while (currentBeat < totalBeats) {
    const motif = rhythmicMotifs[Math.floor(Math.random() * rhythmicMotifs.length)];
    for (const duration of motif) {
      if (currentBeat >= totalBeats) break;

      // Rest probability
      if (Math.random() < 0.15) {
        currentBeat += duration;
        continue;
      }

      // Select next pitch from scale
      const stepDelta = Math.round((Math.random() * 4 - 2) * params.temperature);
      const scaleDegreeIndex = Math.floor(Math.random() * scale.length);
      const octaveShift = Math.random() > 0.7 ? 12 : 0;
      let nextPitch = baseRoot + scale[scaleDegreeIndex] + octaveShift;

      // Keep within melodic vocal/lead register (C4 = 60 to G6 = 91)
      if (nextPitch < 60) nextPitch += 12;
      if (nextPitch > 88) nextPitch -= 12;

      // Humanization jitter
      const jitterTime = (params.humanization / 100) * (Math.random() * 0.05 - 0.025);
      const velocityJitter = (params.humanization / 100) * (Math.random() * 20 - 10);
      const baseVel = 90;

      notes.push({
        id: `lead-${noteCounter++}`,
        pitch: nextPitch,
        startTime: Math.max(0, currentBeat + jitterTime),
        duration: Math.max(0.15, duration * 0.9),
        velocity: Math.max(40, Math.min(127, Math.round(baseVel + velocityJitter))),
        track: 0,
      });

      lastPitch = nextPitch;
      currentBeat += duration;
    }
  }

  // Sort notes by startTime
  notes.sort((a, b) => a.startTime - b.startTime);

  const durationSeconds = Math.round((totalBeats * 60) / params.bpm);
  const dna = calculateNeuralDNA(notes, params.genre, params.mood);

  const defaultTitle = params.title || generateTrackTitle(params.genre, params.mood);

  return {
    id: `comp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title: defaultTitle,
    genre: params.genre,
    mood: params.mood,
    bpm: params.bpm,
    key: params.key || 'C Minor',
    timeSignature: params.timeSignature || '4/4',
    model: params.model,
    duration: durationSeconds,
    bars,
    notes,
    createdAt: 'Just now',
    dna,
    mixerConfig: {
      leadVolume: 0.9,
      chordsVolume: 0.75,
      bassVolume: 0.85,
      drumsVolume: 0.8,
      reverbMix: 0.28,
      delayMix: 0.22,
      eqLow: 2,
      eqMid: 0,
      eqHigh: 1.5,
    },
    tags: [params.genre, params.mood, params.model.split(' ')[0], `${params.bpm} BPM`],
  };
}

/**
 * Generate 4 distinct variations for "More Like This"
 */
export function generateVariations(base: Composition, similarity: number = 70): Composition[] {
  const variations: Composition[] = [];

  // Variation A: Harmonic Re-voicing & Extended Chords
  const varANotes = base.notes.map(n => {
    if (n.track === 1) {
      // Add 7th / 9th color
      return { ...n, pitch: n.pitch + (Math.random() > 0.5 ? 4 : 0), velocity: Math.min(127, n.velocity + 5) };
    }
    return { ...n };
  });

  variations.push({
    ...base,
    id: `${base.id}-var-a`,
    title: `${base.title} (Harmonic Re-voice)`,
    notes: varANotes,
    dna: calculateNeuralDNA(varANotes, base.genre, base.mood),
    tags: [...base.tags, 'Var A: Chords'],
  });

  // Variation B: Melodic Inversion & Arpeggio
  const varBNotes = base.notes.map(n => {
    if (n.track === 0) {
      // melodic shift or inversion
      return { ...n, pitch: Math.max(55, Math.min(88, 140 - n.pitch)), duration: Math.max(0.2, n.duration * 0.75) };
    }
    return { ...n };
  });

  variations.push({
    ...base,
    id: `${base.id}-var-b`,
    title: `${base.title} (Inverted Melody)`,
    notes: varBNotes,
    dna: calculateNeuralDNA(varBNotes, base.genre, base.mood),
    tags: [...base.tags, 'Var B: Melody'],
  });

  // Variation C: Syncopated Groove & Tempo Boost
  const varCBpm = Math.min(160, Math.round(base.bpm * 1.1));
  const varCNotes = base.notes.map(n => {
    if (n.track === 3 || n.track === 2) {
      return { ...n, velocity: Math.min(127, n.velocity + 15) };
    }
    return { ...n };
  });

  variations.push({
    ...base,
    id: `${base.id}-var-c`,
    bpm: varCBpm,
    title: `${base.title} (Syncopated Drive)`,
    notes: varCNotes,
    dna: calculateNeuralDNA(varCNotes, base.genre, base.mood),
    tags: [...base.tags, 'Var C: Groove'],
  });

  // Variation D: Ambient Deconstruct & Dreamy Pad
  const varDNotes = base.notes.filter(n => n.track !== 3).map(n => {
    if (n.track === 0) {
      return { ...n, duration: n.duration * 1.6, velocity: Math.max(40, n.velocity - 20) };
    }
    return { ...n, duration: n.duration * 1.4 };
  });

  variations.push({
    ...base,
    id: `${base.id}-var-d`,
    bpm: Math.max(65, Math.round(base.bpm * 0.88)),
    title: `${base.title} (Ambient Deconstruct)`,
    notes: varDNotes,
    dna: calculateNeuralDNA(varDNotes, base.genre, 'Dreamy'),
    tags: [...base.tags, 'Var D: Ambient'],
  });

  return variations;
}

/**
 * AI Assist modifications for DAW Piano Roll
 */
export function applyAiAssist(composition: Composition, command: string): Composition {
  const notes = [...composition.notes];
  let newTitle = composition.title;
  let newBpm = composition.bpm;
  let newGenre = composition.genre;
  let newMood = composition.mood;

  switch (command) {
    case 'continue': {
      // Continue melody by 4 bars
      const maxTime = Math.max(...notes.map(n => n.startTime + n.duration), 0);
      const leadNotes = notes.filter(n => n.track === 0);
      const sample = leadNotes.slice(-6);
      sample.forEach((sn, idx) => {
        notes.push({
          id: `cont-${Date.now()}-${idx}`,
          pitch: sn.pitch + (Math.random() > 0.5 ? 2 : -2),
          startTime: maxTime + (sn.startTime % 4),
          duration: sn.duration,
          velocity: sn.velocity,
          track: 0,
        });
      });
      break;
    }

    case 'harmonize': {
      // Add a third or sixth above melody notes
      const melody = notes.filter(n => n.track === 0);
      melody.forEach((mn, idx) => {
        if (idx % 2 === 0) {
          notes.push({
            id: `harm-${Date.now()}-${idx}`,
            pitch: mn.pitch + 4, // Major/minor third
            startTime: mn.startTime,
            duration: mn.duration,
            velocity: Math.max(40, mn.velocity - 15),
            track: 1,
          });
        }
      });
      break;
    }

    case 'add_bassline': {
      // Generate clean root bass notes
      const chords = notes.filter(n => n.track === 1);
      chords.forEach((cn, idx) => {
        if (idx % 3 === 0) {
          notes.push({
            id: `bassgen-${Date.now()}-${idx}`,
            pitch: Math.max(36, cn.pitch - 24),
            startTime: cn.startTime,
            duration: cn.duration * 0.9,
            velocity: 95,
            track: 2,
          });
        }
      });
      break;
    }

    case 'add_drums': {
      // Add 808 percussion pattern
      const totalBeats = composition.bars * 4;
      for (let b = 0; b < totalBeats; b += 1) {
        if (b % 4 === 0 || b % 4 === 2) {
          notes.push({ id: `drum-${Date.now()}-${b}`, pitch: 36, startTime: b, duration: 0.25, velocity: 100, track: 3 });
        }
        if (b % 4 === 1 || b % 4 === 3) {
          notes.push({ id: `drum-${Date.now()}-${b}-s`, pitch: 38, startTime: b, duration: 0.2, velocity: 95, track: 3 });
        }
        notes.push({ id: `drum-${Date.now()}-${b}-h`, pitch: 42, startTime: b + 0.5, duration: 0.1, velocity: 70, track: 3 });
      }
      break;
    }

    case 'humanize': {
      // Add micro-timing offsets and velocity curves
      notes.forEach(n => {
        n.startTime = Math.max(0, n.startTime + (Math.random() * 0.04 - 0.02));
        n.velocity = Math.min(127, Math.max(30, n.velocity + Math.round(Math.random() * 14 - 7)));
      });
      break;
    }

    case 'make_darker': {
      newMood = 'Dark';
      notes.forEach(n => {
        if (n.track === 0 && Math.random() > 0.4) {
          n.pitch = Math.max(48, n.pitch - 1); // Flatten to minor intervals
        }
      });
      break;
    }

    case 'slow_down': {
      newBpm = Math.max(60, Math.round(composition.bpm * 0.85));
      break;
    }

    case 'speed_up': {
      newBpm = Math.min(180, Math.round(composition.bpm * 1.15));
      break;
    }
  }

  notes.sort((a, b) => a.startTime - b.startTime);

  return {
    ...composition,
    title: newTitle,
    bpm: newBpm,
    genre: newGenre,
    mood: newMood,
    notes,
    dna: calculateNeuralDNA(notes, newGenre, newMood),
  };
}

function generateTrackTitle(genre: Genre, mood: Mood): string {
  const prefixes: Record<Genre, string[]> = {
    Classical: ['Nocturne', 'Prelude', 'Sonata', 'Fantasia', 'Concerto'],
    Cinematic: ['Odyssey', 'Elysium', 'Apex', 'Event Horizon', 'Sublime'],
    'Lo-fi': ['Midnight Coffee', 'Rainy Memories', 'Dusk Echoes', 'Tokyo Sleepless', 'Chill Drift'],
    Electronic: ['Neural Pulse', 'Cyber Nexus', 'Synth Matrix', 'Binary Glow', 'Quantum Drive'],
    Jazz: ['Blue Cadence', 'Modal Twilight', 'Harlem Velvet', 'Autumn Groove', 'Syncopated Soul'],
    Ambient: ['Solar Drift', 'Infinite Void', 'Ethereal Mist', 'Celestial Tide', 'Quiet Echo'],
    Rock: ['Overdrive Spark', 'Neon Thunder', 'Iron Cadence', 'Electric Mirage', 'Fuzz Horizon'],
    'Indian Classical': ['Raga Bhairav AI', 'Midnight Darbari', 'Yaman Reflection', 'Bhairavi Dawn', 'Tala Synthesis'],
    Experimental: ['Stochastic Drift', 'Non-Euclidean Sine', 'Glitch Polymorph', 'Chaos Attractor', 'Quantum Entropy'],
  };

  const list = prefixes[genre] || prefixes.Electronic;
  const word = list[Math.floor(Math.random() * list.length)];
  const suffixes = ['in C# Minor', 'Opus 4', 'Synthesis No. 7', 'Phase II', 'Aethel', 'Resonance'];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];

  return `${word} ${suffix}`;
}
