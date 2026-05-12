'use client';

import { useState } from 'react';
import type { Client, TeamMember } from '@/types/dashboard';
import { Avatar } from '@/components/admin/DashboardShell';

interface Props {
  teamMembers: TeamMember[];
  clients: Client[];
  currentMember: TeamMember;
}

export default function TeamManagementView({ teamMembers: initialMembers, clients, currentMember }: Props) {
  const [members, setMembers] = useState(initialMembers);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<'member' | 'admin'>('member');
  const [inviting, setInviting] = useState(false);

  function getAssignedClients(memberId: string) {
    return clients.filter((c) => c.assigned_to === memberId);
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail || !inviteName) return;
    setInviting(true);

    const res = await fetch('/api/dashboard/invite-member', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: inviteEmail, full_name: inviteName, role: inviteRole }),
    });

    if (res.ok) {
      const { member } = await res.json();
      if (member) setMembers((prev) => [...prev, member]);
      setInviteEmail('');
      setInviteName('');
      setInviteRole('member');
      setShowInvite(false);
    }
    setInviting(false);
  }

  return (
    <div className="space-y-4">
      {/* Invite button */}
      {currentMember.role === 'admin' && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setShowInvite(!showInvite)}
            className="btn-primary px-4 py-2 text-sm"
          >
            {showInvite ? 'Cancel' : '+ Invite Member'}
          </button>
        </div>
      )}

      {/* Invite form */}
      {showInvite && (
        <form
          onSubmit={handleInvite}
          className="rounded-xl p-4"
          style={{ background: 'var(--card)', border: '1px solid var(--border-gold)' }}
        >
          <h3 className="mb-3 text-sm font-semibold" style={{ color: 'var(--light)' }}>
            Invite Team Member
          </h3>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="label">Full Name</label>
              <input
                type="text"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                className="input"
                placeholder="Jane Smith"
                required
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="input"
                placeholder="jane@blueharbor.co"
                required
              />
            </div>
            <div>
              <label className="label">Role</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as 'member' | 'admin')}
                className="input"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={inviting}
            className="btn-primary mt-3 px-5 py-2 text-sm"
          >
            {inviting ? 'Inviting...' : 'Send Invite'}
          </button>
        </form>
      )}

      {/* Team members list */}
      <div className="space-y-3">
        {members.map((member) => {
          const assigned = getAssignedClients(member.id);
          return (
            <div
              key={member.id}
              className="rounded-xl p-4"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar member={member} size={40} />
                  <div>
                    <div className="text-sm font-semibold" style={{ color: 'var(--light)' }}>
                      {member.full_name}
                      {member.id === currentMember.id && (
                        <span className="ml-2 text-[10px] font-normal" style={{ color: 'var(--muted)' }}>(you)</span>
                      )}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--muted)' }}>{member.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className="badge"
                    style={{
                      background: member.role === 'admin' ? 'var(--gold-dim)' : 'rgba(143,168,200,0.1)',
                      color: member.role === 'admin' ? 'var(--gold)' : 'var(--silver)',
                      border: `1px solid ${member.role === 'admin' ? 'var(--border-gold)' : 'var(--border)'}`,
                    }}
                  >
                    {member.role}
                  </span>
                </div>
              </div>

              {/* Assigned clients */}
              {assigned.length > 0 && (
                <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                  <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                    Assigned Clients ({assigned.length})
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {assigned.map((c) => (
                      <span
                        key={c.id}
                        className="rounded px-2 py-0.5 text-[11px] font-medium"
                        style={{ background: 'var(--navy3)', color: 'var(--silver)', border: '1px solid var(--border)' }}
                      >
                        {c.business_name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
