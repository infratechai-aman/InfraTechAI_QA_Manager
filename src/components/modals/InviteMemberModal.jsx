import React, { useState, useEffect } from 'react';
import { 
  X, UserPlus, Mail, Copy, Check, ExternalLink, 
  Shield, Users, Clock, Trash2, Send, RefreshCw, AlertCircle
} from 'lucide-react';
import { db } from '../../services/db';
import { getUserColor, getUserInitial, getUserDisplayName, formatDate } from '../../utils/formatters';

export const InviteMemberModal = ({ 
  isOpen, 
  onClose, 
  project, 
  currentUser,
  onMembersUpdated
}) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('QA Tester');
  const [activeTab, setActiveTab] = useState('invite'); // 'invite' | 'members'
  const [copied, setCopied] = useState(false);
  const [createdInvite, setCreatedInvite] = useState(null);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load project's pending invites on open
  useEffect(() => {
    if (!isOpen || !project?.id) return;
    loadProjectInvites();
  }, [isOpen, project?.id]);

  const loadProjectInvites = async () => {
    try {
      const invites = await db.getProjectInvitations(project.id);
      setPendingInvites(invites.filter(i => i.status === 'pending'));
    } catch (err) {
      console.warn('Error loading project invites:', err);
    }
  };

  if (!isOpen || !project) return null;

  const currentMembers = project.members || [
    {
      email: project.ownerEmail || currentUser?.email || 'Owner',
      role: 'Owner',
      status: 'active',
      addedAt: project.createdAt || new Date().toISOString()
    }
  ];

  // Handle Generate & Open in Gmail
  const handleSendInvite = async (e) => {
    if (e) e.preventDefault();
    setError('');

    const targetEmail = email.trim().toLowerCase();
    if (!targetEmail || !targetEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    // Check if already a member
    if (currentMembers.some(m => m.email?.toLowerCase() === targetEmail)) {
      setError(`${targetEmail} is already a member of this workspace.`);
      return;
    }

    setLoading(true);
    try {
      // 1. Create invitation record in Firestore / Local Cache
      const inviteData = await db.createInvitation({
        projectId: project.id,
        projectName: project.name,
        inviterEmail: currentUser?.email || 'Owner',
        inviterName: currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Team Lead',
        inviteeEmail: targetEmail,
        role,
      });

      setCreatedInvite(inviteData);
      loadProjectInvites();

      // Update project members locally with pending status
      const updatedMembers = [
        ...currentMembers,
        {
          email: targetEmail,
          role,
          status: 'pending',
          addedAt: new Date().toISOString()
        }
      ];

      if (onMembersUpdated) {
        onMembersUpdated(updatedMembers);
      }

      // 2. Generate direct invite link
      const inviteLink = db.generateInviteLink(inviteData.id, project.id);

      // 3. Launch 1-Click Gmail Composer in new tab
      const gmailUrl = db.buildGmailInviteUrl({
        inviteeEmail: targetEmail,
        projectName: project.name,
        inviteLink,
        inviterName: currentUser?.displayName || currentUser?.email?.split('@')[0],
        role,
      });

      window.open(gmailUrl, '_blank', 'noopener,noreferrer');
      setEmail('');
    } catch (err) {
      setError(err.message || 'Failed to create invitation.');
    } finally {
      setLoading(false);
    }
  };

  // Copy invitation link to clipboard
  const handleCopyLink = (inviteId) => {
    const link = db.generateInviteLink(inviteId || createdInvite?.id || 'demo', project.id);
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Revoke invitation
  const handleRevokeInvite = async (inviteId) => {
    if (window.confirm('Are you sure you want to revoke this invitation?')) {
      await db.revokeInvitation(inviteId);
      loadProjectInvites();
      if (onMembersUpdated) {
        const remaining = currentMembers.filter(m => m.email?.toLowerCase() !== pendingInvites.find(i => i.id === inviteId)?.inviteeEmail);
        onMembersUpdated(remaining);
      }
    }
  };

  // Resend via Gmail
  const handleResendGmail = (invite) => {
    const inviteLink = db.generateInviteLink(invite.id, project.id);
    const gmailUrl = db.buildGmailInviteUrl({
      inviteeEmail: invite.inviteeEmail,
      projectName: project.name,
      inviteLink,
      inviterName: currentUser?.displayName || currentUser?.email?.split('@')[0],
      role: invite.role,
    });
    window.open(gmailUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200">
              <UserPlus size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">
                Invite to Workspace
              </h2>
              <p className="text-xs font-semibold text-indigo-600">
                {project.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-4 border-b border-slate-100 flex gap-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('invite')}
            className={`pb-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'invite'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            Invite via Gmail
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'members'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <span>Team Members</span>
            <span className="px-1.5 py-0.2 bg-slate-100 rounded-full text-[10px] text-slate-600">
              {currentMembers.length}
            </span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2 animate-fadeIn">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'invite' && (
            <div className="space-y-5">
              
              {/* Instructions */}
              <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-4">
                <p className="text-xs text-indigo-900 leading-relaxed">
                  Enter your friend's Gmail address below. Clicking <strong>"Send via Gmail"</strong> will generate a secure invite link and open a pre-filled invitation email ready to send in 1 click!
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSendInvite} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Friend's Gmail Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. friend@gmail.com"
                      required
                      autoFocus
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Assign Workspace Role
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'QA Tester', label: 'QA Tester', desc: 'Execute tests, log bugs' },
                      { id: 'Editor', label: 'Editor', desc: 'Full suite & test editing' },
                      { id: 'Viewer', label: 'Viewer', desc: 'Read-only metrics & reports' },
                    ].map(r => (
                      <button
                        type="button"
                        key={r.id}
                        onClick={() => setRole(r.id)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          role === r.id
                            ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <p className={`text-xs font-bold ${role === r.id ? 'text-indigo-700' : 'text-slate-800'}`}>
                          {r.label}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                          {r.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                  <button
                    type="submit"
                    disabled={loading || !email.trim()}
                    className="flex-1 py-3 px-5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Send size={15} />
                    <span>{loading ? 'Creating Invitation...' : 'Send via Gmail (1-Click)'}</span>
                  </button>
                </div>
              </form>

              {/* Direct Link Sharing Section */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Or Share Direct Invite Link
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                  <input
                    type="text"
                    readOnly
                    value={createdInvite ? db.generateInviteLink(createdInvite.id, project.id) : `${window.location.origin}/?project=${project.id}`}
                    className="flex-1 bg-transparent text-xs text-slate-600 font-mono outline-none px-2 truncate"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopyLink(createdInvite?.id)}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  >
                    {copied ? (
                      <>
                        <Check size={14} className="text-emerald-600" />
                        <span className="text-emerald-700">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'members' && (
            <div className="space-y-4">
              
              {/* Current Active Team */}
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Active Team Members ({currentMembers.filter(m => m.status !== 'pending').length})
                </h3>
                <div className="space-y-2">
                  {currentMembers.map((member, idx) => {
                    const palette = getUserColor(member.email);
                    const isOwner = member.role === 'Owner' || member.email === project.ownerEmail;
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl ${palette.badge} font-bold text-xs flex items-center justify-center shrink-0`}>
                            {getUserInitial(member.email)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-bold text-slate-900">
                                {member.email}
                              </p>
                              {member.email === currentUser?.email && (
                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200">
                                  You
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400">
                              Added {formatDate(member.addedAt)}
                            </p>
                          </div>
                        </div>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isOwner 
                            ? 'bg-amber-50 text-amber-800 border-amber-200' 
                            : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        }`}>
                          {member.role || 'Member'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pending Invitations */}
              {pendingInvites.length > 0 && (
                <div className="pt-3 border-t border-slate-100">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Clock size={13} />
                    <span>Pending Invitations ({pendingInvites.length})</span>
                  </h3>
                  <div className="space-y-2">
                    {pendingInvites.map((invite) => (
                      <div
                        key={invite.id}
                        className="flex items-center justify-between p-3 rounded-2xl border border-amber-200 bg-amber-50/40"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-bold text-slate-800">
                              {invite.inviteeEmail}
                            </p>
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                              Waiting to accept
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Invited as {invite.role} • {formatDate(invite.createdAt)}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleResendGmail(invite)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="Resend via Gmail"
                          >
                            <ExternalLink size={15} />
                          </button>
                          <button
                            onClick={() => handleRevokeInvite(invite.id)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Revoke Invitation"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/70 rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
