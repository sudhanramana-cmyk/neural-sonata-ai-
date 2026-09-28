import React, { useState } from 'react';
import { 
  FolderKanban, 
  Plus, 
  Sparkles, 
  Trash2, 
  Copy, 
  ExternalLink, 
  Clock, 
  Folder,
  Layers,
  Search
} from 'lucide-react';
import { Genre, ProjectItem } from '../types';
import { ActiveTab } from '../components/Navbar';

interface ProjectsViewProps {
  projects: ProjectItem[];
  onOpenProject: (p: ProjectItem) => void;
  onNavigate: (tab: ActiveTab) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects: initialProjects,
  onOpenProject,
  onNavigate,
}) => {
  const [projects, setProjects] = useState<ProjectItem[]>(initialProjects);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectGenre, setNewProjectGenre] = useState<Genre>('Electronic');

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.genre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    const newP: ProjectItem = {
      id: `proj-${Date.now()}`,
      name: newProjectName.trim(),
      genre: newProjectGenre,
      lastModified: 'Just now',
      tracksCount: 1,
      modelUsed: 'Transformer Composer',
      generationsCount: 1,
    };

    setProjects([newP, ...projects]);
    setIsCreating(false);
    setNewProjectName('');
  };

  const handleDelete = (id: string) => {
    setProjects(projects.filter(p => p.id !== id));
  };

  const handleDuplicate = (p: ProjectItem) => {
    const dup: ProjectItem = {
      ...p,
      id: `proj-${Date.now()}`,
      name: `${p.name} (Copy)`,
      lastModified: 'Just now',
    };
    setProjects([dup, ...projects]);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400">
              Session Manager · Auto-Save Enabled
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-display text-white uppercase tracking-tight">
            Composer Projects
          </h1>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-black font-semibold text-xs rounded-lg shadow-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Create Modal / Form if active */}
      {isCreating && (
        <form
          onSubmit={handleCreate}
          className="p-5 rounded-xl border border-cyan-500/40 bg-[#0d121c] space-y-4 animate-in fade-in"
        >
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <h3 className="text-sm font-bold text-white uppercase font-mono">
              Create New Studio Project
            </h3>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="text-slate-400">Project Title</label>
              <input
                type="text"
                placeholder="e.g. Cyberpunk Film Score Act I"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                autoFocus
                className="w-full bg-[#08090d] border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400">Genre Baseline</label>
              <select
                value={newProjectGenre}
                onChange={(e) => setNewProjectGenre(e.target.value as Genre)}
                className="w-full bg-[#08090d] border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="Electronic">Electronic</option>
                <option value="Classical">Classical</option>
                <option value="Cinematic">Cinematic</option>
                <option value="Lo-fi">Lo-fi</option>
                <option value="Jazz">Jazz</option>
                <option value="Ambient">Ambient</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-black font-semibold text-xs rounded transition-colors"
          >
            Create & Initialize Project
          </button>
        </form>
      )}

      {/* Projects Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((p) => (
          <div
            key={p.id}
            className="p-5 rounded-xl border border-white/10 bg-[#090b11] hover:border-cyan-500/40 transition-all space-y-4 shadow-xl flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                    <Folder className="w-4 h-4 text-cyan-400" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-300">
                    {p.genre}
                  </span>
                </div>

                <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {p.lastModified}
                </span>
              </div>

              <h3 className="text-base font-bold text-white pt-2 group-hover:text-cyan-300 transition-colors truncate">
                {p.name}
              </h3>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-400 pt-3">
                <div className="p-2 rounded bg-white/[0.02]">
                  <span className="text-[9px] text-slate-500 block uppercase">Tracks</span>
                  <strong className="text-white tabular-nums">{p.tracksCount} Stems</strong>
                </div>
                <div className="p-2 rounded bg-white/[0.02]">
                  <span className="text-[9px] text-slate-500 block uppercase">Generations</span>
                  <strong className="text-white tabular-nums">{p.generationsCount} Runs</strong>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs">
              <button
                onClick={() => {
                  onOpenProject(p);
                  onNavigate('studio');
                }}
                className="px-3 py-1.5 rounded-lg bg-cyan-400/20 hover:bg-cyan-400 text-cyan-300 hover:text-black font-semibold text-xs transition-colors flex items-center gap-1.5"
              >
                <span>Open Project</span>
                <ExternalLink className="w-3 h-3" />
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleDuplicate(p)}
                  className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white"
                  title="Duplicate Project"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="p-1.5 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
                  title="Delete Project"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
