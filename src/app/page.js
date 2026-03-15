'use client';

import FunnelChart from '../components/FunnelChart';
import RetentionHeatmap from '../components/RetentionHeatmap';
import ChatBot from '../components/ChatBot';
import UserSwitcher from '../components/UserSwitcher';

export default function DashboardPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f5f7fa',
        padding: '0 0 64px 0',
      }}
    >
      <main
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '38px 20px 0 20px',
        }}
      >
        <header style={{ marginBottom: 30 }}>
          <h1 style={{
            fontSize: 33,
            fontWeight: 800,
            letterSpacing: 0.2,
            margin: 0,
            padding: 0,
            color: '#1a2638'
          }}>
            📊 Analytics Dashboard
          </h1>
          <div
            style={{
              fontSize: 16,
              color: '#6f7c87',
              marginTop: 7,
              fontWeight: 500,
              letterSpacing: 0.02,
              fontFamily: 'monospace',
            }}
          >
            Powered by LaunchDarkly Feature Management
          </div>
        </header>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 32,
            marginBottom: 36,
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 17,
              boxShadow: '0 3px 14px 0 #0d203c13',
              border: '1.3px solid #e4ecf3',
              padding: '30px 24px 22px 24px',
              minHeight: 365,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <FunnelChart />
          </div>
          <div
            style={{
              background: '#fff',
              borderRadius: 17,
              boxShadow: '0 3px 14px 0 #0d203c13',
              border: '1.3px solid #e4ecf3',
              padding: '30px 24px 22px 24px',
              minHeight: 365,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <RetentionHeatmap />
          </div>
        </section>

        <section
          style={{
            background: '#fff',
            borderRadius: 17,
            boxShadow: '0 3px 14px 0 #0d203c13',
            border: '1.3px solid #e4ecf3',
            padding: '28px 24px 20px 24px',
            marginBottom: 55,
            maxWidth: 900,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          <ChatBot />
        </section>
      </main>

      <UserSwitcher />
    </div>
  );
}