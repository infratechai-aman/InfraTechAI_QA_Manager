import React, { useState } from 'react';
import { Plus, Briefcase, FolderOpen, ChevronRight, Trash2, Sparkles, Check, Shield } from 'lucide-react';

export const ProjectsView = ({ 
  projects, 
  files, 
  tests, 
  onAddProject, 
  activeProjectId, 
  onSelectProject,
  onDeleteProject,
  pendingInvitations = [],
  onAcceptInvitation,
  onDeclineInvitation
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newProject.name.trim()) return;
    onAddProject(newProject);
    setNewProject({ name: '', description: '' });
    setIsAdding(false);
  };

  return (
    <div className="p-4 sm:p-8 pb-28 sm:pb-8 max-w-6xl mx-auto space-y-6 sm:space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Workspaces &amp; Projects</h1>
          <p className="text-slate-400 mt-1">Manage all testing projects and active QA test suites.</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-900/40 active-spring"
        >
          <Plus size={16} /> New Project
        </button>
      </div>

      {/* Add Project Form */}
      {isAdding && (
        <form onSubmit={handleAdd} className="glass-card border border-white/10 p-6 rounded-2xl flex flex-col gap-4 max-w-lg animate-fadeIn">
          <h2 className="text-base font-bold text-white">Create New Project</h2>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Project Name <span className="text-rose-400">*</span>
            </label>
            <input
              autoFocus
              type="text"
              placeholder="e.g. Mobile Banking App v2.0"
              value={newProject.name}
              onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 outline-none transition-all font-medium"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Description (Optional)</label>
            <textarea
              placeholder="Scope, objectives, or release milestone details..."
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 outline-none transition-all resize-none"
              rows={2}
            />
          </div>
          <div className="flex justify-end gap-2.5 mt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-slate-400 text-sm font-semibold hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newProject.name.trim()}
              className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-500 disabled:opacity-40 transition-all shadow-sm"
            >
              Create Project
            </button>
          </div>
        </form>
      )}

      {/* Pending Workspace Invitations */}
      {pendingInvitations && pendingInvitations.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-900 text-white p-6 rounded-3xl border-2 border-indigo-500/40 shadow-xl space-y-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-300/30 flex items-center justify-center text-amber-300 shrink-0">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                <span>Workspace Invitations Waiting for You</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-400 text-slate-950">
                  {pendingInvitations.length} New
                </span>
              </h2>
              <p className="text-xs text-indigo-200">Accept below to immediately join and collaborate on testing:</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {pendingInvitations.map((inv) => (
              <div key={inv.id} className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 flex flex-col justify-between gap-4 hover:border-indigo-400/50 transition-all">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-black text-white text-lg tracking-tight">{inv.projectName || 'QA Workspace'}</h3>
                    <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-lg bg-indigo-500/40 text-indigo-200 border border-indigo-400/30 flex items-center gap-1">
                      <Shield size={12} />
                      {inv.role || 'QA Tester'}
                    </span>
                  </div>
                  <p className="text-xs text-indigo-200 mt-2">Invited by: <strong className="text-white underline underline-offset-2">{inv.inviterEmail || 'Workspace Owner'}</strong></p>
                </div>
                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
                  {onDeclineInvitation && (
                    <button onClick={() => onDeclineInvitation(inv.id)} className="px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors">Decline</button>
                  )}
                  {onAcceptInvitation && (
                    <button onClick={() => onAcceptInvitation(inv)} className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl text-xs flex items-center gap-1.5 shadow-lg active:scale-95 transition-all">
                      <Check size={16} strokeWidth={2.5} />
                      <span>Accept &amp; Join</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {projects.length === 0 && !isAdding ? (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-white/10 rounded-2xl glass-card">
            <Briefcase size={48} className="mx-auto mb-4 text-slate-600" />
            <h3 className="text-base font-bold text-slate-300">No projects found</h3>
            <p className="text-sm mt-1 text-slate-500">Create your first QA workspace to begin testing.</p>
          </div>
        ) : (
          projects.map((proj) => {
            const projectFileCount = files.filter(f => f.projectId === proj.id).length;
            const projectTestCount = tests.filter(t => t.projectId === proj.id).length;
            const isActive = activeProjectId === proj.id;

            return (
              <div
                key={proj.id}
                onClick={() => onSelectProject(proj.id)}
                className={`group cursor-pointer p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between min-h-[165px] glass-card glass-card-hover ${isActive ? 'border-indigo-500/60 shadow-lg shadow-indigo-900/30 ring-2 ring-indigo-500/20' : 'border-white/[0.08] hover:border-indigo-500/40'}`}
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className={`p-2.5 rounded-xl ${isActive ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 group-hover:bg-indigo-500/20 group-hover:text-indigo-300 transition-colors'}`}>
                      <FolderOpen size={20} />
                    </div>
                    <div className="flex items-center gap-2">
                      {isActive && (
                        <span className="text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 py-1 px-2.5 rounded-full border border-indigo-500/30">Active</span>
                      )}
                      {projects.length > 1 && onDeleteProject && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Delete project "${proj.name}" and all its data?`)) {
                              onDeleteProject(proj.id);
                            }
                          }}
                          className="p-1.5 text-slate-600 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white mb-1 group-hover:text-indigo-300 transition-colors">{proj.name}</h3>
                  {proj.description && <p className="text-xs text-slate-500 line-clamp-2 mt-1">{proj.description}</p>}
                </div>

                <div className="mt-4 pt-3.5 border-t border-white/[0.08] flex items-center justify-between text-xs font-medium">
                  <div className="flex items-center gap-3">
                    <span className={projectFileCount > 0 ? 'text-indigo-400' : 'text-slate-600'}>{projectFileCount} {projectFileCount === 1 ? 'Suite' : 'Suites'}</span>
                    <span className="text-slate-700">•</span>
                    <span className={projectTestCount > 0 ? 'text-slate-300' : 'text-slate-600'}>{projectTestCount} Tests</span>
                  </div>
                  <ChevronRight size={16} className={`${isActive ? 'text-indigo-400' : 'text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1'} transition-transform`} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
