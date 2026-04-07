import React, { useState } from 'react';
import { BookOpen, ExternalLink, LogOut, User } from 'lucide-react';

interface HeaderProps {
  onGlossaryOpen: () => void;
  userName?: string;
  userPicture?: string;
  onLogout?: () => void;
}

const btnBase: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '6px 12px',
  borderRadius: '8px',
  fontSize: '13px',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'all 0.18s cubic-bezier(0.4,0,0.2,1)',
  border: 'none',
};

export function Header({ onGlossaryOpen, userName, userPicture, onLogout }: HeaderProps) {
  const [glossHover, setGlossHover] = useState(false);
  const [ghHover, setGhHover] = useState(false);
  const [logoutHover, setLogoutHover] = useState(false);

  return (
    <header
      className="w-full px-6 py-4 flex items-center justify-between"
      style={{
        background: '#111827',
        borderBottom: '1px solid #374151',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div className="flex flex-col">
        <span
          className="font-serif leading-none tracking-tight"
          style={{ fontSize: '28px', color: '#F9FAFB' }}
        >
          FundSim
        </span>
        <span className="text-xs mt-0.5" style={{ color: '#6B7280' }}>
          PE/VC Fund Economics Simulator
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Glossary */}
        <button
          onClick={onGlossaryOpen}
          onMouseEnter={() => setGlossHover(true)}
          onMouseLeave={() => setGlossHover(false)}
          style={{
            ...btnBase,
            background: glossHover ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.1)',
            color: glossHover ? '#A5B4FC' : '#818CF8',
            border: `1px solid ${glossHover ? 'rgba(99,102,241,0.5)' : 'rgba(99,102,241,0.3)'}`,
            transform: glossHover ? 'translateY(-1px)' : 'none',
            boxShadow: glossHover ? '0 4px 12px rgba(99,102,241,0.2)' : 'none',
          }}
        >
          <BookOpen size={14} />
          Glossary
        </button>

        {/* GitHub */}
        <a
          href="https://github.com"
          target="_blank"
          rel="noreferrer"
          onMouseEnter={() => setGhHover(true)}
          onMouseLeave={() => setGhHover(false)}
          style={{
            ...btnBase,
            textDecoration: 'none',
            background: ghHover ? '#374151' : 'rgba(55,65,81,0.5)',
            color: ghHover ? '#F9FAFB' : '#9CA3AF',
            border: `1px solid ${ghHover ? '#4B5563' : '#374151'}`,
            transform: ghHover ? 'translateY(-1px)' : 'none',
            boxShadow: ghHover ? '0 4px 12px rgba(0,0,0,0.3)' : 'none',
          }}
        >
          <ExternalLink size={14} />
          GitHub
        </a>

        {/* User section */}
        {userName && (
          <div
            className="flex items-center gap-2 pl-3"
            style={{ borderLeft: '1px solid #374151' }}
          >
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
              style={{
                background: 'rgba(31,41,55,0.8)',
                border: '1px solid #374151',
                transition: 'background 0.18s',
              }}
            >
              {userPicture ? (
                <img
                  src={userPicture}
                  alt={userName}
                  className="w-6 h-6 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}
                >
                  <User size={12} color="white" />
                </div>
              )}
              <span
                style={{
                  fontSize: '13px',
                  color: '#D1D5DB',
                  maxWidth: '120px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {userName}
              </span>
            </div>

            {/* Logout */}
            <button
              onClick={onLogout}
              title="Sign out"
              onMouseEnter={() => setLogoutHover(true)}
              onMouseLeave={() => setLogoutHover(false)}
              style={{
                background: logoutHover ? 'rgba(239,68,68,0.1)' : 'transparent',
                border: `1px solid ${logoutHover ? 'rgba(239,68,68,0.3)' : 'transparent'}`,
                borderRadius: '8px',
                padding: '6px',
                cursor: 'pointer',
                color: logoutHover ? '#EF4444' : '#6B7280',
                transition: 'all 0.18s ease',
                transform: logoutHover ? 'scale(1.1)' : 'scale(1)',
              }}
            >
              <LogOut size={15} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
