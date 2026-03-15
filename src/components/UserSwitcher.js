'use client';
import { useLDClient } from 'launchdarkly-react-client-sdk';
import { users } from '@/lib/userContexts';
import { useState } from 'react';

const USER_LIST = [
  {
    key: 'standard',
    label: 'Matt Pierson',
    color: '#1976d2', // blue
    highlightClass: 'user-switcher-btn-standard'
  },
  {
    key: 'enterprise',
    label: 'Brad Bunce',
    color: '#17974c', // green
    highlightClass: 'user-switcher-btn-enterprise'
  }
];

export default function UserSwitcher() {
  const ldClient = useLDClient();
  const [currentUser, setCurrentUser] = useState('standard');
  const [isSwitching, setIsSwitching] = useState(false);

  const handleSwitch = async (key) => {
    if (!ldClient || isSwitching || key === currentUser) return;
    setIsSwitching(true);
    setCurrentUser(key);
    try {
      await ldClient.identify(users[key]);
    } finally {
      setIsSwitching(false);
    }
  };

  const activeUser = users[currentUser];

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        padding: 20,
        minWidth: 220,
        zIndex: 1000,
        background: '#fafbfc',
        border: '1.5px solid #d1dee6',
        borderRadius: 13,
        boxShadow: '0 8px 36px #18306d22, 0 1.5px 4px #18306d11',
        fontFamily: 'inherit'
      }}
    >
      <div
        style={{
          fontWeight: 700,
          letterSpacing: 1,
          fontSize: 15,
          color: '#193241',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}
      >
        DEMO CONSOLE
        {isSwitching ? <span style={{fontSize: 18}}>⏳</span> : null}
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        {USER_LIST.map(({ key, label, color, highlightClass }) => {
          const isActive = currentUser === key;
          return (
            <button
              key={key}
              onClick={() => handleSwitch(key)}
              disabled={isSwitching}
              style={{
                flex: 1,
                padding: '7px 0',
                borderRadius: 7,
                border: isActive ? `2px solid ${color}` : '1.5px solid #ccd6df',
                background: isActive
                  ? color
                  : '#f3f7f9',
                color: isActive ? '#fff' : '#384857',
                fontWeight: 600,
                fontSize: 14,
                letterSpacing: 0.3,
                cursor: isSwitching ? 'not-allowed' : 'pointer',
                boxShadow: isActive
                  ? `0 1px 8px ${color}33`
                  : undefined,
                transition: 'all 0.12s'
              }}
            >
              {label}
            </button>
          );
        })}
      </div>
      <div
        style={{
          marginTop: 13,
          fontSize: 12.5,
          color: '#5a6c70',
          lineHeight: 1.45,
          paddingLeft: 2,
          fontFamily: 'monospace',
          letterSpacing: 0.05,
        }}
      >
        <div>
          <span style={{ fontWeight: 600 }}>{activeUser.name}</span>
          {" "}({currentUser})
        </div>
        <div>
          MAU: <span style={{ fontWeight: 600 }}>{activeUser.monthlyActiveUsers.toLocaleString()}</span>
        </div>
        <div>
          Plan: <span style={{
            fontWeight: 700,
            color: currentUser === 'standard' ? '#1976d2' : '#17974c'
          }}>{activeUser.plan}</span>
        </div>
      </div>
    </div>
  );
}