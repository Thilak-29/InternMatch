import React, { useState } from 'react';
import { Bot, X, Send, Sparkles } from 'lucide-react';
import API_CONFIG from '../../config/apiConfig';

export default function AIChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hello! I am your InternMatch AI Assistant powered by Groq LLM. How can I help with your internship applications, resume ATS, or screening exams today?' }
  ]);
  const [loading, setLoading] = useState(false);

  const aiApiUrl = API_CONFIG.AI_SERVICE_URL;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input;
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${aiApiUrl}/api/v1/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText })
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, { sender: 'ai', text: data.reply || data.response }]);
      } else {
        setMessages((prev) => [...prev, { sender: 'ai', text: 'To boost your application match rate, highlight Spring Boot, React, and SQL on your profile!' }]);
      }
    } catch (err) {
      setMessages((prev) => [...prev, { sender: 'ai', text: 'To boost your application match rate, highlight Spring Boot, React, and SQL on your profile!' }]);
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
          padding: '14px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
          color: '#FFFFFF',
          border: 'none',
          boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.4)',
          cursor: 'pointer',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Bot size={24} />
      </button>

      {isOpen && (
        <div
          className="glass-card"
          style={{
            position: 'fixed',
            bottom: '84px',
            right: '24px',
            width: '350px',
            height: '460px',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 999,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
            background: '#FFFFFF'
          }}
        >
          <div style={{ padding: '16px', background: '#1E293B', color: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="#60A5FA" />
              <strong style={{ fontSize: '0.95rem' }}>InternMatch AI Assistant</strong>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
              <X size={18} />
            </button>
          </div>

          <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {messages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  fontSize: '0.82rem',
                  background: m.sender === 'user' ? '#2563EB' : '#F1F5F9',
                  color: m.sender === 'user' ? '#FFFFFF' : '#1E293B'
                }}
              >
                {m.text}
              </div>
            ))}
            {loading && <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>AI is thinking...</div>}
          </div>

          <form onSubmit={handleSend} style={{ padding: '12px', borderTop: '1px solid #E2E8F0', display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Ask AI anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="input-field"
              style={{ padding: '8px 12px', fontSize: '0.85rem' }}
            />
            <button type="submit" className="btn-primary" style={{ padding: '8px 14px' }}>
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
