export type Genre = 
  | 'Classical'
  | 'Cinematic'
  | 'Lo-fi'
  | 'Electronic'
  | 'Jazz'
  | 'Ambient'
  | 'Rock'
  | 'Indian Classical'
  | 'Experimental';

export type Mood = 
  | 'Calm'
  | 'Dark'
  | 'Epic'
  | 'Happy'
  | 'Melancholic'
  | 'Dreamy'
  | 'Energetic';

export type AIModelType = 'LSTM Composer' | 'GRU Composer' | 'Transformer Composer' | 'GAN Music Generator';

export interface MidiNote {
  id: string;
  pitch: number; // MIDI pitch number (e.g. 60 = C4)
  startTime: number; // in beats (0.0, 0.5, 1.0...)
  duration: number; // in beats
  velocity: number; // 0 - 127
  track: number; // 0 = Lead/Melody, 1 = Chords, 2 = Bass, 3 = Drums
}

export interface CompositionDNA {
  harmonicComplexity: number; // 0 - 100
  rhythmicSyncopation: number; // 0 - 100
  melodicEntropy: number; // 0 - 100
  dynamicRange: number; // 0 - 100
  tonalCentricity: number; // 0 - 100
  polygonPoints: number[]; // 8 normalized values for visual polygon
}

export interface AudioMixerConfig {
  leadVolume: number;
  chordsVolume: number;
  bassVolume: number;
  drumsVolume: number;
  reverbMix: number;
  delayMix: number;
  eqLow: number;
  eqMid: number;
  eqHigh: number;
}

export interface Composition {
  id: string;
  title: string;
  genre: Genre;
  mood: Mood;
  bpm: number;
  key: string;
  timeSignature: string;
  model: AIModelType;
  duration: number; // in seconds
  bars: number;
  notes: MidiNote[];
  createdAt: string;
  dna: CompositionDNA;
  mixerConfig: AudioMixerConfig;
  tags: string[];
}

export interface DatasetItem {
  id: string;
  title: string;
  genre: Genre;
  fileCount: number;
  noteCount: number;
  avgBpm: number;
  key: string;
  durationHours: number;
  preprocessed: boolean;
  tokensCount: number;
  files: Array<{
    name: string;
    sizeKb: number;
    tracks: number;
    notes: number;
    key: string;
  }>;
  split: {
    train: number;
    val: number;
    test: number;
  };
}

export interface TrainingRun {
  id: string;
  modelType: AIModelType;
  datasetName: string;
  status: 'idle' | 'training' | 'paused' | 'completed';
  currentEpoch: number;
  totalEpochs: number;
  learningRate: number;
  batchSize: number;
  layers: number;
  hiddenUnits: number;
  currentLoss: number;
  valLoss: number;
  accuracy: number;
  logs: string[];
  history: Array<{
    epoch: number;
    loss: number;
    valLoss: number;
    accuracy: number;
  }>;
}

export interface ProjectItem {
  id: string;
  name: string;
  genre: Genre;
  lastModified: string;
  tracksCount: number;
  modelUsed: AIModelType;
  generationsCount: number;
}

export interface AIComposerMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  actionApplied?: string;
}
