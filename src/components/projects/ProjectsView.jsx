import React, { useState } from 'react';
import { Plus, Briefcase, FolderOpen, ChevronRight, Trash2, FileText, Sparkles, Check, X, Shield } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

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
    <div className="p-5 sm:p-8 max-w-6xl mx-auto space-y-6 animate-fadeIn font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-black/[0.06]">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#1D1D1F] tracking-tight">
            Workspaces & Projects
          </h1>
          <p className="text-[#86868B] mt-0.5 text-xs sm:text-sm">
            Manage test suites, defect lifecycles and team collaboration.
          </p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#007AFF] hover:bg-[#0071E3] text-white rounded-full text-xs font-semibold transition-all shadow-xs apple-press cursor-pointer self-start sm:self-auto"
        >
          <Plus size={14} /> <span>New Project</span>
        </button>
      </div>

      {/* Add Project Form */}
      {isAdding && (
        <form onSubmit={handleAdd} className="bg-white p-5 rounded-[20px] shadow-[0_8px_24px_rgba(0,0,0,0.06)] border border-black/[0.08] flex flex-col gap-3.5 max-w-lg animate-fadeIn">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#1D1D1F]">Create New Project</h2>
            <button 
              type="button" 
              onClick={() => setIsAdding(false)}
              className="w-6 h-6 rounded-full bg-black/[0.05] hover:bg-black/[0.1] text-[#636366] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={13} />
            </button>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-[#8E8E93] uppercase tracking-wider mb-1">
              Project Name <span className="text-[#FF3B30]">*</span>
            </label>
            <input
              autoFocus
              type="text"
              placeholder="e.g. Mobile Banking App v2.0"
              value={newProject.name}
              onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
              className="w-full bg-[#F2F2F7] border border-black/[0.06] rounded-xl p-2.5 text-xs text-[#1D1D1F] focus:bg-white focus:border-[#007AFF] outline-none transition-all font-medium"
              required
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-[#8E8E93] uppercase tracking-wider mb-1">
              Description (Optional)
            </label>
            <textarea
              placeholder="Scope, objectives, or release milestone details..."
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              className="w-full bg-[#F2F2F7] border border-black/[0.06] rounded-xl p-2.5 text-xs text-[#1D1D1F] focus:bg-white focus:border-[#007AFF] outline-none transition-all resize-none"
              rows={2}
            />
          </div>
          <div className="flex justify-end gap-2 mt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3.5 py-1.5 text-[#636366] text-xs font-medium hover:bg-black/[0.04] rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newProject.name.trim()}
              className="px-4 py-1.5 bg-[#007AFF] hover:bg-[#0071E3] disabled:opacity-40 text-white rounded-full text-xs font-semibold transition-all shadow-xs apple-press cursor-pointer"
            >
              Create Workspace
            </button>
          </div>
        </form>
      )}

      {/* Pending Workspace Invitations Card */}
      {pendingInvitations && pendingInvitations.length > 0 && (
        <div className="bg-gradient-to-r from-[#1C1C1E] to-[#2C2C2E] text-white p-5 rounded-[22px] border border-white/15 shadow-md space-y-3.5 animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FF9500]/20 border border-[#FF9500]/30 flex items-center justify-center text-[#FF9500] shrink-0">
              <Sparkles size={16} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
                <span>Workspace Invitations</span>
                <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-[#FF9500] text-black">
                  {pendingInvitations.length} New
                </span>
              </h2>
              <p className="text-[11px] text-white/70">
                Accept below to immediately join and collaborate:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {pendingInvitations.map((inv) => (
              <div 
                key={inv.id} 
                className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-4 flex flex-col justify-between gap-3 shadow-xs"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-white text-sm">
                      {inv.projectName || 'QA Workspace'}
                    </h3>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/10 text-white/90 border border-white/15 flex items-center gap-1">
                      <Shield size={11} />
                      {inv.role || 'QA Tester'}
                    </span>
                  </div>
                  <p className="text-[11px] text-white/70 mt-1">
                    Invited by: <strong className="text-white">{inv.inviterEmail || 'Workspace Owner'}</strong>
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                  {onDeclineInvitation && (
                    <button
                      onClick={() => onDeclineInvitation(inv.id)}
                      className="px-3 py-1 text-xs text-white/70 hover:text-white rounded-md transition-colors cursor-pointer"
                    >
                      Decline
                    </button>
                  )}
                  {onAcceptInvitation && (
                    <button
                      onClick={() => onAcceptInvitation(inv)}
                      className="px-3.5 py-1 bg-[#34C759] hover:bg-[#28A745] text-white font-semibold rounded-full text-xs flex items-center gap-1 shadow-xs apple-press cursor-pointer"
                    >
                      <Check size={13} strokeWidth={2.5} />
                      <span>Accept</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {projects.length === 0 && !isAdding ? (
          <div className="col-span-full py-14 text-center text-[#8E8E93] border border-dashed border-black/[0.1] rounded-[20px] bg-white">
            <Briefcase size={36} className="mx-auto mb-3 opacity-30 text-[#8E8E93]" />
            <h3 className="text-sm font-semibold text-[#1D1D1F]">No projects found</h3>
            <p className="text-xs text-[#86868B] mt-0.5">Create your first QA workspace to begin testing.</p>
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
                className={`group cursor-pointer p-5 rounded-[20px] border transition-all duration-200 flex flex-col justify-between min-h-[160px] apple-press ${
                  isActive
                    ? 'bg-[#007AFF]/[0.03] border-[#007AFF]/50 shadow-[0_2px_10px_rgba(0,122,255,0.1)] ring-1 ring-[#007AFF]/30'
                    : 'bg-white border-black/[0.06] hover:border-black/[0.12] shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)]'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-2.5">
                    <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center ${
                      isActive 
                        ? 'bg-[#007AFF] text-white shadow-xs' 
                        : 'bg-[#F2F2F7] text-[#636366] group-hover:text-[#007AFF] transition-colors'
                    }`}>
                      <FolderOpen size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                    </div>
                    <div className="flex items-center gap-1.5">
                      {isActive && (
                        <span className="text-[10px] font-semibold uppercase tracking-wider bg-[#007AFF]/10 text-[#007AFF] py-0.5 px-2 rounded-full">
                          Active
                        </span>
                      )}
                      {projects.length > 1 && onDeleteProject && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Are you sure you want to delete project "${proj.name}" and all its test cases?`)) {
                              onDeleteProject(proj.id);
                            }
                          }}
                          className="p-1 text-[#AEAEB2] hover:text-[#FF3B30] rounded-md transition-colors opacity-0 group-hover:opacity-100"
                          title="Delete Project"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 className="text-sm font-semibold text-[#1D1D1F] mb-1 group-hover:text-[#007AFF] transition-colors">
                    {proj.name}
                  </h3>
                  {proj.description && (
                    <p className="text-xs text-[#86868B] line-clamp-2 mt-0.5">
                      {proj.description}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-black/[0.05] flex items-center justify-between text-xs text-[#86868B]">
                  <div className="flex items-center gap-2 text-[11px] font-medium">
                    <span>{projectFileCount} {projectFileCount === 1 ? 'Suite' : 'Suites'}</span>
                    <span>•</span>
                    <span>{projectTestCount} Tests</span>
                  </div>
                  <ChevronRight
                    size={14}
                    className={`${isActive ? 'text-[#007AFF]' : 'text-[#C7C7CC] group-hover:text-[#007AFF] group-hover:translate-x-0.5'} transition-transform`}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
