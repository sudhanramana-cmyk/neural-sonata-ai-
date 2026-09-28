/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { Footer } from './components/Footer';
import { AudioPlayerBar } from './components/AudioPlayerBar';
import { GenerationModal } from './components/GenerationModal';
import { NeuralVisualizer } from './components/NeuralVisualizer';
import { PianoRoll } from './components/PianoRoll';

import { LandingView } from './views/LandingView';
import { StudioView } from './views/StudioView';
import { DatasetLabView } from './views/DatasetLabView';
import { TrainingLabView } from './views/TrainingLabView';
import { LibraryView } from './views/LibraryView';
import { AudioLabView } from './views/AudioLabView';
import { VariationView } from './views/VariationView';
import { CoComposerView } from './views/CoComposerView';
import { AnalysisView } from './views/AnalysisView';
import { ProjectsView } from './views/ProjectsView';
import { ArchitectureView } from './views/ArchitectureView';

import { 
  INITIAL_COMPOSITIONS, 
  INITIAL_DATASETS, 
  INITIAL_PROJECTS, 
  INITIAL_TRAINING_RUN 
} from './data/mockData';
import { Composition, DatasetItem, ProjectItem } from './types';
import { generateComposition, GenerationParams } from './services/aiComposer';
import { globalAudioEngine } from './services/audioEngine';
import { downloadMidiFile } from './services/midiWriter';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [compositions, setCompositions] = useState<Composition[]>(INITIAL_COMPOSITIONS);
  const [currentComposition, setCurrentComposition] = useState<Composition>(INITIAL_COMPOSITIONS[0]);
  const [datasets, setDatasets] = useState<DatasetItem[]>(INITIAL_DATASETS);
  const [projects, setProjects] = useState<ProjectItem[]>(INITIAL_PROJECTS);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Generation Modal State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [pendingGenParams, setPendingGenParams] = useState<GenerationParams | null>(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Playback control
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      globalAudioEngine.stopPlayback();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      globalAudioEngine.playComposition(currentComposition, 0);
      globalAudioEngine.setOnPlaybackEnded(() => {
        setIsPlaying(false);
      });
    }
  }, [isPlaying, currentComposition]);

  const stopPlayback = useCallback(() => {
    globalAudioEngine.stopPlayback();
    setIsPlaying(false);
  }, []);

  // Keyboard Shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'g' || e.key === 'G') {
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          setActiveTab('studio');
        }
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        showToast('Project & composition state auto-saved.');
      } else if (e.key === 'e' || e.key === 'E') {
        if (!e.ctrlKey && !e.metaKey && currentComposition) {
          e.preventDefault();
          downloadMidiFile(currentComposition);
          showToast(`Exported "${currentComposition.title}.mid"`);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, currentComposition]);

  // Generation trigger
  const handleTriggerGenerate = (params: GenerationParams) => {
    setPendingGenParams(params);
    setIsGenerating(true);
  };

  const handleGenerationCompleted = () => {
    if (pendingGenParams) {
      const newComp = generateComposition(pendingGenParams);
      setCompositions([newComp, ...compositions]);
      setCurrentComposition(newComp);
      setIsGenerating(false);
      setPendingGenParams(null);
      showToast(`Generated "${newComp.title}"!`);

      // Start audition playback
      setIsPlaying(true);
      globalAudioEngine.playComposition(newComp, 0);
    }
  };

  return (
    <div className="min-h-screen bg-[#08090d] text-slate-100 flex flex-col bg-grid-pattern selection:bg-cyan-500/20 selection:text-cyan-200">
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#0d121c] border border-cyan-500/40 text-cyan-200 px-4 py-2.5 rounded-lg shadow-2xl text-xs font-mono flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar Navigation Contract */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenComposer={() => setActiveTab('studio')}
      />

      {/* Main View Router */}
      <main className="flex-1 w-full pt-6">
        {activeTab === 'home' && (
          <LandingView
            featuredComposition={currentComposition}
            isPlaying={isPlaying}
            onTogglePlay={togglePlay}
            onNavigate={setActiveTab}
            onOpenComposer={() => setActiveTab('studio')}
          />
        )}

        {activeTab === 'studio' && (
          <StudioView
            currentComposition={currentComposition}
            isPlaying={isPlaying}
            onTogglePlay={togglePlay}
            onTriggerGenerate={handleTriggerGenerate}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === 'pianoroll' && (
          <div className="max-w-6xl mx-auto px-4 pb-16 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-cyan-400">
                  Interactive Polyphonic DAW Editor
                </span>
                <h1 className="text-3xl font-black font-display text-white uppercase tracking-tight">
                  MIDI Piano Roll
                </h1>
              </div>
              <div className="text-xs font-mono text-slate-400">
                Track: <strong className="text-white">{currentComposition.title}</strong>
              </div>
            </div>

            <PianoRoll
              composition={currentComposition}
              onUpdateComposition={(updated) => {
                setCurrentComposition(updated);
                setCompositions(compositions.map(c => c.id === updated.id ? updated : c));
              }}
              isPlaying={isPlaying}
              onTogglePlay={togglePlay}
            />
          </div>
        )}

        {activeTab === 'datasets' && (
          <DatasetLabView
            datasets={datasets}
            onUpdateDataset={(updated) => {
              setDatasets(datasets.map(d => d.id === updated.id ? updated : d));
              showToast(`Dataset "${updated.title}" updated.`);
            }}
          />
        )}

        {activeTab === 'training' && (
          <TrainingLabView
            initialRun={INITIAL_TRAINING_RUN}
          />
        )}

        {activeTab === 'visualizer' && (
          <div className="max-w-6xl mx-auto px-4 pb-16 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-cyan-400">
                  Real-time Neural Audio Spectrum & Synapse Canvas
                </span>
                <h1 className="text-3xl font-black font-display text-white uppercase tracking-tight">
                  Neural Music Visualizer
                </h1>
              </div>
              <button
                onClick={togglePlay}
                className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-black font-semibold text-xs rounded-lg shadow-sm transition-all"
              >
                {isPlaying ? 'Pause Playback' : 'Play Track Visualizer'}
              </button>
            </div>

            <NeuralVisualizer
              composition={currentComposition}
              isPlaying={isPlaying}
            />
          </div>
        )}

        {activeTab === 'library' && (
          <LibraryView
            compositions={compositions}
            activeCompositionId={currentComposition.id}
            isPlaying={isPlaying}
            onSelectComposition={(comp) => {
              setCurrentComposition(comp);
            }}
            onTogglePlay={togglePlay}
            onNavigate={setActiveTab}
            onDeleteComposition={(id) => {
              setCompositions(compositions.filter(c => c.id !== id));
              showToast('Composition deleted.');
            }}
          />
        )}

        {activeTab === 'audiolab' && (
          <AudioLabView
            composition={currentComposition}
            isPlaying={isPlaying}
            onTogglePlay={togglePlay}
          />
        )}

        {activeTab === 'variations' && (
          <VariationView
            baseComposition={currentComposition}
            onSelectMaster={(comp) => {
              setCompositions([comp, ...compositions]);
              setCurrentComposition(comp);
              showToast(`Variation promoted to Master: "${comp.title}"`);
              setActiveTab('studio');
            }}
          />
        )}

        {activeTab === 'cocomposer' && (
          <CoComposerView
            composition={currentComposition}
            onUpdateComposition={(updated) => {
              setCurrentComposition(updated);
              setCompositions(compositions.map(c => c.id === updated.id ? updated : c));
            }}
            isPlaying={isPlaying}
            onTogglePlay={togglePlay}
          />
        )}

        {activeTab === 'analysis' && (
          <AnalysisView
            composition={currentComposition}
          />
        )}

        {activeTab === 'projects' && (
          <ProjectsView
            projects={projects}
            onOpenProject={(p) => {
              showToast(`Loaded project "${p.name}".`);
            }}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === 'architecture' && (
          <ArchitectureView />
        )}
      </main>

      {/* Generation Neural Network Animation Modal */}
      <GenerationModal
        isOpen={isGenerating}
        model={pendingGenParams?.model || 'Transformer Composer'}
        genre={pendingGenParams?.genre || 'Electronic'}
        mood={pendingGenParams?.mood || 'Dark'}
        onComplete={handleGenerationCompleted}
      />

      {/* Global Bottom Audio Transport Bar */}
      <AudioPlayerBar
        composition={currentComposition}
        isPlaying={isPlaying}
        onTogglePlay={togglePlay}
        onStop={stopPlayback}
        onOpenPianoRoll={() => setActiveTab('pianoroll')}
        onOpenAudioLab={() => setActiveTab('audiolab')}
      />

      {/* Footer */}
      <Footer onNavigate={setActiveTab} />

    </div>
  );
}
