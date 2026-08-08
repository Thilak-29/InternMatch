import React, { useState } from 'react';
import { Bot, X, Send, Sparkles } from 'lucide-react';

export default function AIChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hello! I am your InternMatch AI Assistant powered by Groq LLM. How can I help with your internship applications, resume ATS, or screening exams today?' }
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input;
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:8000/api/v1/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText })
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, { sender: 'ai', text: data.reply }]);
      } else {
        setMessages((prev) => [...prev, { sender: 'ai', text: 'To boost your application match rate, highlight Spring Boot, React, and MySQL on your profile!' }]);
      }
    } catch (err) {
      setMessages((prev) => [...prev, { sender: 'ai', text: 'To boost your application match rate, highlight Spring Boot, React, and MySQL on your profile!' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: '#2563EB',
          color: '#FFFFFF',
          border: 'none',
          boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}
      >
        {isOpen ? <X size={24} /> : <Bot size={26} />}
      </button>

      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '90px',
            right: '24px',
            width: '380px',
            height: '500px',
            background: '#FFFFFF',
            borderRadius: '12px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
            border: '1px solid var(--border-light)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000,
            overflow: 'hidden'
          }}
        >
          <div style={{ background: '#2563EB', color: '#FFFFFF', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Bot size={20} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Groq AI Assistant</div>
              <div style={{ fontSize: '0.72rem', opacity: 0.85 }}>Live LLM Engine • 24/7 Career Assistance</div>
            </div>
          </div>

          <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', background: '#F8FAFC' }}>
            {messages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '82%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  background: m.sender === 'user' ? '#2563EB' : '#FFFFFF',
                  color: m.sender === 'user' ? '#FFFFFF' : '#0F172A',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  border: m.sender === 'user' ? 'none' : '1px solid #E2E8F0'
                }}
              >
                {m.text}
              </div>
            ))}
            {loading && (
              <div style={{ fontSize: '0.8rem', color: '#64748B', fontStyle: 'italic' }}>Groq AI is thinking...</div>
            )}
          </div>

          <form onSubmit={handleSend} style={{ padding: '10px', background: '#FFFFFF', borderTop: '1px solid #E2E8F0', display: 'flex', gap: '8px' }}>
            <input
              type="text"
              className="input-field"
              placeholder="Ask Groq AI a question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{ flex: 1, height: '38px', fontSize: '0.85rem' }}
            />
            <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '0 12px', height: '38px' }}>
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
