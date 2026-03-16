'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useLDClient } from 'launchdarkly-react-client-sdk';

const ASSISTANT_INITIAL_MESSAGE = {
  role: 'assistant',
  text: 'Hi! I can help you understand your analytics data. What would you like to know?',
  modelUsed: null,
};

export default function ChatBot() {
  const [messages, setMessages] = useState([ASSISTANT_INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const ldClient = useLDClient();

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    setError(null);

    const userMsg = {
      role: 'user',
      text: input,
      modelUsed: null,
    };
    setMessages((msgs) => [...msgs, userMsg]);
    setLoading(true);
    setInput('');

    try {
      ldClient?.track('chatbot-message-sent');
      // Pass userKey and userPlan from the frontend to ensure server-side targeting fires correctly.
      // otherwise server always evalutates as default (Standard) variation
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input,
          userKey: ldClient?.getContext()?.key || 'anonymous',
          userPlan: ldClient?.getContext()?.plan || 'free'
         }),
      });
      if (!res.ok) throw new Error('Network error');
      const data = await res.json();

      setMessages((msgs) => [
        ...msgs,
        {
          role: 'assistant',
          text: data.response || 'Sorry, I could not find an answer.',
          modelUsed: data.modelUsed || 'unknown',
        },
      ]);
    } catch (err) {
      setMessages((msgs) => [
        ...msgs,
        {
          role: 'assistant',
          text: 'Sorry, something went wrong. Please try again.',
          modelUsed: null,
        },
      ]);
      setError('Failed to get response.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key send
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      style={{
        width: 380,
        maxWidth: '100%',
        border: '1.5px solid #dbe4ec',
        borderRadius: 13,
        boxShadow: '0 2px 12px #165de91a',
        background: '#f6f8fa',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'inherit',
      }}
    >
      <div
        style={{
          padding: '12px 18px 0 18px',
          fontWeight: 600,
          fontSize: 16,
          color: '#1761a6',
        }}
      >
        Analytics ChatBot
      </div>

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '10px 12px 0 12px',
          maxHeight: 320,
          minHeight: 180,
        }}
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
              alignItems: 'flex-end',
              marginBottom: 10,
            }}
          >
            <div
              style={{
                maxWidth: 265,
                padding: '9px 13px',
                borderRadius: 12,
                background:
                  msg.role === 'user'
                    ? 'linear-gradient(95deg, #2875e5 70%, #55a6f6 100%)'
                    : '#fff',
                color: msg.role === 'user' ? '#fff' : '#223246',
                marginLeft: msg.role === 'user' ? 0 : 6,
                marginRight: msg.role === 'user' ? 6 : 0,
                boxShadow:
                  msg.role === 'user'
                    ? '0 3px 8px #236de655'
                    : '0 2px 8px #c0c8e133',
                fontSize: 14.4,
                fontWeight: 500,
                position: 'relative',
                minHeight: 38,
                whiteSpace: 'pre-line',
                border:
                  msg.role === 'user'
                    ? '1.5px solid #2875e5'
                    : '1.2px solid #e4eaf3',
                wordBreak: 'break-word',
              }}
            >
              {msg.text}
              {msg.modelUsed && msg.role === 'assistant' && (
                <span
                  style={{
                    display: 'inline-block',
                    background: '#f4fafd',
                    border: '1px solid #1976d2',
                    color: '#1976d2',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2.5px 7px',
                    marginLeft: 8,
                    verticalAlign: 'middle',
                    letterSpacing: 0.2,
                  }}
                  title={`Model: ${msg.modelUsed}`}
                >
                  {msg.modelUsed}
                </span>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
            <div
              style={{
                maxWidth: 180,
                padding: '9px 13px',
                borderRadius: 12,
                background: '#fff',
                fontSize: 14.4,
                color: '#223246',
                fontWeight: 500,
                boxShadow: '0 2px 8px #c0c8e133',
                border: '1.2px solid #e4eaf3',
              }}
            >
              <span>Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} style={{ height: 2 }} />
      </div>
      <div
        style={{
          borderTop: '1.5px solid #dbe4ec',
          padding: '9px 13px',
          background: '#fff',
          display: 'flex',
          alignItems: 'flex-end',
          gap: 8,
        }}
      >
        <textarea
          value={input}
          placeholder="Ask a question about your data..."
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          style={{
            flex: 1,
            minHeight: 38,
            maxHeight: 80,
            fontSize: 14.5,
            padding: '8px 11px',
            borderRadius: 7,
            border: '1.2px solid #c5d2e1',
            resize: 'none',
            fontFamily: 'inherit',
            outline: 'none',
            background: '#f7fbff',
            color: '#21304a',
            fontWeight: 500,
            transition: 'border 0.12s',
          }}
          disabled={loading}
        />
        <button
          type="button"
          disabled={loading || !input.trim()}
          onClick={handleSend}
          style={{
            background:
              loading || !input.trim()
                ? '#aac9e6'
                : 'linear-gradient(95deg, #2875e5 60%, #5bb7fa 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: 7,
            fontWeight: 650,
            fontSize: 15.1,
            padding: '8px 19px',
            boxShadow: loading ? 'none' : '0 2px 7px #2175ea22',
            cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            transition: 'background 0.13s',
            marginRight: 1,
          }}
        >
          Send
        </button>
      </div>
      {error && (
        <div
          style={{
            color: '#b41e1e',
            background: '#fff2f3',
            padding: '5px 12px',
            fontSize: 12.7,
            borderRadius: 0,
            borderTop: '1.2px solid #ffdbe4',
            fontWeight: 550,
            textAlign: 'center',
            letterSpacing: 0.1,
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}