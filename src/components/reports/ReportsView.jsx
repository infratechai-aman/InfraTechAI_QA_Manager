import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import mermaid from 'mermaid';
import {
  Plus, FileText, Trash2, Save, X,
  Eye, Edit3, Calendar, ChevronRight, BookOpen,
  ArrowLeft, Copy, Check, Table2, GitBranch,
  Network, BarChart3, AlignLeft, ChevronDown
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import { generateId, getTimestamp } from '../../utils/formatters';

mermaid.initialize({
  startOnLoad: false,
  theme: 'neutral',
  themeVariables: {
    primaryColor: '#6366f1',
    primaryTextColor: '#1e293b',
    primaryBorderColor: '#e2e8f0',
    lineColor: '#94a3b8',
    secondaryColor: '#f8fafc',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: '14px',
  },
});

// Mermaid renderer
const MermaidBlock = ({ code }) => {
  const ref = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!ref.current || !code) return;
    const id = `mermaid-${Math.random().toString(36).slice(2)}`;
    mermaid.render(id, code.trim())
      .then(({ svg }) => { if (ref.current) ref.current.innerHTML = svg; setError(null); })
      .catch(err => { setError(err.message || 'Diagram error'); if (ref.current) ref.current.innerHTML = ''; });
  }, [code]);

  return (
    <div className="my-4 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
      <div ref={ref} className="flex justify-center p-4" />
      {error && <div className="text-xs text-rose-600 bg-rose-50 p-3 font-mono">{error}</div>}
    </div>
  );
};

// Markdown preview renderer
const MarkdownPreview = ({ content }) => {
  if (!content?.trim()) {
    return (
      <div className="text-slate-400 italic text-sm text-center py-20 space-y-2">
        <Edit3 size={32} className="mx-auto opacity-20" />
        <p>Your report will appear here as you write.</p>
      </div>
    );
  }
  return (
    <div className="prose prose-slate max-w-none text-sm leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="w-full border-collapse text-xs">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-indigo-50 text-indigo-800">{children}</thead>,
          th: ({ children }) => <th className="border border-slate-200 px-4 py-2.5 text-left font-bold text-xs uppercase tracking-wider">{children}</th>,
          td: ({ children }) => <td className="border border-slate-200 px-4 py-2.5 text-slate-700">{children}</td>,
          tr: ({ children }) => <tr className="even:bg-slate-50/60 hover:bg-indigo-50/20 transition-colors">{children}</tr>,
          code: ({ className, children }) => {
            const lang = (className || '').replace('language-', '');
            const code = String(children).replace(/\n$/, '');
            if (lang === 'mermaid') return <MermaidBlock code={code} />;
            return <code className="bg-slate-100 text-indigo-700 px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>;
          },
          pre: ({ children }) => <pre className="bg-slate-900 text-slate-100 rounded-xl p-4 overflow-x-auto text-xs font-mono my-4">{children}</pre>,
          h1: ({ children }) => <h1 className="text-2xl font-extrabold text-slate-900 mt-6 mb-3 pb-2 border-b border-slate-200">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xl font-bold text-slate-800 mt-5 mb-2 pb-1.5 border-b border-slate-100">{children}</h2>,
          h3: ({ children }) => <h3 className="text-base font-bold text-slate-700 mt-4 mb-2">{children}</h3>,
          blockquote: ({ children }) => <blockquote className="border-l-4 border-indigo-400 pl-4 my-3 text-slate-600 italic bg-indigo-50/40 py-2 rounded-r-xl">{children}</blockquote>,
          ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-3 text-slate-700">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 my-3 text-slate-700">{children}</ol>,
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          p: ({ children }) => <p className="my-2 text-slate-700 leading-relaxed">{children}</p>,
          hr: () => <hr className="my-5 border-slate-200" />,
          strong: ({ children }) => <strong className="font-bold text-slate-900">{children}</strong>,
          em: ({ children }) => <em className="italic text-slate-600">{children}</em>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

// ─── SNIPPETS TO INSERT ────────────────────────────────────────────────────────
const SNIPPETS = [
  {
    label: 'Table',
    icon: Table2,
    color: 'text-indigo-600 bg-indigo-50 border-indigo-200 hover:bg-indigo-100',
    snippet: `\n| Column 1 | Column 2 | Column 3 |\n|----------|----------|----------|\n| Row 1    | Data     | Data     |\n| Row 2    | Data     | Data     |\n`,
  },
  {
    label: 'ER Diagram',
    icon: Network,
    color: 'text-violet-600 bg-violet-50 border-violet-200 hover:bg-violet-100',
    snippet: `\n\`\`\`mermaid\nerDiagram\n    ENTITY_A {\n        string id\n        string name\n    }\n    ENTITY_B {\n        string id\n        string description\n    }\n    ENTITY_A ||--o{ ENTITY_B : "has"\n\`\`\`\n`,
  },
  {
    label: 'Flowchart',
    icon: GitBranch,
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-100',
    snippet: `\n\`\`\`mermaid\nflowchart TD\n    A[Start] --> B{Decision}\n    B -- Yes --> C[Action A]\n    B -- No --> D[Action B]\n    C --> E[End]\n    D --> E\n\`\`\`\n`,
  },
  {
    label: 'Sequence',
    icon: BarChart3,
    color: 'text-amber-600 bg-amber-50 border-amber-200 hover:bg-amber-100',
    snippet: `\n\`\`\`mermaid\nsequenceDiagram\n    participant User\n    participant System\n    participant DB\n    User->>System: Request\n    System->>DB: Query\n    DB-->>System: Result\n    System-->>User: Response\n\`\`\`\n`,
  },
  {
    label: 'Text Block',
    icon: AlignLeft,
    color: 'text-slate-600 bg-slate-50 border-slate-200 hover:bg-slate-100',
    snippet: `\n## Section Title\n\nWrite your content here...\n\n`,
  },
];

// ─── MAIN REPORTS VIEW ────────────────────────────────────────────────────────
export const ReportsView = ({ reports, onAddReport, onUpdateReport, onDeleteReport, project }) => {
  const [activeReportId, setActiveReportId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [viewMode, setViewMode] = useState('write'); // 'write' | 'preview'
  const [showSnippets, setShowSnippets] = useState(false);
  const textareaRef = useRef(null);
  const snippetBtnRef = useRef(null);

  const activeReport = reports.find(r => r.id === activeReportId);

  // Close snippet menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (snippetBtnRef.current && !snippetBtnRef.current.contains(e.target)) {
        setShowSnippets(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleNewReport = () => {
    const id = `r${generateId()}`;
    const report = {
      id,
      projectId: project?.id,
      title: 'Untitled Report',
      content: '',
      createdAt: getTimestamp(),
      updatedAt: getTimestamp(),
    };
    onAddReport(report);
    setActiveReportId(id);
    setEditTitle(report.title);
    setEditContent('');
    setIsDirty(false);
    setViewMode('write');
  };

  const handleOpen = (report) => {
    if (isDirty) {
      if (!window.confirm('You have unsaved changes. Discard?')) return;
    }
    setActiveReportId(report.id);
    setEditTitle(report.title);
    setEditContent(report.content);
    setIsDirty(false);
    setViewMode('write');
  };

  const handleSave = () => {
    if (!activeReportId) return;
    onUpdateReport(activeReportId, { title: editTitle, content: editContent });
    setIsDirty(false);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this report?')) return;
    onDeleteReport(id);
    if (activeReportId === id) { setActiveReportId(null); setIsDirty(false); }
  };

  // Insert snippet at cursor position in textarea
  const handleInsertSnippet = (snippet) => {
    setShowSnippets(false);
    const textarea = textareaRef.current;
    if (!textarea) {
      setEditContent(prev => prev + snippet);
      setIsDirty(true);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = editContent.substring(0, start);
    const after = editContent.substring(end);
    const newContent = before + snippet + after;
    setEditContent(newContent);
    setIsDirty(true);
    // Restore cursor after snippet
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + snippet.length;
      textarea.selectionEnd = start + snippet.length;
    }, 0);
  };

  // ── Report List ─────────────────────────────────────────────────────────────
  if (!activeReportId) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-6 animate-fadeIn">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Reports</h1>
            <p className="text-slate-500 mt-1">
              Write reports with text, tables, ER diagrams & flowcharts for{' '}
              <span className="font-semibold text-slate-800">{project?.name}</span>
            </p>
          </div>
          <button
            onClick={handleNewReport}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-200 self-start sm:self-auto"
          >
            <Plus size={16} /> New Report
          </button>
        </div>

        <div className="space-y-3">
          {reports.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-2xl bg-white text-slate-400">
              <BookOpen size={48} className="mx-auto mb-4 opacity-20" />
              <p className="font-semibold text-slate-700 text-base">No reports yet</p>
              <p className="text-sm mt-1">Create a report — add text, tables, ER diagrams, and flowcharts.</p>
              <button
                onClick={handleNewReport}
                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700"
              >
                <Plus size={15} /> Create Report
              </button>
            </div>
          ) : (
            reports.map(r => (
              <div
                key={r.id}
                className="group bg-white border border-slate-200 p-5 rounded-2xl hover:shadow-md hover:border-indigo-200 cursor-pointer transition-all flex items-center justify-between"
                onClick={() => handleOpen(r)}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors shrink-0">
                    <FileText size={20} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                      {r.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                      <Calendar size={11} /> {formatDate(r.updatedAt || r.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={e => { e.stopPropagation(); handleDelete(r.id); }}
                    className="p-2 text-slate-300 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={15} />
                  </button>
                  <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // ── Editor / Preview View ────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">

      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-slate-200 shrink-0 gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            onClick={() => {
              if (isDirty && !window.confirm('Discard unsaved changes?')) return;
              setActiveReportId(null);
              setIsDirty(false);
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg transition-all shrink-0"
          >
            <ArrowLeft size={13} /> Reports
          </button>

          {/* Title Input */}
          <input
            type="text"
            value={editTitle}
            onChange={e => { setEditTitle(e.target.value); setIsDirty(true); }}
            className="flex-1 min-w-0 text-lg font-extrabold text-slate-900 bg-transparent outline-none border-b-2 border-transparent focus:border-indigo-500 transition-colors py-0.5"
            placeholder="Report title..."
          />

          {isDirty && (
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full shrink-0">
              Unsaved
            </span>
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 shrink-0">

          {/* Write / Preview Toggle */}
          <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-0.5">
            <button
              onClick={() => setViewMode('write')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${viewMode === 'write' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Edit3 size={12} /> Write
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${viewMode === 'preview' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Eye size={12} /> Preview
            </button>
          </div>

          {/* Insert Snippet Button */}
          {viewMode === 'write' && (
            <div className="relative" ref={snippetBtnRef}>
              <button
                onClick={() => setShowSnippets(s => !s)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <Plus size={13} /> Insert <ChevronDown size={11} className={`transition-transform ${showSnippets ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown */}
              {showSnippets && (
                <div className="absolute right-0 top-full mt-1.5 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-fadeIn">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Insert Element</p>
                  </div>
                  {SNIPPETS.map(({ label, icon: Icon, color, snippet }) => (
                    <button
                      key={label}
                      onClick={() => handleInsertSnippet(snippet)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left cursor-pointer group"
                    >
                      <div className={`p-1.5 rounded-lg border ${color} transition-colors`}>
                        <Icon size={13} />
                      </div>
                      <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">{label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Save */}
          <button
            onClick={handleSave}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isDirty
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            <Save size={13} /> {isDirty ? 'Save' : 'Saved ✓'}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {viewMode === 'write' ? (
          /* Clean white write area */
          <div className="max-w-3xl mx-auto px-8 py-10">
            <textarea
              ref={textareaRef}
              value={editContent}
              onChange={e => { setEditContent(e.target.value); setIsDirty(true); }}
              className="w-full min-h-[70vh] text-slate-800 text-sm leading-8 outline-none resize-none bg-transparent placeholder:text-slate-300 font-sans"
              placeholder={`Start writing your report...\n\nTip: Use the "Insert" button in the top-right to add Tables, ER Diagrams, Flowcharts, and more.`}
              spellCheck
            />
          </div>
        ) : (
          /* Rendered preview */
          <div className="max-w-3xl mx-auto px-8 py-10">
            <MarkdownPreview content={editContent} />
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="px-6 py-1.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400 font-mono shrink-0">
        <span>{editContent.split('\n').length} lines · {editContent.length} chars</span>
        <span>Supports Markdown · GFM Tables · Mermaid Diagrams</span>
      </div>
    </div>
  );
};
