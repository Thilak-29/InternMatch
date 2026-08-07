import React, { useState } from 'react';
<<<<<<< HEAD
import { Bot, X, Send, Sparkles } from 'lucide-react';

export default function AIChatAssistant({ apiBaseUrl }) {
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
      const res = await fetch(`${apiBaseUrl}/api/v1/ai/chat`, {
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
=======
import { Bot, Sparkles, X, Send } from 'lucide-react';

export default function AIChatAssistant({ apiBaseUrl }) {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hello! I am your InterSearch AI Mentor. Ask me anything about internship matching, interview preparation, or career roadmaps!' }
  ]);

  const quickPrompts = [
    "What skills boost my match score?",
    "Suggest 5 technical interview questions.",
    "Resume enhancement advice."
  ];

  const handleSendPrompt = async (textToSend) => {
    const p = textToSend || prompt;
    if (!p.trim()) return;

    const userMsg = { sender: 'user', text: p };
    setMessages((prev) => [...prev, userMsg]);
    setPrompt('');
    setLoading(true);

    try {
      const res = await fetch(`${apiBaseUrl}/api/v1/ai-assistant/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: p })
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, { sender: 'ai', text: data.response }]);
      }
    } catch (err) {
      setMessages((prev) => [...prev, { sender: 'ai', text: 'InterSearch AI Assistant is active and ready.' }]);
>>>>>>> 26c430b2b8530a875a41bfc9a9c1514a365a9811
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
<<<<<<< HEAD
=======
      {/* Floating Action AI Button */}
>>>>>>> 26c430b2b8530a875a41bfc9a9c1514a365a9811
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
<<<<<<< HEAD
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

=======
          zIndex: 9999,
          background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: 'var(--radius-full)',
          padding: '12px 24px',
          fontWeight: 700,
          fontSize: '0.95rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(37, 99, 235, 0.35)',
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <Sparkles size={20} /> Ask AI Mentor
      </button>

      {/* Floating Chat Drawer */}
>>>>>>> 26c430b2b8530a875a41bfc9a9c1514a365a9811
      {isOpen && (
        <div
          style={{
            position: 'fixed',
<<<<<<< HEAD
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
=======
            bottom: '88px',
            right: '24px',
            width: '400px',
            maxHeight: '560px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-glass)',
            borderRadius: 'var(--radius-card)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 'var(--shadow-lg)',
            overflow: 'hidden'
          }}
        >
          {/* Drawer Header */}
          <div style={{ background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)', color: '#FFFFFF', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700, fontSize: '1rem' }}>
              <Bot size={22} /> InterSearch AI Mentor
            </div>
            <X size={20} style={{ cursor: 'pointer' }} onClick={() => setIsOpen(false)} />
          </div>

          {/* Quick Questions */}
          <div style={{ padding: '12px 16px', background: 'var(--bg-secondary-surface)', borderBottom: '1px solid var(--border-color)', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {quickPrompts.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendPrompt(q)}
                className="badge badge-ai"
                style={{ cursor: 'pointer', textTransform: 'none', fontSize: '0.78rem' }}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '260px' }}>
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  padding: '12px 16px',
                  borderRadius: '16px',
                  fontSize: '0.88rem',
                  lineHeight: 1.5,
                  background: m.sender === 'user' ? 'var(--color-primary)' : 'var(--bg-secondary-surface)',
                  color: m.sender === 'user' ? '#FFFFFF' : 'var(--text-primary)',
                  boxShadow: m.sender === 'user' ? '0 2px 8px rgba(37,99,235,0.2)' : 'none'
>>>>>>> 26c430b2b8530a875a41bfc9a9c1514a365a9811
                }}
              >
                {m.text}
              </div>
            ))}
            {loading && (
<<<<<<< HEAD
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
=======
              <div style={{ alignSelf: 'flex-start', padding: '12px 16px', background: 'var(--bg-secondary-surface)', borderRadius: '16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Thinking...
              </div>
            )}
          </div>

          {/* Input Footer */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '8px', background: '#FFFFFF' }}>
            <input
              type="text"
              className="input-field"
              style={{ height: '42px', fontSize: '0.88rem' }}
              placeholder="Ask AI Mentor..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendPrompt()}
            />
            <button onClick={() => handleSendPrompt()} className="btn-primary" style={{ height: '42px', padding: '0 16px' }}>
              <Send size={16} />
            </button>
          </div>
>>>>>>> 26c430b2b8530a875a41bfc9a9c1514a365a9811
        </div>
      )}
    </>
  );
}
