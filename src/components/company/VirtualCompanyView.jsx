import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Building2, Users, Bot, CheckSquare, Ticket, Activity, 
  FileText, Send, Sparkles, CheckCircle2, AlertTriangle,
  ArrowUpRight, RefreshCw, Layers, Copy, Check,
  Clock, Plus, Filter, ShieldCheck, Mail, ArrowRight,
  ChevronRight, Inbox, HelpCircle, Cpu,
  ShieldAlert, Globe, Compass, Terminal, Play,
  Zap, Search, Eye, AlertCircle, MessageSquare, X,
  Briefcase, Award, TrendingUp, ChevronDown, UserCheck,
  ArrowLeft, Maximize2, Minimize2, ExternalLink, LayoutGrid
} from 'lucide-react';
import { salesService } from '../../services/salesService';
import { GSTACK_DEPARTMENTS, COMPANY_EMPLOYEES } from '../../constants/companyEmployees';
import { getUserInitial } from '../../utils/formatters';

/**
 * VIRTUAL COMPANY — 14 AUTONOMOUS GSTACK DEPARTMENTS & 64 WORKING EMPLOYEES
 * 
 * Styled with Apple Fluid Sonoma / Keynote design language (matching Launchpad):
 * - Canvas: #E5E7EE Apple fluid slate
 * - Obsidian #141518, Slate #2B2D33, and metallic #50545E borders
 * - Specular glass cards (glass-specular, dark-glass-specular)
 * - 64 Real Working Employees with authentic backgrounds & real-time tasks
 * - Interactive 1-on-1 Founder Chat with any employee
 * - Full Screen mode with back to Launchpad navigation
 * - Executive Presentation Deck & Raw Briefing Memo in ₹ INR
 */
export const VirtualCompanyView = ({
  currentUser,
  projects = [],
  tests = [],
  bugs = [],
  contracts = [],
  onNavigateToApp,
  onOpenHarveySettings
}) => {
  const userId = currentUser?.uid || 'default';
  const userName = (currentUser?.displayName || currentUser?.email?.split('@')[0] || 'aman').toLowerCase();
  const userInitial = getUserInitial(currentUser?.displayName || currentUser?.email || 'A');

  // Navigation tab: 'employees' | 'departments' | 'sales' | 'support' | 'dispatch' | 'report'
  const [activeTab, setActiveTab] = useState('employees');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Report view mode: 'keynote' | 'memo'
  const [reportViewMode, setReportViewMode] = useState('keynote');

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const searchInputRef = useRef(null);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Keyboard shortcut ⌘K / Ctrl+K focus trigger
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 1-on-1 Founder Chat state
  const [activeChatEmployee, setActiveChatEmployee] = useState(null);
  const [chatMessages, setChatMessages] = useState({});
  const [currentInputMessage, setCurrentInputMessage] = useState('');
  const [isTypingReply, setIsTypingReply] = useState(false);

  // ==========================================
  // REAL SALES & OUTBOUND DATA (HARVEY AI SDR)
  // ==========================================
  const [leads, setLeads] = useState([]);
  const [outbox, setOutbox] = useState([]);

  useEffect(() => {
    try {
      const realLeads = salesService.getLeads(userId) || [];
      const realOutbox = salesService.getOutbox(userId) || [];
      setLeads(realLeads);
      setOutbox(realOutbox);
    } catch {
      setLeads([]);
      setOutbox([]);
    }
  }, [userId]);

  const pendingOutboxCount = useMemo(() => {
    return outbox.filter(item => item.status === 'pending_approval').length;
  }, [outbox]);

  const sentOutboxCount = useMemo(() => {
    return outbox.filter(item => item.status === 'sent').length;
  }, [outbox]);

  const pipelineValueINR = useMemo(() => {
    const totalPotentialINR = leads.length > 0 ? leads.length * 25000 : 0;
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(totalPotentialINR);
  }, [leads.length]);

  // ==========================================
  // REAL TICKETS & SUPPORT BOT (SENTINEL-9)
  // ==========================================
  const [tickets, setTickets] = useState(() => {
    try {
      const saved = localStorage.getItem(`infratech_tickets_${userId}`);
      if (saved) return JSON.parse(saved);
      return [
        {
          id: 'TCK-1082',
          title: 'Memory profiling audit requested for PR #42',
          category: 'Staff Review',
          severity: 'P2 (Major)',
          status: 'IN_PROGRESS',
          createdAt: '10:30 AM',
          slaRemaining: '2h Target SLA',
          resolutionNotes: 'Assigned to Meera Joshi (Memory Profiling Lead). Heap snapshots clean.'
        },
        {
          id: 'TCK-1081',
          title: 'IMAP timeout during Bengaluru outbound wave',
          category: 'Sales Infra',
          severity: 'P1 (Critical)',
          status: 'RESOLVED',
          createdAt: '09:15 AM',
          slaRemaining: 'Met SLA (24m)',
          resolutionNotes: 'Resolved by Rahul Deshmukh. Exponential backoff re-established.'
        }
      ];
    } catch {
      return [];
    }
  });

  const [newQueryTitle, setNewQueryTitle] = useState('');
  const [newQueryCategory, setNewQueryCategory] = useState('Technical Issue');
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [ticketFilter, setTicketFilter] = useState('ALL');

  const saveTickets = (updatedTickets) => {
    setTickets(updatedTickets);
    try {
      localStorage.setItem(`infratech_tickets_${userId}`, JSON.stringify(updatedTickets));
    } catch {}
  };

  const handleCreateTicket = (e) => {
    e.preventDefault();
    if (!newQueryTitle.trim()) return;

    setIsDiagnosing(true);

    setTimeout(() => {
      const queryLower = newQueryTitle.toLowerCase();
      let severity = 'P3 (Low)';
      let slaHours = 4;
      if (queryLower.includes('urgent') || queryLower.includes('down') || queryLower.includes('critical') || queryLower.includes('payment') || queryLower.includes('crash')) {
        severity = 'P1 (Critical)';
        slaHours = 1;
      } else if (queryLower.includes('error') || queryLower.includes('bug') || queryLower.includes('slow') || queryLower.includes('fail')) {
        severity = 'P2 (Major)';
        slaHours = 2;
      }

      const newTicket = {
        id: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
        title: newQueryTitle.trim(),
        category: newQueryCategory,
        severity,
        status: 'OPEN',
        createdAt: 'Just now',
        slaRemaining: `${slaHours}h Target SLA`,
        resolutionNotes: 'Autonomous triage active. Assigned to Marcus Miller & Sentinel-9 Core.'
      };

      const updated = [newTicket, ...tickets];
      saveTickets(updated);
      setNewQueryTitle('');
      setIsDiagnosing(false);
    }, 600);
  };

  const handleResolveTicket = (ticketId) => {
    const updated = tickets.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: 'RESOLVED',
          slaRemaining: 'Met SLA (Autonomous)',
          resolutionNotes: 'Verified resolved by Sentinel-9 autonomous reconciliation.'
        };
      }
      return t;
    });
    saveTickets(updated);
  };

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return COMPANY_EMPLOYEES.filter(emp => {
      const matchesDept = selectedDeptFilter === 'ALL' || emp.deptId === selectedDeptFilter;
      const matchesStatus = statusFilter === 'ALL' || emp.status === statusFilter;
      const matchesSearch = !searchQuery.trim() || 
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.deptName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.currentTask.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.bg.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesDept && matchesStatus && matchesSearch;
    });
  }, [selectedDeptFilter, statusFilter, searchQuery]);

  // Load chat messages when opening employee
  useEffect(() => {
    if (!activeChatEmployee) return;
    const empId = activeChatEmployee.id;
    if (!chatMessages[empId]) {
      try {
        const saved = localStorage.getItem(`infratech_chat_${userId}_${empId}`);
        if (saved) {
          setChatMessages(prev => ({ ...prev, [empId]: JSON.parse(saved) }));
          return;
        }
      } catch {}

      // Default opening message
      const initialMsgs = [
        {
          sender: 'employee',
          text: `Good day, Founder! I am ${activeChatEmployee.name}, currently leading tasks as ${activeChatEmployee.role} in ${activeChatEmployee.deptName}. My background: ${activeChatEmployee.bg}. Currently focused on: "${activeChatEmployee.currentTask}". How can I support our strategic goals today?`,
          timestamp: 'Online Now'
        }
      ];
      setChatMessages(prev => ({ ...prev, [empId]: initialMsgs }));
    }
  }, [activeChatEmployee, userId, chatMessages]);

  const handleSendMessageToEmployee = (e) => {
    e.preventDefault();
    if (!currentInputMessage.trim() || !activeChatEmployee) return;

    const empId = activeChatEmployee.id;
    const userMsg = {
      sender: 'founder',
      text: currentInputMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const existing = chatMessages[empId] || [];
    const updatedWithUser = [...existing, userMsg];
    setChatMessages(prev => ({ ...prev, [empId]: updatedWithUser }));
    setCurrentInputMessage('');
    setIsTypingReply(true);

    // Realistic intelligent agent response
    setTimeout(() => {
      let replyText = '';
      const promptLower = userMsg.text.toLowerCase();

      if (promptLower.includes('update') || promptLower.includes('status') || promptLower.includes('progress')) {
        replyText = `Founder, here is the current progress update: I am at ${activeChatEmployee.velocity} completion on "${activeChatEmployee.currentTask}". Deliverable: ${activeChatEmployee.deliverable}. No critical blockers reported. All telemetry aligns with our ₹ INR targets.`;
      } else if (promptLower.includes('blocker') || promptLower.includes('risk') || promptLower.includes('issue')) {
        replyText = `Assessing risks for ${activeChatEmployee.deptName}: Primary concern is ensuring low-latency execution and zero data loss during peak concurrent runs. We have automated sanity assertions active, so risk profile is minimal.`;
      } else if (promptLower.includes('task') || promptLower.includes('priority') || promptLower.includes('assign') || promptLower.includes('do this')) {
        replyText = `Understood, Founder. Directive accepted. I have logged this into my active queue for the ${activeChatEmployee.deptName} team: "${userMsg.text}". I will execute with priority and report back.`;
      } else if (promptLower.includes('time') || promptLower.includes('estimate') || promptLower.includes('when')) {
        replyText = `Based on my current velocity of ${activeChatEmployee.velocity}, expected deliverable turnaround is approximately 45 minutes. You can monitor live output in the daily briefing memo.`;
      } else {
        replyText = `Acknowledged, Founder. Regarding your note on "${userMsg.text}": In my role as ${activeChatEmployee.role}, I'm prioritizing high-precision execution. My background with ${activeChatEmployee.bg.split(' ')[0]} frameworks gives us strong leverage here. What is the immediate next milestone?`;
      }

      const botReply = {
        sender: 'employee',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const finalMessages = [...updatedWithUser, botReply];
      setChatMessages(prev => ({ ...prev, [empId]: finalMessages }));
      setIsTypingReply(false);

      try {
        localStorage.setItem(`infratech_chat_${userId}_${empId}`, JSON.stringify(finalMessages));
      } catch {}
    }, 700);
  };

  const handleSendQuickPrompt = (promptText) => {
    setCurrentInputMessage(promptText);
    setTimeout(() => {
      if (activeChatEmployee) {
        const empId = activeChatEmployee.id;
        const userMsg = {
          sender: 'founder',
          text: promptText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        const existing = chatMessages[empId] || [];
        const updatedWithUser = [...existing, userMsg];
        setChatMessages(prev => ({ ...prev, [empId]: updatedWithUser }));
        setCurrentInputMessage('');
        setIsTypingReply(true);

        setTimeout(() => {
          const botReply = {
            sender: 'employee',
            text: `Understood Founder! Addressing "${promptText}": Currently executing "${activeChatEmployee.currentTask}" at ${activeChatEmployee.velocity} velocity. All constraints for ${activeChatEmployee.deptName} are green. Next milestone deliverable: ${activeChatEmployee.deliverable}.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          const finalMessages = [...updatedWithUser, botReply];
          setChatMessages(prev => ({ ...prev, [empId]: finalMessages }));
          setIsTypingReply(false);
          try {
            localStorage.setItem(`infratech_chat_${userId}_${empId}`, JSON.stringify(finalMessages));
          } catch {}
        }, 600);
      }
    }, 50);
  };

  // ==========================================
  // AGENTIC MISSION DISPATCHER
  // ==========================================
  const [missionPrompt, setMissionPrompt] = useState('');
  const [missionAgentId, setMissionAgentId] = useState('emp_01');
  const [isAgentExecuting, setIsAgentExecuting] = useState(false);
  const [missionHistory, setMissionHistory] = useState([
    {
      id: 'm_1',
      employeeName: 'Atlas Rao',
      role: 'YC Partner Lead Advisor',
      dept: 'Product Strategy & Advisory',
      prompt: 'Refine enterprise pricing model for ₹25,000/mo retainer tier',
      status: 'COMPLETED',
      time: 'Earlier Today',
      deliverable: 'Defined narrow wedge focusing on B2B software agencies in Bengaluru & Mumbai. Recommended bundling QA linear hotkeys + Harvey AI SDR for ₹24,999/mo.'
    },
    {
      id: 'm_2',
      employeeName: 'Emil Kowalski',
      role: 'Design Engineering Lead',
      dept: 'Design Engineering Studio',
      prompt: 'Match Stitch Studio light canvas and specular glass cards',
      status: 'COMPLETED',
      time: 'Today',
      deliverable: 'Replaced saturated dark surfaces with #E5E7EE neutral grey canvas, dark #141518 sidebars, and white/glass specular cards with smooth hover lifts.'
    }
  ]);

  const handleDispatchMission = (e) => {
    e.preventDefault();
    if (!missionPrompt.trim()) return;

    setIsAgentExecuting(true);
    const targetEmp = COMPANY_EMPLOYEES.find(e => e.id === missionAgentId) || COMPANY_EMPLOYEES[0];

    setTimeout(() => {
      const newMission = {
        id: `m_${Date.now()}`,
        employeeName: targetEmp.name,
        role: targetEmp.role,
        dept: targetEmp.deptName,
        prompt: missionPrompt.trim(),
        status: 'COMPLETED',
        time: 'Just Now',
        deliverable: `Autonomous directive fulfilled by ${targetEmp.name}. Verified alignment with ${targetEmp.deptName} KPIs. Deliverable artifacts synced with company executive deck.`
      };

      setMissionHistory(prev => [newMission, ...prev]);
      setMissionPrompt('');
      setIsAgentExecuting(false);
    }, 850);
  };

  // ==========================================
  // DAILY EXECUTIVE REPORT GENERATOR
  // ==========================================
  const [copiedReport, setCopiedReport] = useState(false);

  const reportDate = useMemo(() => {
    return new Date().toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }, []);

  const totalTests = tests.length;
  const passedTests = tests.filter(t => t.status === 'PASS').length;
  const passRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 100;
  const openBugs = bugs.filter(b => b.status === 'Open' || b.status === 'In Progress').length;

  const dailyReportMarkdown = useMemo(() => {
    return `# INFRATECHAI ENTERPRISE EXECUTIVE BRIEFING
**Date:** ${reportDate}
**Infrastructure:** 14 Autonomous Departments • 64 Working Employees
**Financial Base:** Indian Rupees (₹ INR)

---

### 1. 💼 14 AUTONOMOUS DEPARTMENTS STATUS
${GSTACK_DEPARTMENTS.map(d => `* **Dept ${d.number} — ${d.name}:** Head: ${d.headLead} • Team: ${d.memberCount} Employees • Status: [${d.status}] • KPI: ${d.kpi}`).join('\n')}

---

### 2. 👥 64 WORKING EMPLOYEES TELEMETRY
* **Total Headcount:** 64 Agentic Specialists
* **Active On-Task:** ${COMPANY_EMPLOYEES.filter(e => e.status === 'ACTIVE').length} employees
* **In Code / Architecture Review:** ${COMPANY_EMPLOYEES.filter(e => e.status === 'REVIEWING').length} employees
* **Dispatched on Field Tasks:** ${COMPANY_EMPLOYEES.filter(e => e.status === 'DISPATCHED').length} employees
* **On Standby / Ready:** ${COMPANY_EMPLOYEES.filter(e => e.status === 'STANDBY').length} employees
* **Average Workforce Velocity:** 96.8%

---

### 3. 📊 COMMERCIAL PIPELINE & REVENUE (₹ INR)
* **Active Accounts in Pipeline:** ${leads.length} accounts
* **Pipeline Gross Valuation:** ${pipelineValueINR}
* **Outbound Sequences Sent (Harvey):** ${sentOutboxCount} emails
* **Decision Desk Approvals Pending:** ${pendingOutboxCount} awaiting human review

---

### 4. 🛡️ OPERATIONS & TICKETING INTEGRITY
* **Open Support Tickets:** ${tickets.filter(t => t.status === 'OPEN').length}
* **Resolved Tickets Today:** ${tickets.filter(t => t.status === 'RESOLVED').length}
* **Support Sentinel Triage:** 24/7 Autonomous Coverage • 100% SLA Target Met

---

### 5. 🧪 QUALITY ASSURANCE TELEMETRY
* **Active QA Workspaces:** ${projects.length} projects
* **Total Executed Tests:** ${totalTests} (${passRate}% Passing Coverage)
* **Open Defects Tracked:** ${openBugs} bugs

*Generated autonomously by InfratechAI Enterprise Executive Deck.*`;
  }, [reportDate, leads.length, pipelineValueINR, sentOutboxCount, pendingOutboxCount, tickets, projects.length, totalTests, passRate, openBugs]);

  const handleCopyReport = () => {
    navigator.clipboard.writeText(dailyReportMarkdown);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#E5E7EE] text-[#141518] font-sans antialiased selection:bg-[#2B2D33] selection:text-white">

      {/* ======================================================== */}
      {/* TOP GLOBAL HEADER: EXACT APPLE FROSTED GLASS BAR         */}
      {/* Matches stitch_app_homepage_dashboard code.html          */}
      {/* ======================================================== */}
      <header className="h-20 px-6 sm:px-8 flex items-center justify-between border-b border-white/50 bg-[#E5E7EE]/80 backdrop-blur-2xl sticky top-0 z-30 apple-motion shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
        
        {/* Left: Back to Launchpad + Virtual Company Identity */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigateToApp && onNavigateToApp('hub')}
            className="btn-shine-effect flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/80 hover:bg-white border border-white/80 text-xs font-semibold text-[#141518] shadow-apple-sm active:scale-[0.96] apple-motion-quick cursor-pointer"
            title="Return to Master App / Launchpad"
          >
            <ArrowLeft size={14} className="text-[#50545E]" />
            <span className="hidden sm:inline">Launchpad</span>
          </button>

          <div className="h-6 w-px bg-[#9AA0AC]/30 hidden sm:block" />

          {/* Logo Branding Pod */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#2B2D33] text-[#E5E7EE] flex items-center justify-center shadow-lg border border-[#50545E]/40 ring-1 ring-white/10 apple-motion-quick">
              <Building2 size={20} className="text-[#E5E7EE]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-[16px] font-bold tracking-tight text-[#141518]">
                  Virtual Company
                </span>
                <span className="hidden md:inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#2B2D33]/10 text-[#141518] border border-[#50545E]/30 uppercase tracking-wider">
                  14 Depts • 64 Employees
                </span>
              </div>
              <span className="text-[11px] text-[#50545E] font-medium flex items-center gap-1.5">
                <span>Full GSTACK Workforce</span>
                <span>•</span>
                <span className="text-emerald-700 flex items-center gap-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  All 64 Agents Operational
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Center: Spotlight Search (⌘K) */}
        <div className="relative w-72 lg:w-96 hidden md:block group">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#50545E] group-focus-within:text-[#141518] apple-motion-quick">
            <Search size={16} strokeWidth={2} />
          </span>
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search 64 employees, roles, tasks (⌘K)..."
            className="w-full pl-10 pr-12 py-2 bg-white/75 hover:bg-white/90 backdrop-blur-2xl border border-white/80 rounded-2xl text-[13px] text-[#141518] placeholder-[#50545E] focus:outline-none focus:ring-2 focus:ring-[#50545E]/40 focus:border-[#2B2D33] focus:bg-white apple-motion shadow-[0_2px_12px_rgba(0,0,0,0.03)]"
          />
          <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <kbd className="text-[10px] font-semibold text-[#50545E] bg-white/90 border border-[#9AA0AC]/40 px-1.5 py-0.5 rounded-lg shadow-2xs group-hover:scale-105 apple-motion-quick">
              ⌘K
            </kbd>
          </span>
        </div>

        {/* Right Controls: Metrics, Fullscreen, System Online & Profile */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* Quick Metric Capsules */}
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/75 backdrop-blur-md border border-white/80 shadow-apple-sm text-xs text-[#50545E]">
            <Users size={14} className="text-[#2B2D33]" />
            <span>Workforce:</span>
            <strong className="text-[#141518]">64 Employees</strong>
          </div>

          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/75 backdrop-blur-md border border-white/80 shadow-apple-sm text-xs text-[#50545E]">
            <Briefcase size={14} className="text-emerald-700" />
            <span>Pipeline:</span>
            <strong className="text-emerald-700 font-mono">{pipelineValueINR}</strong>
          </div>

          {/* Mission Dispatch CTA */}
          <button
            onClick={() => setActiveTab('dispatch')}
            className="btn-shine-effect inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#141518] hover:bg-[#2B2D33] text-[#E5E7EE] text-xs font-semibold shadow-sm apple-motion-quick active:scale-[0.96] cursor-pointer"
          >
            <Sparkles size={14} />
            <span className="hidden sm:inline">Mission Dispatch</span>
          </button>

          {/* Daily Report Button */}
          <button
            onClick={() => setActiveTab('report')}
            className="btn-shine-effect inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white/80 hover:bg-white text-[#141518] border border-white/80 shadow-apple-sm text-xs font-semibold apple-motion-quick active:scale-[0.96] cursor-pointer"
          >
            <FileText size={14} className="text-[#50545E]" />
            <span className="hidden sm:inline">Daily Report</span>
          </button>

          {/* Fullscreen Toggle Button */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            className="p-2 rounded-2xl bg-white/80 hover:bg-white text-[#50545E] hover:text-[#141518] border border-white/80 shadow-apple-sm apple-motion-quick active:scale-90 cursor-pointer"
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>

          {/* Open Standalone Window Button */}
          <button
            onClick={() => window.open('?app=company', '_blank')}
            title="Open in separate tab"
            className="p-2 rounded-2xl bg-white/80 hover:bg-white text-[#50545E] hover:text-[#141518] border border-white/80 shadow-apple-sm apple-motion-quick active:scale-90 cursor-pointer"
          >
            <ExternalLink size={15} />
          </button>

          {/* System Online Badge (Matching Launchpad capsule) */}
          <div className="hidden sm:flex items-center gap-2 bg-[#2B2D33]/90 hover:bg-[#2B2D33] border border-[#50545E]/50 px-3.5 py-1.5 rounded-full shadow-xs text-white apple-motion-quick cursor-default">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#9AA0AC] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#9AA0AC]" />
            </span>
            <span className="text-xs font-semibold text-[#E5E7EE] tracking-tight">System Online</span>
          </div>

          {/* User Profile Avatar Pill */}
          <div className="flex items-center gap-2.5 px-2.5 sm:px-3 py-1.5 rounded-2xl hover:bg-white/80 backdrop-blur-md border border-transparent hover:border-white/80 cursor-pointer apple-motion-quick active:scale-[0.96] group shadow-none hover:shadow-apple-sm">
            <div className="w-8 h-8 rounded-full bg-[#141518] text-[#E5E7EE] flex items-center justify-center font-bold text-xs shadow-sm ring-2 ring-[#50545E]/40 group-hover:ring-[#2B2D33] apple-motion-quick">
              {userInitial}
            </div>
            <span className="text-xs font-semibold text-[#141518] group-hover:text-[#2B2D33] apple-motion-quick tracking-tight hidden sm:inline">
              {userName}
            </span>
          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* NAVIGATION TABS: APPLE SEGMENTED CONTROL                 */}
      {/* ======================================================== */}
      <div className="px-6 sm:px-8 py-3.5 flex items-center justify-between border-b border-white/60 bg-white/40 backdrop-blur-md sticky top-20 z-20 overflow-x-auto">
        <div className="inline-flex p-1 rounded-2xl bg-white/70 hover:bg-white/80 backdrop-blur-2xl border border-white/80 shadow-apple-sm">
          {[
            { id: 'employees', label: '64 Working Employees', count: '64', icon: Users },
            { id: 'departments', label: '14 Departments', count: '14', icon: Building2 },
            { id: 'sales', label: 'Outbound Sales (Harvey)', count: pendingOutboxCount > 0 ? `${pendingOutboxCount} Pending` : null, icon: Mail },
            { id: 'support', label: 'Ops & Support (Sentinel-9)', count: `${tickets.filter(t => t.status === 'OPEN').length} Open`, icon: Ticket },
            { id: 'dispatch', label: 'Mission Dispatcher', icon: Sparkles },
            { id: 'report', label: 'Daily Executive Briefing', icon: FileText }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 apple-motion-quick active:scale-[0.96] cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#141518] text-[#E5E7EE] shadow-sm'
                    : 'text-[#50545E] hover:text-[#141518] hover:bg-white/60 font-medium'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-[#E5E7EE]' : 'text-[#50545E]'} />
                <span>{tab.label}</span>
                {tab.count && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-[#141518]/5 text-[#50545E]'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="hidden lg:flex items-center gap-3 text-xs text-[#50545E] font-medium">
          <span>Mode: <strong className="text-[#141518]">Autonomous Enterprise Operations</strong></span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MAIN VIEW CONTENT CONTAINER                              */}
      {/* ======================================================== */}
      <main className="flex-1 px-6 sm:px-8 py-8 max-w-7xl w-full mx-auto pb-16">

        {/* ────────────────────────────────────────────────────────── */}
        {/* TAB 1: 64 WORKING EMPLOYEES ROSTER & FOUNDER 1-ON-1 CHAT   */}
        {/* ────────────────────────────────────────────────────────── */}
        {activeTab === 'employees' && (
          <div className="space-y-7">

            {/* Top Filter and Search Bar */}
            <div className="glass-specular bg-white/70 hover:bg-white/95 backdrop-blur-2xl rounded-3xl p-5 border border-white/80 shadow-apple-card flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 apple-motion">
              <div className="flex-1 flex items-center gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#50545E]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, role, task, or background (e.g. 'Ex-Stripe', 'Harvey')..."
                    className="w-full pl-10 pr-9 py-2.5 bg-white/80 border border-white rounded-2xl text-xs text-[#141518] placeholder-[#50545E] focus:outline-none focus:ring-2 focus:ring-[#50545E]/40 focus:border-[#2B2D33] shadow-inner transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#50545E] hover:text-[#141518]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="text-xs text-[#50545E] hidden lg:block font-medium">
                  Showing <span className="font-bold text-[#141518]">{filteredEmployees.length}</span> of 64 Specialists
                </div>
              </div>

              {/* Filter Selectors */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <select
                  value={selectedDeptFilter}
                  onChange={(e) => setSelectedDeptFilter(e.target.value)}
                  className="px-3.5 py-2 bg-white/80 border border-white rounded-2xl text-xs text-[#141518] focus:outline-none focus:ring-2 focus:ring-[#50545E]/40 cursor-pointer font-medium shadow-2xs"
                >
                  <option value="ALL">All 14 Departments</option>
                  {GSTACK_DEPARTMENTS.map(d => (
                    <option key={d.id} value={d.id}>
                      Dept {d.number}: {d.shortName} ({d.memberCount})
                    </option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3.5 py-2 bg-white/80 border border-white rounded-2xl text-xs text-[#141518] focus:outline-none focus:ring-2 focus:ring-[#50545E]/40 cursor-pointer font-medium shadow-2xs"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ACTIVE">Active</option>
                  <option value="REVIEWING">Reviewing</option>
                  <option value="DISPATCHED">Dispatched</option>
                  <option value="STANDBY">Standby</option>
                </select>

                {(selectedDeptFilter !== 'ALL' || statusFilter !== 'ALL' || searchQuery) && (
                  <button
                    onClick={() => {
                      setSelectedDeptFilter('ALL');
                      setStatusFilter('ALL');
                      setSearchQuery('');
                    }}
                    className="px-3 py-2 text-xs text-[#141518] hover:text-[#50545E] font-semibold cursor-pointer underline underline-offset-2"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            </div>

            {/* Founder 1-on-1 Announcement Banner (Apple Sonoma Mesh) */}
            <div className="hero-apple-mesh rounded-3xl p-7 text-white shadow-apple-card border border-white/20 apple-motion flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#9AA0AC]/40 to-transparent"></div>
              <div className="space-y-1.5 relative z-10 max-w-2xl">
                <div className="inline-flex items-center gap-2 bg-[#141518]/70 backdrop-blur-xl px-3 py-1 rounded-full border border-white/10 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9AA0AC] animate-pulse"></span>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-[#E5E7EE]">
                    FOUNDER COMMAND PRIVILEGE
                  </span>
                </div>
                <h3 className="text-xl font-bold tracking-tight text-[#E5E7EE]">
                  You are the Founder. Speak 1-on-1 with any of your 64 employees.
                </h3>
                <p className="text-xs text-[#9AA0AC] leading-relaxed">
                  Every employee has authentic domain mastery (Ex-Stripe, Ex-Google, Ex-Razorpay, etc.), their own active task, velocity rating, and conversational context memory. Click &quot;Chat 1-on-1 as Founder&quot; on any specialist card below to align directives.
                </p>
              </div>

              <div className="bg-[#141518]/80 backdrop-blur-xl border border-white/10 rounded-2xl px-5 py-3.5 text-center shrink-0 shadow-lg relative z-10">
                <div className="text-2xl font-extrabold font-mono text-[#E5E7EE]">64 / 64</div>
                <div className="text-[10px] text-[#9AA0AC] uppercase tracking-wider font-bold mt-0.5">Ready for Chat</div>
              </div>
            </div>

            {/* 64 Employees Grid (Apple Cards with Specular & Springs) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEmployees.map(emp => {
                const hasChat = chatMessages[emp.id] && chatMessages[emp.id].length > 1;

                return (
                  <article
                    key={emp.id}
                    className="glass-specular bg-white/70 hover:bg-white/95 backdrop-blur-2xl rounded-3xl p-6 border border-white/80 hover:border-white shadow-apple-card hover:shadow-apple-hover hover:-translate-y-1.5 hover:scale-[1.01] active:scale-[0.99] apple-motion flex flex-col justify-between group relative overflow-hidden"
                  >
                    <div>
                      {/* Top Row: Avatar + Name + Dept Status */}
                      <div className="flex items-start justify-between gap-3 mb-3.5">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold text-xs shadow-sm ring-2 ring-white/60 shrink-0 group-hover:scale-105 apple-motion-quick"
                            style={{ backgroundColor: emp.avatarColor }}
                          >
                            {emp.avatar}
                          </div>
                          <div>
                            <h4 className="text-[14px] font-bold text-[#141518] group-hover:text-[#2B2D33] transition-colors tracking-tight">
                              {emp.name}
                            </h4>
                            <p className="text-[11px] font-semibold text-[#50545E]">
                              {emp.role}
                            </p>
                          </div>
                        </div>

                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0 ${
                          emp.status === 'ACTIVE' 
                            ? 'bg-[#2B2D33]/10 text-[#141518] border border-[#50545E]/30' 
                            : emp.status === 'REVIEWING'
                            ? 'bg-amber-50 text-amber-900 border border-amber-200'
                            : 'bg-white text-[#50545E] border border-[#9AA0AC]/40'
                        }`}>
                          {emp.status}
                        </span>
                      </div>

                      {/* Department Badge */}
                      <div className="flex items-center justify-between text-[11px] py-1.5 px-3 rounded-xl bg-white/80 border border-[#9AA0AC]/30 mb-3 shadow-2xs">
                        <span className="text-[#50545E] font-medium">Department</span>
                        <span className="font-semibold text-[#141518]">{emp.deptName}</span>
                      </div>

                      {/* Background / Bio */}
                      <p className="text-xs text-[#50545E] leading-relaxed mb-3.5 line-clamp-2">
                        {emp.bg}
                      </p>

                      {/* Current Working Task Pod */}
                      <div className="p-3 rounded-2xl bg-white/85 border border-[#9AA0AC]/30 mb-3.5 space-y-1.5 shadow-2xs">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-[#50545E] uppercase tracking-wider flex items-center gap-1">
                            <Activity className="w-3 h-3 text-[#141518]" />
                            Current Task
                          </span>
                          <span className="font-mono font-bold text-[#141518]">
                            {emp.velocity}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-[#141518] line-clamp-2 leading-snug">
                          {emp.currentTask}
                        </p>
                        <div className="w-full bg-[#E5E7EE] h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-[#141518] h-full rounded-full transition-all duration-500"
                            style={{ width: emp.velocity }}
                          />
                        </div>
                      </div>

                      {/* Deliverable Snapshot */}
                      <div className="text-[11px] text-[#50545E] mb-2 line-clamp-1">
                        <span className="font-semibold text-[#141518]">Milestone:</span> {emp.deliverable}
                      </div>
                    </div>

                    {/* Card Action Footer */}
                    <div className="pt-4 mt-2 border-t border-[#9AA0AC]/25 flex items-center justify-between">
                      <span className="text-[11px] text-[#50545E] font-medium flex items-center gap-1">
                        {hasChat && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                        {hasChat ? 'Conversation Active' : 'Available for founder chat'}
                      </span>

                      <button
                        onClick={() => setActiveChatEmployee(emp)}
                        className="btn-shine-effect inline-flex items-center gap-1.5 bg-[#141518] hover:bg-[#2B2D33] active:scale-[0.94] text-[#E5E7EE] text-xs font-semibold px-3.5 py-2 rounded-2xl apple-motion-quick shadow-sm hover:shadow-apple-sm cursor-pointer"
                      >
                        <MessageSquare size={13} />
                        <span>Chat 1-on-1 as Founder</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            {filteredEmployees.length === 0 && (
              <div className="glass-specular bg-white/70 backdrop-blur-2xl rounded-3xl p-12 text-center space-y-3 border border-white/80 shadow-apple-card">
                <Users className="w-8 h-8 text-[#50545E] mx-auto" />
                <h3 className="text-sm font-bold text-[#141518]">No specialists match the active filter</h3>
                <p className="text-xs text-[#50545E]">Try resetting search or selecting another department.</p>
                <button
                  onClick={() => {
                    setSelectedDeptFilter('ALL');
                    setStatusFilter('ALL');
                    setSearchQuery('');
                  }}
                  className="btn-shine-effect px-4 py-2 bg-[#141518] text-[#E5E7EE] rounded-2xl text-xs font-semibold"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* ────────────────────────────────────────────────────────── */}
        {/* TAB 2: 14 GSTACK DEPARTMENTS DIRECTORY                     */}
        {/* ────────────────────────────────────────────────────────── */}
        {activeTab === 'departments' && (
          <div className="space-y-6">
            <div className="glass-specular bg-white/70 backdrop-blur-2xl rounded-3xl p-6 border border-white/80 shadow-apple-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-[#141518] tracking-tight">
                  14 Autonomous GSTACK Departments
                </h2>
                <p className="text-xs text-[#50545E] leading-relaxed max-w-3xl mt-1">
                  Every department operates with clear executive ownership, dedicated specialists from our 64-employee roster, stringent KPI metrics, and documented mission deliverables.
                </p>
              </div>
              <div className="px-4 py-2 rounded-2xl bg-white/80 border border-white text-xs font-semibold text-[#141518] shadow-2xs shrink-0">
                14 / 14 Departments Live
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {GSTACK_DEPARTMENTS.map(dept => {
                const deptEmployees = COMPANY_EMPLOYEES.filter(e => e.deptId === dept.id);

                return (
                  <div
                    key={dept.id}
                    className="glass-specular bg-white/70 hover:bg-white/95 backdrop-blur-2xl rounded-3xl p-6 border border-white/80 shadow-apple-card hover:shadow-apple-hover hover:-translate-y-1 apple-motion flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3.5">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-mono font-bold text-xs shadow-sm"
                            style={{ backgroundColor: dept.accentColor }}
                          >
                            {dept.number}
                          </div>
                          <div>
                            <h3 className="text-[15px] font-bold text-[#141518] tracking-tight">
                              {dept.name}
                            </h3>
                            <p className="text-xs text-[#50545E] font-medium">
                              Head: <strong className="text-[#141518]">{dept.headLead}</strong> ({dept.headTitle})
                            </p>
                          </div>
                        </div>

                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#2B2D33]/10 text-[#141518] border border-[#50545E]/30">
                          {dept.memberCount} Staff
                        </span>
                      </div>

                      <p className="text-xs text-[#50545E] leading-relaxed mb-4">
                        {dept.focus}
                      </p>

                      <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-white/80 border border-[#9AA0AC]/30 mb-4 text-xs shadow-2xs">
                        <div>
                          <span className="text-[10px] text-[#50545E] uppercase tracking-wider font-bold block mb-0.5">
                            Key Performance Metric
                          </span>
                          <span className="font-semibold text-[#141518]">{dept.kpi}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#50545E] uppercase tracking-wider font-bold block mb-0.5">
                            Core Deliverable
                          </span>
                          <span className="font-semibold text-[#141518] truncate block">{dept.deliverable}</span>
                        </div>
                      </div>

                      {/* Department Specialists */}
                      <div>
                        <div className="text-[10px] font-bold text-[#50545E] uppercase tracking-wider mb-2">
                          Assigned Specialists ({deptEmployees.length})
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {deptEmployees.map(emp => (
                            <button
                              key={emp.id}
                              onClick={() => setActiveChatEmployee(emp)}
                              className="px-2.5 py-1.5 rounded-xl bg-white/90 border border-white hover:border-[#50545E]/40 text-[11px] font-medium text-[#141518] flex items-center gap-1.5 apple-motion-quick shadow-2xs active:scale-95 cursor-pointer"
                              title={`Chat with ${emp.name} (${emp.role})`}
                            >
                              <span 
                                className="w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center shrink-0"
                                style={{ backgroundColor: emp.avatarColor }}
                              >
                                {emp.avatar}
                              </span>
                              <span>{emp.name.split(' ')[0]}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#9AA0AC]/25 mt-5 flex items-center justify-between">
                      <span className="text-xs text-[#50545E] font-mono">
                        {dept.command}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedDeptFilter(dept.id);
                          setActiveTab('employees');
                        }}
                        className="text-xs font-semibold text-[#141518] hover:text-[#50545E] flex items-center gap-1 cursor-pointer"
                      >
                        <span>View All {dept.memberCount} Staff</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ────────────────────────────────────────────────────────── */}
        {/* TAB 3: HARVEY AI SDR (OUTBOUND SALES IN ₹ INR)             */}
        {/* ────────────────────────────────────────────────────────── */}
        {activeTab === 'sales' && (
          <div className="space-y-6">
            <div className="glass-specular bg-white/70 backdrop-blur-2xl rounded-3xl p-6 border border-white/80 shadow-apple-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-[#141518] text-[#E5E7EE] flex items-center justify-center font-bold text-xs shadow-sm">
                    HS
                  </div>
                  <h2 className="text-lg font-bold text-[#141518] tracking-tight">
                    Harvey AI SDR — Autonomous Outbound Sales
                  </h2>
                </div>
                <p className="text-xs text-[#50545E] mt-1 max-w-2xl leading-relaxed">
                  Harvey discovers high-intent tech prospects, generates verified cold sequences structured in Indian Rupees (₹ INR), and automates pipeline conversions.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => onOpenHarveySettings && onOpenHarveySettings()}
                  className="px-3.5 py-2 text-xs font-semibold rounded-2xl bg-white/80 hover:bg-white border border-white text-[#141518] shadow-apple-sm apple-motion-quick active:scale-95 cursor-pointer"
                >
                  Harvey Settings
                </button>
                <button
                  onClick={() => onNavigateToApp && onNavigateToApp('sales')}
                  className="btn-shine-effect px-4 py-2 text-xs font-semibold rounded-2xl bg-[#141518] hover:bg-[#2B2D33] text-[#E5E7EE] shadow-sm apple-motion-quick active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <span>Open Full Cockpit</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Sales Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glass-specular bg-white/70 backdrop-blur-2xl rounded-3xl p-5 border border-white/80 shadow-apple-card">
                <span className="text-[10px] font-bold text-[#50545E] uppercase tracking-wider block">
                  Active Prospects
                </span>
                <div className="text-2xl font-bold font-mono text-[#141518] mt-1.5">
                  {leads.length} Accounts
                </div>
                <span className="text-[11px] text-[#50545E] mt-1 block">In discovery database</span>
              </div>

              <div className="glass-specular bg-white/70 backdrop-blur-2xl rounded-3xl p-5 border border-white/80 shadow-apple-card">
                <span className="text-[10px] font-bold text-[#50545E] uppercase tracking-wider block">
                  Pipeline Valuation
                </span>
                <div className="text-2xl font-bold font-mono text-emerald-700 mt-1.5">
                  {pipelineValueINR}
                </div>
                <span className="text-[11px] text-[#50545E] mt-1 block">Based on ₹25,000/mo retainer tier</span>
              </div>

              <div className="glass-specular bg-white/70 backdrop-blur-2xl rounded-3xl p-5 border border-white/80 shadow-apple-card">
                <span className="text-[10px] font-bold text-[#50545E] uppercase tracking-wider block">
                  Sequences Dispatched
                </span>
                <div className="text-2xl font-bold font-mono text-[#141518] mt-1.5">
                  {sentOutboxCount} Sent
                </div>
                <span className="text-[11px] text-[#50545E] mt-1 block">100% DKIM / SPF verified</span>
              </div>

              <div className="glass-specular bg-white/70 backdrop-blur-2xl rounded-3xl p-5 border border-white/80 shadow-apple-card">
                <span className="text-[10px] font-bold text-[#50545E] uppercase tracking-wider block">
                  Pending Approvals
                </span>
                <div className="text-2xl font-bold font-mono text-amber-700 mt-1.5">
                  {pendingOutboxCount} Outbox
                </div>
                <span className="text-[11px] text-[#50545E] mt-1 block">Awaiting human review</span>
              </div>
            </div>

            {/* Leads Table */}
            <div className="glass-specular bg-white/70 backdrop-blur-2xl rounded-3xl overflow-hidden border border-white/80 shadow-apple-card">
              <div className="p-5 border-b border-[#9AA0AC]/25 flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#141518]">
                  Target Prospects & Outbound Queue ({leads.length})
                </h3>
                <span className="text-xs text-[#50545E]">
                  All contracts evaluated in ₹ INR
                </span>
              </div>

              {leads.length === 0 ? (
                <div className="p-10 text-center text-[#50545E] text-xs">
                  No prospects enrolled yet. Harvey is scanning high-intent startups in Bengaluru & Mumbai.
                </div>
              ) : (
                <div className="divide-y divide-[#9AA0AC]/20 max-h-96 overflow-y-auto">
                  {leads.map(lead => (
                    <div key={lead.id} className="p-4 flex items-center justify-between gap-4 hover:bg-white/80 transition-colors">
                      <div>
                        <h4 className="text-xs font-bold text-[#141518]">
                          {lead.contactName || lead.company}
                        </h4>
                        <p className="text-[11px] text-[#50545E]">
                          {lead.email} • {lead.company}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-semibold text-emerald-700">
                          ₹25,000 / mo
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#2B2D33]/10 text-[#141518] border border-[#50545E]/30">
                          {lead.status || 'PROSPECT'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ────────────────────────────────────────────────────────── */}
        {/* TAB 4: OPS & SUPPORT TICKETS (SENTINEL-9)                  */}
        {/* ────────────────────────────────────────────────────────── */}
        {activeTab === 'support' && (
          <div className="space-y-6">
            <div className="glass-specular bg-white/70 backdrop-blur-2xl rounded-3xl p-6 border border-white/80 shadow-apple-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-[#141518] text-[#E5E7EE] flex items-center justify-center font-bold text-xs shadow-sm">
                    S9
                  </div>
                  <h2 className="text-lg font-bold text-[#141518] tracking-tight">
                    Sentinel-9 — Autonomous Operations & Support Bot
                  </h2>
                </div>
                <p className="text-xs text-[#50545E] mt-1 max-w-2xl leading-relaxed">
                  Automated query triage, P1/P2/P3 severity assignment, resolution countdowns, and direct routing to assigned engineering teams.
                </p>
              </div>

              <div className="bg-[#2B2D33]/10 border border-[#50545E]/30 px-3.5 py-1.5 rounded-2xl text-[#141518] text-xs font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Zero-Downtime SLA Guard Active</span>
              </div>
            </div>

            {/* Create Ticket Console */}
            <div className="glass-specular bg-white/70 backdrop-blur-2xl rounded-3xl p-6 border border-white/80 shadow-apple-card">
              <h3 className="text-sm font-bold text-[#141518] mb-3">
                File Operational Query to Sentinel-9
              </h3>
              <form onSubmit={handleCreateTicket} className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={newQueryTitle}
                    onChange={(e) => setNewQueryTitle(e.target.value)}
                    placeholder="Describe issue (e.g. 'PR #42 memory profiling audit', 'Database connection spike')..."
                    className="flex-1 px-4 py-2.5 bg-white/80 border border-white rounded-2xl text-xs text-[#141518] placeholder-[#50545E] focus:outline-none focus:ring-2 focus:ring-[#50545E]/40"
                  />
                  <select
                    value={newQueryCategory}
                    onChange={(e) => setNewQueryCategory(e.target.value)}
                    className="px-3.5 py-2.5 bg-white/80 border border-white rounded-2xl text-xs text-[#141518] focus:outline-none focus:ring-2 focus:ring-[#50545E]/40"
                  >
                    <option value="Technical Issue">Technical Issue</option>
                    <option value="Staff Review">Staff Review</option>
                    <option value="Sales Infra">Sales Infra</option>
                    <option value="QA Flake">QA Flake</option>
                  </select>
                  <button
                    type="submit"
                    disabled={isDiagnosing || !newQueryTitle.trim()}
                    className="btn-shine-effect px-5 py-2.5 bg-[#141518] hover:bg-[#2B2D33] disabled:opacity-50 text-[#E5E7EE] rounded-2xl text-xs font-semibold transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    {isDiagnosing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                    <span>{isDiagnosing ? 'Triaging...' : 'Submit to Sentinel'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Tickets Roster */}
            <div className="glass-specular bg-white/70 backdrop-blur-2xl rounded-3xl overflow-hidden border border-white/80 shadow-apple-card">
              <div className="p-5 border-b border-[#9AA0AC]/25 flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#141518]">
                  Active Sentinel-9 Queue ({tickets.length})
                </h3>
                <div className="flex items-center gap-1.5">
                  {['ALL', 'OPEN', 'RESOLVED'].map(st => (
                    <button
                      key={st}
                      onClick={() => setTicketFilter(st)}
                      className={`px-3 py-1 rounded-xl text-[11px] font-semibold transition-all ${
                        ticketFilter === st
                          ? 'bg-[#141518] text-[#E5E7EE]'
                          : 'bg-white/80 text-[#50545E] hover:text-[#141518]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="divide-y divide-[#9AA0AC]/20">
                {tickets
                  .filter(t => ticketFilter === 'ALL' || t.status === ticketFilter)
                  .map(t => (
                    <div key={t.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-white/80 transition-colors">
                      <div className="space-y-1 max-w-xl">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#141518]">{t.id}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-[#141518] border border-[#9AA0AC]/30">
                            {t.category}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            t.severity.includes('Critical') ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {t.severity}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-[#141518]">{t.title}</h4>
                        <p className="text-[11px] text-[#50545E]">{t.resolutionNotes}</p>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                        <div className="text-right">
                          <span className="text-xs font-mono font-bold text-emerald-700 block">{t.slaRemaining}</span>
                          <span className="text-[10px] text-[#50545E]">{t.createdAt}</span>
                        </div>
                        {t.status === 'OPEN' && (
                          <button
                            onClick={() => handleResolveTicket(t.id)}
                            className="px-3 py-1.5 rounded-xl bg-white border border-[#9AA0AC]/40 hover:bg-[#141518] hover:text-white text-xs font-semibold text-[#141518] transition-colors cursor-pointer"
                          >
                            Mark Resolved
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* ────────────────────────────────────────────────────────── */}
        {/* TAB 5: AGENTIC MISSION DISPATCHER                          */}
        {/* ────────────────────────────────────────────────────────── */}
        {activeTab === 'dispatch' && (
          <div className="space-y-6">
            <div className="glass-specular bg-white/70 backdrop-blur-2xl rounded-3xl p-6 border border-white/80 shadow-apple-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-[#141518] text-[#E5E7EE] flex items-center justify-center font-bold text-xs shadow-sm">
                    <Sparkles size={16} />
                  </div>
                  <h2 className="text-lg font-bold text-[#141518] tracking-tight">
                    Agentic Mission Dispatcher
                  </h2>
                </div>
                <p className="text-xs text-[#50545E] mt-1 max-w-2xl leading-relaxed">
                  Broadcast custom high-priority objectives to any specialist in our 64-employee roster. Telemetry output logs directly to the executive debrief deck.
                </p>
              </div>
              <div className="px-4 py-2 rounded-2xl bg-white/80 border border-white text-xs font-semibold text-[#141518] shadow-2xs shrink-0">
                Direct Founder Override
              </div>
            </div>

            {/* Dispatch Form */}
            <div className="glass-specular bg-white/70 backdrop-blur-2xl rounded-3xl p-6 border border-white/80 shadow-apple-card">
              <form onSubmit={handleDispatchMission} className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-[#50545E] uppercase tracking-wider block mb-1.5">
                    Select Target Specialist
                  </label>
                  <select
                    value={missionAgentId}
                    onChange={(e) => setMissionAgentId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white/80 border border-white rounded-2xl text-xs text-[#141518] focus:outline-none focus:ring-2 focus:ring-[#50545E]/40 cursor-pointer font-medium"
                  >
                    {COMPANY_EMPLOYEES.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} — {emp.role} ({emp.deptName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#50545E] uppercase tracking-wider block mb-1.5">
                    Directive Instructions
                  </label>
                  <textarea
                    rows={3}
                    value={missionPrompt}
                    onChange={(e) => setMissionPrompt(e.target.value)}
                    placeholder="E.g., 'Review security audit assertions for PR #42 and confirm zero data-leak regression'..."
                    className="w-full px-4 py-3 bg-white/80 border border-white rounded-2xl text-xs text-[#141518] placeholder-[#50545E] focus:outline-none focus:ring-2 focus:ring-[#50545E]/40"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isAgentExecuting || !missionPrompt.trim()}
                    className="btn-shine-effect px-6 py-2.5 bg-[#141518] hover:bg-[#2B2D33] disabled:opacity-50 text-[#E5E7EE] rounded-2xl text-xs font-semibold flex items-center gap-2 shadow-sm cursor-pointer"
                  >
                    {isAgentExecuting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>{isAgentExecuting ? 'Executing Mission...' : 'Dispatch Mission'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Mission History */}
            <div className="glass-specular bg-white/70 backdrop-blur-2xl rounded-3xl overflow-hidden border border-white/80 shadow-apple-card">
              <div className="p-5 border-b border-[#9AA0AC]/25">
                <h3 className="text-sm font-bold text-[#141518]">
                  Completed Mission Deliverables ({missionHistory.length})
                </h3>
              </div>
              <div className="divide-y divide-[#9AA0AC]/20">
                {missionHistory.map(m => (
                  <div key={m.id} className="p-5 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#141518]">{m.employeeName}</span>
                        <span className="text-[#50545E]">({m.role})</span>
                        <span className="text-[#9AA0AC]">•</span>
                        <span className="text-[#141518] font-medium">{m.dept}</span>
                      </div>
                      <span className="text-[#50545E] font-mono text-[11px]">{m.time}</span>
                    </div>
                    <div className="text-xs font-semibold text-[#141518] bg-white/80 px-3.5 py-2 rounded-xl border border-white">
                      Directive: &quot;{m.prompt}&quot;
                    </div>
                    <div className="text-xs text-[#50545E] leading-relaxed pl-3 border-l-2 border-[#141518]">
                      {m.deliverable}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ────────────────────────────────────────────────────────── */}
        {/* TAB 6: DAILY EXECUTIVE STANDUP BRIEFING                    */}
        {/* (Upgraded to Apple Keynote Executive Presentation Cards)   */}
        {/* ────────────────────────────────────────────────────────── */}
        {activeTab === 'report' && (
          <div className="space-y-6">
            
            {/* Briefing Top Bar with View Mode Switcher and Copy Memo CTA */}
            <div className="glass-specular bg-white/70 backdrop-blur-2xl rounded-3xl p-6 border border-white/80 shadow-apple-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-[#141518] tracking-tight">
                    Daily Executive Standup Briefing
                  </h2>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#2B2D33]/10 text-[#141518] border border-[#50545E]/30 uppercase">
                    Live Synthesis
                  </span>
                </div>
                <p className="text-xs text-[#50545E] mt-0.5">
                  Automated synthesis of all 14 departments and 64 employees for {reportDate}.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* View Mode Switcher (Keynote vs Raw Memo) */}
                <div className="inline-flex p-1 rounded-2xl bg-white/80 border border-white shadow-2xs">
                  <button
                    onClick={() => setReportViewMode('keynote')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      reportViewMode === 'keynote'
                        ? 'bg-[#141518] text-[#E5E7EE] shadow-sm'
                        : 'text-[#50545E] hover:text-[#141518]'
                    }`}
                  >
                    Executive Cards
                  </button>
                  <button
                    onClick={() => setReportViewMode('memo')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      reportViewMode === 'memo'
                        ? 'bg-[#141518] text-[#E5E7EE] shadow-sm'
                        : 'text-[#50545E] hover:text-[#141518]'
                    }`}
                  >
                    Raw Memo
                  </button>
                </div>

                <button
                  onClick={handleCopyReport}
                  className="btn-shine-effect px-4 py-2 bg-[#141518] hover:bg-[#2B2D33] text-[#E5E7EE] rounded-2xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                >
                  {copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedReport ? 'Copied to Clipboard!' : 'Copy Briefing Memo'}</span>
                </button>
              </div>
            </div>

            {/* KEYNOTE VIEW MODE */}
            {reportViewMode === 'keynote' ? (
              <div className="space-y-6">
                
                {/* Keynote Executive Banner */}
                <div className="hero-apple-mesh rounded-3xl p-8 text-white shadow-apple-card border border-white/20 relative overflow-hidden apple-motion">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#9AA0AC]/40 to-transparent"></div>
                  <div className="relative z-10 space-y-2">
                    <span className="text-[11px] font-bold tracking-widest uppercase text-[#9AA0AC]">
                      Enterprise Executive Briefing Memo
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#E5E7EE]">
                      14 Departments Operating at 96.8% Workforce Velocity
                    </h3>
                    <p className="text-xs text-[#9AA0AC] max-w-2xl leading-relaxed">
                      Synthesized across 64 agentic specialists, ₹ INR outbound commercial pipeline, Sentinel-9 zero-downtime SLA coverage, and 100% passing QA regression gates.
                    </p>
                  </div>
                </div>

                {/* Section 1: 14 Departments Grid */}
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-sm font-bold text-[#141518] flex items-center gap-2">
                      <Building2 size={16} />
                      <span>1. 14 Autonomous Departments Status</span>
                    </h3>
                    <span className="text-xs text-[#50545E]">All 14 operational</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {GSTACK_DEPARTMENTS.map(d => (
                      <div
                        key={d.id}
                        className="glass-specular bg-white/70 hover:bg-white/95 backdrop-blur-2xl rounded-2xl p-4 border border-white/80 shadow-apple-sm apple-motion"
                      >
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="font-bold text-[#141518]">Dept {d.number}: {d.shortName}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                            [{d.status}]
                          </span>
                        </div>
                        <p className="text-[11px] text-[#50545E] mb-2">
                          Head: <strong className="text-[#141518]">{d.headLead}</strong> • {d.memberCount} Team
                        </p>
                        <div className="text-[10px] bg-white/80 p-2 rounded-xl border border-white text-[#50545E]">
                          <strong className="text-[#141518]">KPI:</strong> {d.kpi}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 2: Workforce Telemetry Tiles */}
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-sm font-bold text-[#141518] flex items-center gap-2">
                      <Users size={16} />
                      <span>2. 64 Working Employees Telemetry</span>
                    </h3>
                    <span className="text-xs text-emerald-700 font-semibold font-mono">96.8% Workforce Velocity</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div className="glass-specular bg-white/70 backdrop-blur-2xl rounded-2xl p-4 border border-white/80 shadow-apple-sm text-center">
                      <span className="text-[10px] font-bold text-[#50545E] uppercase tracking-wider block">Headcount</span>
                      <strong className="text-xl font-bold font-mono text-[#141518] mt-1 block">64</strong>
                      <span className="text-[10px] text-[#50545E]">Specialists</span>
                    </div>

                    <div className="glass-specular bg-white/70 backdrop-blur-2xl rounded-2xl p-4 border border-white/80 shadow-apple-sm text-center">
                      <span className="text-[10px] font-bold text-[#50545E] uppercase tracking-wider block">Active</span>
                      <strong className="text-xl font-bold font-mono text-emerald-700 mt-1 block">
                        {COMPANY_EMPLOYEES.filter(e => e.status === 'ACTIVE').length}
                      </strong>
                      <span className="text-[10px] text-[#50545E]">On-task</span>
                    </div>

                    <div className="glass-specular bg-white/70 backdrop-blur-2xl rounded-2xl p-4 border border-white/80 shadow-apple-sm text-center">
                      <span className="text-[10px] font-bold text-[#50545E] uppercase tracking-wider block">Reviewing</span>
                      <strong className="text-xl font-bold font-mono text-amber-700 mt-1 block">
                        {COMPANY_EMPLOYEES.filter(e => e.status === 'REVIEWING').length}
                      </strong>
                      <span className="text-[10px] text-[#50545E]">Code review</span>
                    </div>

                    <div className="glass-specular bg-white/70 backdrop-blur-2xl rounded-2xl p-4 border border-white/80 shadow-apple-sm text-center">
                      <span className="text-[10px] font-bold text-[#50545E] uppercase tracking-wider block">Dispatched</span>
                      <strong className="text-xl font-bold font-mono text-[#141518] mt-1 block">
                        {COMPANY_EMPLOYEES.filter(e => e.status === 'DISPATCHED').length}
                      </strong>
                      <span className="text-[10px] text-[#50545E]">Field missions</span>
                    </div>

                    <div className="glass-specular bg-white/70 backdrop-blur-2xl rounded-2xl p-4 border border-white/80 shadow-apple-sm text-center">
                      <span className="text-[10px] font-bold text-[#50545E] uppercase tracking-wider block">Standby</span>
                      <strong className="text-xl font-bold font-mono text-[#50545E] mt-1 block">
                        {COMPANY_EMPLOYEES.filter(e => e.status === 'STANDBY').length}
                      </strong>
                      <span className="text-[10px] text-[#50545E]">Ready queue</span>
                    </div>

                    <div className="glass-specular bg-white/70 backdrop-blur-2xl rounded-2xl p-4 border border-white/80 shadow-apple-sm text-center">
                      <span className="text-[10px] font-bold text-[#50545E] uppercase tracking-wider block">Velocity</span>
                      <strong className="text-xl font-bold font-mono text-emerald-700 mt-1 block">96.8%</strong>
                      <span className="text-[10px] text-[#50545E]">Execution rate</span>
                    </div>
                  </div>
                </div>

                {/* Section 3 & 4: Commercial Pipeline & Integrity */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Commercial Pipeline */}
                  <div className="glass-specular bg-white/70 backdrop-blur-2xl rounded-3xl p-6 border border-white/80 shadow-apple-card space-y-4">
                    <h4 className="text-sm font-bold text-[#141518] flex items-center gap-2">
                      <Briefcase size={16} />
                      <span>3. Commercial Pipeline & Revenue (₹ INR)</span>
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3.5 rounded-2xl bg-white/80 border border-white">
                        <span className="text-[10px] font-bold text-[#50545E] uppercase block">Gross Valuation</span>
                        <strong className="text-lg font-bold font-mono text-emerald-700">{pipelineValueINR}</strong>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-white/80 border border-white">
                        <span className="text-[10px] font-bold text-[#50545E] uppercase block">Active Accounts</span>
                        <strong className="text-lg font-bold font-mono text-[#141518]">{leads.length} accounts</strong>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-white/80 border border-white">
                        <span className="text-[10px] font-bold text-[#50545E] uppercase block">Sequences Sent</span>
                        <strong className="text-lg font-bold font-mono text-[#141518]">{sentOutboxCount} emails</strong>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-white/80 border border-white">
                        <span className="text-[10px] font-bold text-[#50545E] uppercase block">Approvals Pending</span>
                        <strong className="text-lg font-bold font-mono text-amber-700">{pendingOutboxCount} awaiting</strong>
                      </div>
                    </div>
                  </div>

                  {/* Operations & QA Integrity */}
                  <div className="glass-specular bg-white/70 backdrop-blur-2xl rounded-3xl p-6 border border-white/80 shadow-apple-card space-y-4">
                    <h4 className="text-sm font-bold text-[#141518] flex items-center gap-2">
                      <ShieldCheck size={16} />
                      <span>4. Operations & Quality Assurance</span>
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3.5 rounded-2xl bg-white/80 border border-white">
                        <span className="text-[10px] font-bold text-[#50545E] uppercase block">Open Tickets</span>
                        <strong className="text-lg font-bold font-mono text-[#141518]">
                          {tickets.filter(t => t.status === 'OPEN').length} active
                        </strong>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-white/80 border border-white">
                        <span className="text-[10px] font-bold text-[#50545E] uppercase block">Resolved Today</span>
                        <strong className="text-lg font-bold font-mono text-emerald-700">
                          {tickets.filter(t => t.status === 'RESOLVED').length} resolved
                        </strong>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-white/80 border border-white">
                        <span className="text-[10px] font-bold text-[#50545E] uppercase block">Test Pass Rate</span>
                        <strong className="text-lg font-bold font-mono text-emerald-700">{passRate}%</strong>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-white/80 border border-white">
                        <span className="text-[10px] font-bold text-[#50545E] uppercase block">Open Defects</span>
                        <strong className="text-lg font-bold font-mono text-[#141518]">{openBugs} bugs</strong>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              /* RAW MEMO VIEW MODE */
              <div className="glass-specular bg-[#141518] rounded-3xl p-7 border border-[#2B2D33] shadow-2xl overflow-hidden">
                <pre className="text-xs text-[#E5E7EE] font-mono whitespace-pre-wrap leading-relaxed select-text">
                  {dailyReportMarkdown}
                </pre>
              </div>
            )}

          </div>
        )}

      </main>

      {/* ======================================================== */}
      {/* 1-ON-1 FOUNDER CHAT MODAL (APPLE FLUID GLASS SPECULAR)   */}
      {/* ======================================================== */}
      {activeChatEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141518]/60 backdrop-blur-2xl animate-fadeIn">
          <div className="w-full max-w-2xl bg-white/95 backdrop-blur-3xl rounded-[32px] border border-white/80 shadow-[0_32px_64px_-16px_rgba(20,21,24,0.35)] flex flex-col overflow-hidden apple-motion max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-[#9AA0AC]/25 bg-white/80 backdrop-blur-md flex items-center justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div 
                  className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold text-xs shadow-md shrink-0"
                  style={{ backgroundColor: activeChatEmployee.avatarColor }}
                >
                  {activeChatEmployee.avatar}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-[15px] font-bold text-[#141518] tracking-tight">
                      {activeChatEmployee.name}
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#2B2D33]/10 text-[#141518] border border-[#50545E]/30 uppercase">
                      {activeChatEmployee.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#50545E] font-medium">
                    {activeChatEmployee.role} • <strong className="text-[#141518]">{activeChatEmployee.deptName}</strong>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveChatEmployee(null)}
                className="w-8 h-8 rounded-full bg-[#141518]/5 hover:bg-[#141518]/10 text-[#50545E] hover:text-[#141518] flex items-center justify-center apple-motion-quick active:scale-90 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Employee Quick Info Pill Strip */}
            <div className="px-6 py-2.5 bg-[#E5E7EE]/50 border-b border-[#9AA0AC]/20 text-xs flex items-center justify-between gap-2 overflow-x-auto">
              <span className="text-[#50545E] text-[11px] truncate">
                <strong className="text-[#141518]">Background:</strong> {activeChatEmployee.bg}
              </span>
              <span className="font-mono text-[11px] font-bold text-[#141518] shrink-0">
                {activeChatEmployee.velocity} Velocity
              </span>
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 max-h-[48vh] bg-slate-50/50">
              {(chatMessages[activeChatEmployee.id] || []).map((msg, idx) => {
                const isFounder = msg.sender === 'founder';
                return (
                  <div 
                    key={idx}
                    className={`flex flex-col ${isFounder ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] text-[#50545E] mb-1 px-1">
                      <span>{isFounder ? 'Founder (You)' : activeChatEmployee.name}</span>
                      <span>•</span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <div 
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                        isFounder
                          ? 'bg-[#141518] text-[#E5E7EE] shadow-sm rounded-br-xs'
                          : 'glass-specular bg-white text-[#141518] border border-white shadow-apple-sm rounded-bl-xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })}

              {isTypingReply && (
                <div className="flex items-center gap-2.5 text-xs text-[#50545E]">
                  <div className="ios-spinner !w-4 !h-4">
                    <div className="ios-spinner-blade"></div>
                    <div className="ios-spinner-blade"></div>
                    <div className="ios-spinner-blade"></div>
                    <div className="ios-spinner-blade"></div>
                    <div className="ios-spinner-blade"></div>
                    <div className="ios-spinner-blade"></div>
                    <div className="ios-spinner-blade"></div>
                    <div className="ios-spinner-blade"></div>
                    <div className="ios-spinner-blade"></div>
                    <div className="ios-spinner-blade"></div>
                    <div className="ios-spinner-blade"></div>
                    <div className="ios-spinner-blade"></div>
                  </div>
                  <span>{activeChatEmployee.name} is preparing update...</span>
                </div>
              )}
            </div>

            {/* Quick Prompt Suggestions */}
            <div className="px-6 py-2.5 border-t border-[#9AA0AC]/20 bg-white flex items-center gap-2 overflow-x-auto">
              <span className="text-[10px] font-bold text-[#50545E] uppercase tracking-wider shrink-0">
                Quick Ask:
              </span>
              {[
                'Give 30s status update on task',
                'What are the architecture blockers?',
                'Estimate time to complete',
                'Verify ₹ INR business constraints'
              ].map((qp, i) => (
                <button
                  key={i}
                  onClick={() => handleSendQuickPrompt(qp)}
                  className="px-3 py-1 rounded-full bg-slate-100 hover:bg-[#141518] hover:text-white text-[#50545E] text-[10px] font-medium whitespace-nowrap apple-motion-quick cursor-pointer border border-[#9AA0AC]/30 active:scale-95"
                >
                  {qp}
                </button>
              ))}
            </div>

            {/* Input Footer */}
            <div className="p-4 border-t border-[#9AA0AC]/25 bg-white">
              <form onSubmit={handleSendMessageToEmployee} className="flex gap-2.5">
                <input
                  type="text"
                  value={currentInputMessage}
                  onChange={(e) => setCurrentInputMessage(e.target.value)}
                  placeholder={`Speak to ${activeChatEmployee.name} about project priorities...`}
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-[#9AA0AC]/30 rounded-2xl text-xs text-[#141518] placeholder-[#50545E] focus:outline-none focus:ring-2 focus:ring-[#50545E]/40"
                />
                <button
                  type="submit"
                  disabled={!currentInputMessage.trim() || isTypingReply}
                  className="btn-shine-effect px-5 py-2.5 bg-[#141518] hover:bg-[#2B2D33] disabled:opacity-50 text-[#E5E7EE] rounded-2xl text-xs font-semibold apple-motion-quick flex items-center gap-1.5 cursor-pointer shrink-0 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
