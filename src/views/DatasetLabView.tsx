import React, { useState } from 'react';
import { 
  Database, 
  Upload, 
  FileCode, 
  Search, 
  Filter, 
  CheckCircle2, 
  Cpu, 
  Play, 
  Sparkles,
  BarChart2,
  Sliders,
  Clock,
  Music,
  FolderOpen
} from 'lucide-react';
import { DatasetItem, Genre } from '../types';

interface DatasetLabViewProps {
  datasets: DatasetItem[];
  onUpdateDataset: (updated: DatasetItem) => void;
}

export const DatasetLabView: React.FC<DatasetLabViewProps> = ({ datasets, onUpdateDataset }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [selectedDataset, setSelectedDataset] = useState<DatasetItem>(datasets[0]);
  const [isPreprocessing, setIsPreprocessing] = useState(false);
  const [preprocessProgress, setPreprocessProgress] = useState(0);
  const [preprocessStage, setPreprocessStage] = useState('');
  const [quantizeResolution, setQuantizeResolution] = useState('1/16');
  const [extractChords, setExtractChords] = useState(true);
  const [normalizeVelocity, setNormalizeVelocity] = useState(true);
  const [trainSplit, setTrainSplit] = useState(75);

  const filteredDatasets = datasets.filter((ds) => {
    const matchesSearch = ds.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ds.key.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === 'All' || ds.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  const totalFiles = datasets.reduce((acc, d) => acc + d.fileCount, 0);
  const totalNotes = datasets.reduce((acc, d) => acc + d.noteCount, 0);
  const totalHours = datasets.reduce((acc, d) => acc + d.durationHours, 0);

  const handleStartPreprocessing = () => {
    setIsPreprocessing(true);
    setPreprocessProgress(0);
    setPreprocessStage('Parsing MIDI bytes and tick events...');

    const stages = [
      'Parsing MIDI tracks & tempo maps...',
      `Quantizing note onsets to ${quantizeResolution} grid...`,
      'Normalizing velocities and transposing tonalities...',
      'Extracting polyphonic chord representations...',
      'Generating token dictionary for deep learning...',
      'Splitting into Train / Val / Test partitions...',
      'Preprocessing complete. Token dataset ready for training.',
    ];

    let current = 0;
    const interval = setInterval(() => {
      current += 15;
      const stageIdx = Math.min(stages.length - 1, Math.floor((current / 100) * stages.length));
      setPreprocessStage(stages[stageIdx]);
      setPreprocessProgress(current);

      if (current >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsPreprocessing(false);
          const updated: DatasetItem = {
            ...selectedDataset,
            preprocessed: true,
            tokensCount: selectedDataset.tokensCount + 140000,
            split: { train: trainSplit, val: 15, test: 100 - trainSplit - 15 },
          };
          setSelectedDataset(updated);
          onUpdateDataset(updated);
        }, 600);
      }
    }, 450);
  };

  const handleSimulateUpload = () => {
    const newFile = {
      name: `custom_sequence_${Math.floor(Math.random() * 900) + 100}.mid`,
      sizeKb: Math.round(Math.random() * 40 + 15),
      tracks: 4,
      notes: Math.round(Math.random() * 1200 + 800),
      key: selectedDataset.key,
    };
    const updated = {
      ...selectedDataset,
      fileCount: selectedDataset.fileCount + 1,
      noteCount: selectedDataset.noteCount + newFile.notes,
      files: [newFile, ...selectedDataset.files],
    };
    setSelectedDataset(updated);
    onUpdateDataset(updated);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400">
              Dataset Ingestion & Tokenizer Pipeline
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-display text-white uppercase tracking-tight">
            MIDI Dataset Lab
          </h1>
        </div>

        {/* Upload MIDI Button */}
        <button
          onClick={handleSimulateUpload}
          className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-black font-semibold text-xs rounded-lg shadow-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap"
        >
          <Upload className="w-4 h-4" />
          <span>Upload MIDI File (.mid)</span>
        </button>
      </div>

      {/* Aggregate Statistics Header Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-xl border border-white/10 bg-[#090b11]">
        <div className="space-y-1 border-r border-white/5 pr-4">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Total MIDI Files</span>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">{totalFiles.toLocaleString()}</div>
          <p className="text-[10px] text-slate-500">Across 5 corpus folders</p>
        </div>
        <div className="space-y-1 sm:border-r border-white/5 sm:pr-4">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Total Notes</span>
          <div className="text-2xl font-bold font-mono text-cyan-400 tabular-nums">{(totalNotes / 1000000).toFixed(2)}M</div>
          <p className="text-[10px] text-slate-500">Polyphonic pitch events</p>
        </div>
        <div className="space-y-1 border-r border-white/5 pr-4">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Total Duration</span>
          <div className="text-2xl font-bold font-mono text-violet-400 tabular-nums">{totalHours.toFixed(1)} hrs</div>
          <p className="text-[10px] text-slate-500">Acoustic audio span</p>
        </div>
        <div className="space-y-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Average Tempo</span>
          <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">104 BPM</div>
          <p className="text-[10px] text-slate-500">Normalized time division</p>
        </div>
      </div>

      {/* Search & Genre Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search datasets, keys, or filenames..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0d1017] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto py-1">
          {['All', 'Classical', 'Electronic', 'Lo-fi', 'Cinematic', 'Indian Classical'].map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGenre(g)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                selectedGenre === g
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white bg-white/[0.02]'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Main Dataset Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Dataset Cards */}
        <div className="space-y-3 lg:col-span-1">
          <span className="text-xs font-mono uppercase text-slate-400 tracking-wider">
            Available Datasets ({filteredDatasets.length})
          </span>

          <div className="space-y-2.5">
            {filteredDatasets.map((ds) => {
              const isSelected = selectedDataset.id === ds.id;
              return (
                <div
                  key={ds.id}
                  onClick={() => setSelectedDataset(ds)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-cyan-500/50 bg-[#0e131d] shadow-md shadow-cyan-500/10'
                      : 'border-white/10 bg-[#090b11] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-800/30">
                      {ds.genre}
                    </span>
                    {ds.preprocessed ? (
                      <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Tokenized
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-amber-400">
                        Raw MIDI
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-white mb-2 truncate">
                    {ds.title}
                  </h3>

                  <div className="grid grid-cols-3 gap-2 text-[11px] font-mono text-slate-400 pt-2 border-t border-white/5">
                    <div>
                      <span className="text-[9px] text-slate-500 block uppercase">Files</span>
                      <strong className="text-slate-200">{ds.fileCount}</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block uppercase">Notes</span>
                      <strong className="text-slate-200">{(ds.noteCount / 1000).toFixed(0)}k</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block uppercase">Tempo</span>
                      <strong className="text-slate-200">{ds.avgBpm} BPM</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Columns: Selected Dataset Inspection & Preprocessing Lab */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Selected Dataset Detail Panel */}
          <div className="p-6 rounded-xl border border-white/10 bg-[#090b11] space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
              <div>
                <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                  Corpus Metadata & Preprocessor
                </span>
                <h2 className="text-xl font-bold text-white font-display">
                  {selectedDataset.title}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400">
                  Status:
                </span>
                <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                  selectedDataset.preprocessed 
                    ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/40' 
                    : 'bg-amber-950/40 text-amber-300 border border-amber-800/40'
                }`}>
                  {selectedDataset.preprocessed ? 'Ready for Training' : 'Needs Preprocessing'}
                </span>
              </div>
            </div>

            {/* MIDI Files List inside Dataset */}
            <div className="space-y-2">
              <span className="text-xs font-mono text-slate-400 uppercase">
                Sample MIDI Files ({selectedDataset.files.length})
              </span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {selectedDataset.files.map((file, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs font-mono"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileCode className="w-4 h-4 text-cyan-400" />
                      <span className="text-white">{file.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-slate-400 text-[11px]">
                      <span>{file.tracks} Tracks</span>
                      <span>·</span>
                      <span>{file.notes} Notes</span>
                      <span>·</span>
                      <span>{file.sizeKb} KB</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Preprocessing Pipeline Configuration */}
            <div className="pt-4 border-t border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  Preprocessing Configuration
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                
                {/* Quantization Grid */}
                <div className="space-y-1">
                  <label className="text-slate-400">Quantization Grid</label>
                  <select
                    value={quantizeResolution}
                    onChange={(e) => setQuantizeResolution(e.target.value)}
                    className="w-full bg-[#0d1017] border border-white/10 rounded px-2.5 py-1.5 text-white focus:outline-none"
                  >
                    <option value="1/16">1/16 Note Grid</option>
                    <option value="1/8">1/8 Note Grid</option>
                    <option value="1/4">1/4 Note Grid</option>
                    <option value="Triplet">1/8 Triplet Grid</option>
                  </select>
                </div>

                {/* Train / Val Split Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>Train Split</span>
                    <span className="font-mono text-cyan-400">{trainSplit}%</span>
                  </div>
                  <input
                    type="range"
                    min={60}
                    max={85}
                    value={trainSplit}
                    onChange={(e) => setTrainSplit(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer mt-2"
                  />
                </div>

                {/* Toggles */}
                <div className="space-y-2 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={extractChords}
                      onChange={(e) => setExtractChords(e.target.checked)}
                      className="rounded accent-cyan-400"
                    />
                    <span>Extract Chords</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={normalizeVelocity}
                      onChange={(e) => setNormalizeVelocity(e.target.checked)}
                      className="rounded accent-cyan-400"
                    />
                    <span>Normalize Velocity</span>
                  </label>
                </div>

              </div>

              {/* Progress Bar when running */}
              {isPreprocessing && (
                <div className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-950/20 space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-cyan-300">{preprocessStage}</span>
                    <span className="text-cyan-400 font-bold">{preprocessProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 to-violet-500 rounded-full transition-all duration-300"
                      style={{ width: `${preprocessProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={handleStartPreprocessing}
                disabled={isPreprocessing}
                className="w-full py-3 px-4 rounded-lg bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 text-black font-semibold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Cpu className="w-4 h-4" />
                <span>{isPreprocessing ? 'Processing MIDI Sequences...' : 'Preprocess Dataset & Build Token Vocabulary'}</span>
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
