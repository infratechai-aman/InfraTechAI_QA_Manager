import { CheckCircle, XCircle, AlertTriangle, Circle, Clock, Check, AlertOctagon } from 'lucide-react';

export const generateId = () => Math.random().toString(36).substring(2, 11);

export const getTimestamp = () => new Date().toISOString();

export const formatDate = (isoString) => {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return '—';
  }
};

export const formatTime = (isoString) => {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
};

export const getStatusConfig = (status) => {
  switch (status) {
    case 'Pass':
      return {
        icon: CheckCircle,
        label: 'Pass',
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        badge: 'bg-emerald-100 text-emerald-800 border-emerald-200'
      };
    case 'Fail':
      return {
        icon: XCircle,
        label: 'Fail',
        color: 'text-rose-600',
        bg: 'bg-rose-50',
        border: 'border-rose-200',
        badge: 'bg-rose-100 text-rose-800 border-rose-200'
      };
    case 'Blocked':
      return {
        icon: AlertTriangle,
        label: 'Blocked',
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        badge: 'bg-amber-100 text-amber-800 border-amber-200'
      };
    case 'Not Run':
    default:
      return {
        icon: Circle,
        label: 'Not Run',
        color: 'text-slate-400',
        bg: 'bg-slate-50',
        border: 'border-slate-200',
        badge: 'bg-slate-100 text-slate-600 border-slate-200'
      };
  }
};

export const getBugStatusConfig = (status) => {
  switch (status) {
    case 'Open':
      return {
        label: 'Open',
        color: 'text-rose-700 bg-rose-50 border-rose-200',
        dot: 'bg-rose-500'
      };
    case 'In Progress':
      return {
        label: 'In Progress',
        color: 'text-amber-700 bg-amber-50 border-amber-200',
        dot: 'bg-amber-500'
      };
    case 'Resolved':
      return {
        label: 'Resolved',
        color: 'text-blue-700 bg-blue-50 border-blue-200',
        dot: 'bg-blue-500'
      };
    case 'Closed':
      return {
        label: 'Closed',
        color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        dot: 'bg-emerald-500'
      };
    default:
      return {
        label: status || 'Unknown',
        color: 'text-slate-600 bg-slate-100 border-slate-200',
        dot: 'bg-slate-400'
      };
  }
};

export const getSeverityConfig = (severity) => {
  switch (severity) {
    case 'Critical':
      return 'bg-red-100 text-red-800 border-red-300 font-bold';
    case 'High':
      return 'bg-orange-100 text-orange-800 border-orange-200 font-semibold';
    case 'Medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200 font-medium';
    case 'Low':
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200 font-normal';
  }
};

export const getPriorityConfig = (priority) => {
  switch (priority) {
    case 'P0':
      return 'bg-rose-600 text-white font-mono font-bold';
    case 'P1':
      return 'bg-rose-100 text-rose-800 font-mono font-bold';
    case 'P2':
      return 'bg-indigo-100 text-indigo-800 font-mono font-semibold';
    case 'P3':
    default:
      return 'bg-slate-100 text-slate-700 font-mono';
  }
};
