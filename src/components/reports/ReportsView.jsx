import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import mermaid from 'mermaid';
import {
  Plus, FileText, Trash2, Edit3, Save, X,
  Eye, Code2, Calendar, ChevronRight, BookOpen,
  ArrowLeft, Copy, Check
} from 'lucide-react';
import { formatDate, generateId, getTimestamp } from '../../utils/formatters';

// Initialize mermaid once
mermaid.initialize({
  startOnLoad: false,
  theme: 'neutral',
  themeVariables: {
    primaryColor: '#6366f1',
    primaryTextColor: '#1e293b',
    primaryBorderColor: '#e2e8f0',
    lineColor: '#94a3b8',
    secondaryColor: '#f8fafc',
    tertiaryColor: '#f1f5f9',
    background: '#ffffff',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: '14px',
  },
  er: { diagramPadding: 20 },
  flowchart: { curve: 'basis' },
});

// Mermaid block renderer
const MermaidBlock = ({ code }) => {
  const ref = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!ref.current || !code) return;
    const id = `mermaid-${Math.random().toString(36).slice(2)}`;
    mermaid.render(id, code.trim())
      .then(({ svg }) => {
        if (ref.current) ref.current.innerHTML = svg;
        setError(null);
      })
      .catch((err) => {
        setError(err.message || 'Diagram error');
        if (ref.current) ref.current.innerHTML = '';
      });
  }, [code]);

  return (
    <div>
      <div ref={ref} className="flex justify-center py-4" />
      {error && (
        <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-3 font-mono">
          ⚠ Mermaid error: {error}
        </div>
      )}
    </div>
  );
};

// Markdown renderer with mermaid + GFM tables
const MarkdownPreview = ({ content }) => {
  if (!content?.trim()) {
    return (
      <div className="text-slate-400 italic text-sm text-center py-12">
        Nothing to preview yet. Start writing on the left.
      </div>
    );
  }

  return (
    <div className="prose prose-slate max-w-none text-sm leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Tables
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="w-full border-collapse text-xs">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-indigo-50 text-indigo-800">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="border border-slate-200 px-4 py-2 text-left font-bold text-xs uppercase tracking-wider">{children}</th>
          ),
          td: ({ children }) => (
            <td className="border border-slate-200 px-4 py-2 text-slate-700">{children}</td>
          ),
          tr: ({ children }) => (
            <tr className="even:bg-slate-50/60 hover:bg-indigo-50/30 transition-colors">{children}</tr>
          ),
          // Mermaid code blocks
          code: ({ className, children, ...props }) => {
            const lang = (className || '').replace('language-', '');
            const code = String(children).replace(/\n$/, '');
            if (lang === 'mermaid') {
              return <MermaidBlock code={code} />;
            }
            return (
              <code className="bg-slate-100 text-indigo-700 px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="bg-slate-900 text-slate-100 rounded-xl p-4 overflow-x-auto text-xs font-mono my-4">
              {children}
            </pre>
          ),
          // Headings
          h1: ({ children }) => <h1 className="text-2xl font-extrabold text-slate-900 mt-6 mb-3 pb-2 border-b border-slate-200">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xl font-bold text-slate-800 mt-5 mb-2 pb-1.5 border-b border-slate-100">{children}</h2>,
          h3: ({ children }) => <h3 className="text-base font-bold text-slate-700 mt-4 mb-2">{children}</h3>,
          // Blockquote
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-indigo-400 pl-4 my-3 text-slate-600 italic bg-indigo-50/40 py-2 rounded-r-xl">{children}</blockquote>
          ),
          // Lists
          ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-3 text-slate-700">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 my-3 text-slate-700">{children}</ol>,
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          // Paragraphs
          p: ({ children }) => <p className="my-2 text-slate-700 leading-relaxed">{children}</p>,
          // Horizontal rule
          hr: () => <hr className="my-5 border-slate-200" />,
          // Strong / em
          strong: ({ children }) => <strong className="font-bold text-slate-900">{children}</strong>,
          em: ({ children }) => <em className="italic text-slate-600">{children}</em>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

// ─── STARTER TEMPLATE ─────────────────────────────────────────────────────────
const STARTER_TEMPLATE = `# Report Title

> **Project:** Your Project Name  
> **Date:** ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}  
> **Author:** QA Team

---

## Executive Summary

Write your summary here...

## Test Results

| Test Case | Status | Notes |
|-----------|--------|-------|
| TC001 | ✅ Pass | Works as expected |
| TC002 | ❌ Fail | See Bug BUG-1234 |
| TC003 | ⚠ Blocked | Pending env setup |

## ER Diagram

\`\`\`mermaid
erDiagram
    PROJECT {
        string id
        string name
        string description
    }
    TEST_SUITE {
        string id
        string name
        date createdAt
    }
    TEST_CASE {
        string id
        string title
        string status
        string expectedResult
    }
    BUG {
        string id
        string title
        string severity
        string status
    }
    PROJECT ||--o{ TEST_SUITE : "has"
    TEST_SUITE ||--o{ TEST_CASE : "contains"
    TEST_CASE ||--o{ BUG : "logs"
\`\`\`

## Flowchart

\`\`\`mermaid
flowchart TD
    A[Start Test Execution] --> B{Test Pass?}
    B -- Yes --> C[Mark Pass]
    B -- No --> D[Mark Fail]
    D --> E[Log Bug]
    C --> F{More Tests?}
    E --> F
    F -- Yes --> A
    F -- No --> G[Complete Execution]
\`\`\`

## Observations

- Add your observations here
- Bullet points work great

## Conclusion

Write conclusions here.
`;

// ─── MAIN REPORTS VIEW ────────────────────────────────────────────────────────
export const ReportsView = ({ reports, onAddReport, onUpdateReport, onDeleteReport, project }) => {
  const [activeReportId, setActiveReportId] = useState(null);
  const [mode, setMode] = useState('split'); // 'edit' | 'preview' | 'split'
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [copied, setCopied] = useState(false);

  const activeReport = reports.find(r => r.id === activeReportId);

  const handleNewReport = () => {
    const id = `r${generateId()}`;
    const report = {
      id,
      projectId: project?.id,
      title: 'Untitled Report',
      content: STARTER_TEMPLATE,
      createdAt: getTimestamp(),
      updatedAt: getTimestamp(),
    };
    onAddReport(report);
    setActiveReportId(id);
    setEditTitle(report.title);
    setEditContent(report.content);
    setIsDirty(false);
  };

  const handleOpen = (report) => {
    if (isDirty && activeReportId) {
      if (!window.confirm('You have unsaved changes. Discard them?')) return;
    }
    setActiveReportId(report.id);
    setEditTitle(report.title);
    setEditContent(report.content);
    setIsDirty(false);
  };

  const handleSave = () => {
    if (!activeReportId) return;
    onUpdateReport(activeReportId, { title: editTitle, content: editContent });
    setIsDirty(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this report? This cannot be undone.')) {
      onDeleteReport(id);
      if (activeReportId === id) {
        setActiveReportId(null);
        setIsDirty(false);
      }
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // ── Report List ─────────────────────────────────────────────────────────────
  if (!activeReportId) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-6 animate-fadeIn">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Reports</h1>
            <p className="text-slate-500 mt-1">
              Write rich reports with tables, ER diagrams, and flowcharts for <span className="font-semibold text-slate-800">{project?.name}</span>
            </p>
          </div>
          <button
            onClick={handleNewReport}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-200 self-start sm:self-auto"
          >
            <Plus size={16} /> New Report
          </button>
        </div>

        {/* Supported features chips */}
        <div className="flex flex-wrap gap-2">
          {['✅ Rich Markdown', '📊 Tables', '🔷 ER Diagrams', '🔀 Flowcharts', '💡 Blockquotes', '📝 Code blocks'].map(f => (
            <span key={f} className="text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1 rounded-full">{f}</span>
          ))}
        </div>

        <div className="space-y-3">
          {reports.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-2xl bg-white text-slate-400">
              <BookOpen size={48} className="mx-auto mb-4 opacity-20" />
              <p className="font-semibold text-slate-700 text-base">No reports yet</p>
              <p className="text-sm mt-1">Create your first report — supports markdown, tables & diagrams.</p>
              <button
                onClick={handleNewReport}
                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all shadow-sm"
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
                      <Calendar size={11} /> Last updated {formatDate(r.updatedAt || r.createdAt)}
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

  // ── Editor View ──────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full overflow-hidden">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-slate-200 shrink-0 gap-3">
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
          <input
            type="text"
            value={editTitle}
            onChange={e => { setEditTitle(e.target.value); setIsDirty(true); }}
            className="flex-1 min-w-0 text-lg font-extrabold text-slate-900 bg-transparent outline-none border-b-2 border-transparent focus:border-indigo-500 transition-colors py-0.5 truncate"
            placeholder="Report title..."
          />
          {isDirty && (
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full shrink-0">
              Unsaved
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* View mode toggle */}
          <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-1">
            {[
              { id: 'edit', icon: Code2, label: 'Edit' },
              { id: 'split', icon: Edit3, label: 'Split' },
              { id: 'preview', icon: Eye, label: 'Preview' },
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setMode(id)}
                title={label}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mode === id
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Icon size={13} /> {label}
              </button>
            ))}
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 border border-slate-200 rounded-xl transition-all cursor-pointer"
            title="Copy markdown"
          >
            {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>

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

      {/* Editor Area */}
      <div className={`flex-1 overflow-hidden flex ${mode === 'split' ? 'divide-x divide-slate-200' : ''}`}>
        
        {/* Left: Markdown Editor */}
        {(mode === 'edit' || mode === 'split') && (
          <div className={`${mode === 'split' ? 'w-1/2' : 'w-full'} flex flex-col overflow-hidden bg-slate-900`}>
            <div className="px-4 py-2 bg-slate-800 border-b border-slate-700 flex items-center gap-2">
              <Code2 size={12} className="text-slate-400" />
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Markdown Editor</span>
            </div>
            <textarea
              value={editContent}
              onChange={e => { setEditContent(e.target.value); setIsDirty(true); }}
              className="flex-1 w-full bg-slate-900 text-slate-100 font-mono text-xs leading-relaxed p-5 outline-none resize-none placeholder:text-slate-600"
              placeholder={`# Report Title\n\nStart writing your report...\n\n## Supported:\n- **Bold**, *italic*, \`code\`\n- Tables (GFM)\n- Mermaid diagrams (\`\`\`mermaid ... \`\`\`)\n- ER diagrams, flowcharts, sequence diagrams`}
              spellCheck={false}
            />
          </div>
        )}

        {/* Right: Preview */}
        {(mode === 'preview' || mode === 'split') && (
          <div className={`${mode === 'split' ? 'w-1/2' : 'w-full'} overflow-y-auto bg-white`}>
            <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center gap-2 sticky top-0 z-10">
              <Eye size={12} className="text-slate-400" />
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Preview</span>
            </div>
            <div className="p-6 lg:p-8">
              <MarkdownPreview content={editContent} />
            </div>
          </div>
        )}
      </div>

      {/* Bottom status bar */}
      <div className="px-5 py-1.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400 font-mono shrink-0">
        <span>{editContent.length} chars · {editContent.split('\n').length} lines</span>
        <span>Markdown + GFM Tables + Mermaid Diagrams</span>
      </div>
    </div>
  );
};
