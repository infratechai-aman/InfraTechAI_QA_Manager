import React, { useState } from 'react';
import { Plus, Briefcase, FolderOpen, ChevronRight, Trash2, Calendar, FileText } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const ProjectsView = ({ 
  projects, 
  files, 
  tests, 
  onAddProject, 
  activeProjectId, 
  onSelectProject,
  onDeleteProject 
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
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Workspaces & Projects</h1>
          <p className="text-slate-500 mt-1">Manage all testing projects and active QA test suites.</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-200"
        >
          <Plus size={16} /> New Project
        </button>
      </div>

      {/* Add Project Form */}
      {isAdding && (
        <form onSubmit={handleAdd} className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 flex flex-col gap-4 max-w-lg animate-fadeIn">
          <h2 className="text-base font-bold text-slate-900">Create New Project</h2>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Project Name <span className="text-rose-500">*</span>
            </label>
            <input
              autoFocus
              type="text"
              placeholder="e.g. Mobile Banking App v2.0"
              value={newProject.name}
              onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
              className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Description (Optional)</label>
            <textarea
              placeholder="Scope, objectives, or release milestone details..."
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none"
              rows={2}
            />
          </div>
          <div className="flex justify-end gap-2.5 mt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-slate-600 text-sm font-semibold hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newProject.name.trim()}
              className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-sm"
            >
              Create Project
            </button>
          </div>
        </form>
      )}

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.length === 0 && !isAdding ? (
          <div className="col-span-full py-16 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl bg-white">
            <Briefcase size={48} className="mx-auto mb-4 opacity-20" />
            <h3 className="text-base font-bold text-slate-700">No projects found</h3>
            <p className="text-sm mt-1">Create your first QA workspace to begin testing.</p>
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
                className={`group cursor-pointer p-6 rounded-2xl border transition-all duration-200 flex flex-col justify-between min-h-[170px] ${
                  isActive
                    ? 'bg-indigo-50/60 border-indigo-300 shadow-sm ring-2 ring-indigo-500/20'
                    : 'bg-white border-slate-200 hover:border-indigo-200 hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className={`p-2.5 rounded-xl ${isActive ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors'}`}>
                      <FolderOpen size={20} />
                    </div>
                    <div className="flex items-center gap-2">
                      {isActive && (
                        <span className="text-[10px] font-extrabold uppercase tracking-wider bg-indigo-100 text-indigo-700 py-1 px-2.5 rounded-full border border-indigo-200">
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
                          className="p-1.5 text-slate-300 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100"
                          title="Delete Project"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">
                    {proj.name}
                  </h3>
                  {proj.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                      {proj.description}
                    </p>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                  <div className="flex items-center gap-3">
                    <span>{projectFileCount} {projectFileCount === 1 ? 'Suite' : 'Suites'}</span>
                    <span>•</span>
                    <span>{projectTestCount} Tests</span>
                  </div>
                  <ChevronRight
                    size={16}
                    className={`${isActive ? 'text-indigo-600' : 'text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1'} transition-transform`}
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
