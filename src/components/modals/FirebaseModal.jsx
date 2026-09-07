import React, { useState } from 'react';
import { Cloud, CheckCircle, AlertTriangle, Copy, Check, ExternalLink, XCircle, RefreshCw } from 'lucide-react';
import { isFirebaseConfigured, firebaseConfig } from '../../config/firebase';

export const FirebaseModal = ({ isOpen, onClose, onPullSync }) => {
  if (!isOpen) return null;
  const [copied, setCopied] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  const envSnippet = `# Firebase Configuration (add to .env.local or Vercel Environment Variables)
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(envSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncMessage('');
    try {
      const pulled = await onPullSync();
      if (pulled) {
        setSyncMessage('Successfully pulled latest data from Firestore!');
      } else {
        setSyncMessage(isFirebaseConfigured ? 'Connected! Cloud database is up to date.' : 'Local Storage mode is active.');
      }
    } catch (e) {
      setSyncMessage('Error syncing with cloud: ' + e.message);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col border border-slate-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${isFirebaseConfigured ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
              <Cloud size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Cloud & Database Sync</h2>
              <p className="text-xs text-slate-500">Firebase Firestore & Vercel Deployment Guide</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/50">
            <XCircle size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          {/* Status Box */}
          <div className={`p-4 rounded-xl border flex items-start gap-3 ${
            isFirebaseConfigured 
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' 
              : 'bg-amber-50/70 border-amber-200 text-amber-900'
          }`}>
            {isFirebaseConfigured ? (
              <CheckCircle size={20} className="text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="text-xs space-y-1">
              <p className="font-bold text-sm">
                {isFirebaseConfigured ? 'Firebase Connected & Active' : 'Local Storage Mode (Ready for Firebase)'}
              </p>
              <p className="leading-relaxed opacity-90">
                {isFirebaseConfigured
                  ? `Connected to Firestore project "${firebaseConfig.projectId}". Changes are instantly saved locally and automatically synced to the cloud.`
                  : 'The application is storing data locally in your browser. To make it persistent across devices and live on Vercel, connect your Firebase project below.'}
              </p>
            </div>
          </div>

          {/* Cloud Action */}
          {isFirebaseConfigured && (
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-700">Pull latest cloud updates</span>
              <button
                onClick={handleSync}
                disabled={syncing}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
                {syncing ? 'Syncing...' : 'Sync Firestore'}
              </button>
            </div>
          )}
          {syncMessage && (
            <p className="text-xs font-semibold text-indigo-600 bg-indigo-50 p-2.5 rounded-lg border border-indigo-100">
              {syncMessage}
            </p>
          )}

          {/* Connection Instructions */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">How to connect Firebase & Vercel</h3>
            <ol className="text-xs text-slate-600 space-y-2.5 list-decimal pl-4">
              <li>
                Create a project in the{' '}
                <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-indigo-600 font-semibold inline-flex items-center gap-0.5 hover:underline">
                  Firebase Console <ExternalLink size={12} />
                </a>.
              </li>
              <li>Enable <strong>Firestore Database</strong> (Start in test mode or with security rules).</li>
              <li>In Project Settings, register a <strong>Web App</strong> to obtain your configuration credentials.</li>
              <li>
                Add the variables below to your local <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-indigo-600">.env.local</code> file or to your <strong>Vercel Project Settings → Environment Variables</strong>.
              </li>
            </ol>
          </div>

          {/* Environment Variables Snippet */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Environment Template</span>
              <button
                onClick={copyToClipboard}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                {copied ? 'Copied to clipboard' : 'Copy env variables'}
              </button>
            </div>
            <pre className="p-3.5 bg-slate-900 text-slate-100 rounded-xl text-[11px] font-mono overflow-x-auto selection:bg-indigo-500 selection:text-white leading-relaxed">
              {envSnippet}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition-colors"
          >
            Got it
          </button>
        </div>

      </div>
    </div>
  );
};
