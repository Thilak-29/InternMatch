import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, Search } from 'lucide-react';
import GLOBAL_SKILLS from '../../config/globalSkills';

/**
 * SkillsSelector — Reusable autocomplete skill picker component
 *
 * Props:
 *   selectedSkills  {string[]}  — controlled array of currently selected skills
 *   onChange        {fn}        — called with new string[] whenever skills change
 *   placeholder     {string}    — input placeholder text
 *   maxSkills       {number}    — max skills allowed (default: 30)
 *   label           {string}    — optional label override
 *   compact         {boolean}   — compact mode for tight layouts (signup form)
 */
export default function SkillsSelector({
  selectedSkills = [],
  onChange,
  placeholder = 'Type a skill to search...',
  maxSkills = 30,
  label = 'Technical Skills',
  compact = false,
}) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [activeIdx, setActiveIdx] = useState(-1);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // ── Filter suggestions as user types ─────────────────────────────
  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      setSuggestions([]);
      setActiveIdx(-1);
      return;
    }

    const notSelected = GLOBAL_SKILLS.filter(
      s => !selectedSkills.map(x => x.toLowerCase()).includes(s.toLowerCase())
    );

    // Priority 1: starts with query, Priority 2: contains query
    const startsWith = notSelected.filter(s => s.toLowerCase().startsWith(q));
    const contains   = notSelected.filter(s => !s.toLowerCase().startsWith(q) && s.toLowerCase().includes(q));
    setSuggestions([...startsWith, ...contains].slice(0, 8));
    setActiveIdx(-1);
  }, [query, selectedSkills]);

  // ── Close dropdown when clicking outside ──────────────────────────
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target) &&
        inputRef.current && !inputRef.current.contains(e.target)
      ) {
        setSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addSkill = (skill) => {
    const trimmed = skill.trim();
    if (!trimmed) return;
    if (selectedSkills.length >= maxSkills) return;
    if (selectedSkills.map(s => s.toLowerCase()).includes(trimmed.toLowerCase())) {
      setQuery('');
      setSuggestions([]);
      return;
    }
    onChange([...selectedSkills, trimmed]);
    setQuery('');
    setSuggestions([]);
    inputRef.current?.focus();
  };

  const removeSkill = (skill) => {
    onChange(selectedSkills.filter(s => s !== skill));
  };

  const handleKeyDown = (e) => {
    if (suggestions.length === 0) {
      // Allow adding custom skill with Enter or comma
      if ((e.key === 'Enter' || e.key === ',') && query.trim()) {
        e.preventDefault();
        addSkill(query.replace(/,/g, '').trim());
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIdx >= 0 && suggestions[activeIdx]) {
        addSkill(suggestions[activeIdx]);
      } else if (query.trim()) {
        addSkill(query.trim());
      }
    } else if (e.key === ',') {
      e.preventDefault();
      if (activeIdx >= 0 && suggestions[activeIdx]) {
        addSkill(suggestions[activeIdx]);
      } else if (query.trim()) {
        addSkill(query.replace(/,/g, '').trim());
      }
    } else if (e.key === 'Escape') {
      setSuggestions([]);
      setActiveIdx(-1);
    } else if (e.key === 'Backspace' && query === '' && selectedSkills.length > 0) {
      onChange(selectedSkills.slice(0, -1));
    }
  };

  const pillStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: compact ? '4px' : '6px',
    padding: compact ? '3px 8px 3px 10px' : '5px 10px 5px 12px',
    background: '#EFF6FF',
    border: '1px solid #BFDBFE',
    borderRadius: '20px',
    fontSize: compact ? '0.74rem' : '0.8rem',
    fontWeight: 700,
    color: '#1D4ED8',
    cursor: 'default',
    userSelect: 'none',
  };

  const removeBtn = {
    background: 'none',
    border: 'none',
    padding: '0',
    margin: '0',
    cursor: 'pointer',
    color: '#93C5FD',
    display: 'flex',
    alignItems: 'center',
    lineHeight: 1,
    transition: 'color 0.15s',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? '6px' : '10px' }}>
      {/* ── Selected skill pills ── */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: compact ? '4px' : '6px',
          minHeight: compact ? '28px' : '36px',
          padding: selectedSkills.length > 0 ? (compact ? '4px 0' : '6px 0') : 0,
        }}
      >
        {selectedSkills.map((skill, idx) => (
          <span key={idx} style={pillStyle}>
            {skill}
            <button
              type="button"
              style={removeBtn}
              onClick={() => removeSkill(skill)}
              onMouseEnter={e => e.currentTarget.style.color = '#1D4ED8'}
              onMouseLeave={e => e.currentTarget.style.color = '#93C5FD'}
              title={`Remove ${skill}`}
            >
              <X size={compact ? 10 : 12} />
            </button>
          </span>
        ))}
      </div>

      {/* ── Search input + dropdown ── */}
      {selectedSkills.length < maxSkills && (
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'relative' }}>
            <Search
              size={compact ? 13 : 15}
              color="#94A3B8"
              style={{
                position: 'absolute',
                left: compact ? '10px' : '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
              }}
            />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (query.trim()) {
                  // re-trigger suggestion compute
                  setQuery(q => q);
                }
              }}
              placeholder={placeholder}
              autoComplete="off"
              style={{
                width: '100%',
                padding: compact
                  ? '7px 10px 7px 30px'
                  : '9px 12px 9px 34px',
                borderRadius: '8px',
                background: '#FFFFFF',
                border: '1.5px solid #CBD5E1',
                color: '#0F172A',
                fontSize: compact ? '0.82rem' : '0.87rem',
                outline: 'none',
                transition: 'border-color 0.15s',
                boxSizing: 'border-box',
              }}
              onFocusCapture={e => (e.target.style.borderColor = '#2563EB')}
              onBlurCapture={e => (e.target.style.borderColor = '#CBD5E1')}
            />
          </div>

          {/* ── Dropdown suggestions ── */}
          {suggestions.length > 0 && (
            <div
              ref={dropdownRef}
              style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                left: 0,
                right: 0,
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '10px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
                zIndex: 9999,
                overflow: 'hidden',
              }}
            >
              {suggestions.map((s, idx) => (
                <button
                  key={s}
                  type="button"
                  onMouseDown={e => { e.preventDefault(); addSkill(s); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: compact ? '7px 12px' : '9px 14px',
                    background: activeIdx === idx ? '#EFF6FF' : '#FFFFFF',
                    border: 'none',
                    borderBottom: idx < suggestions.length - 1 ? '1px solid #F1F5F9' : 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: compact ? '0.8rem' : '0.85rem',
                    fontWeight: 600,
                    color: activeIdx === idx ? '#1D4ED8' : '#1E293B',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={() => setActiveIdx(idx)}
                  onMouseLeave={() => setActiveIdx(-1)}
                >
                  <span>
                    {/* Highlight matching prefix */}
                    {s.substring(0, query.length).toLowerCase() === query.toLowerCase()
                      ? (
                        <>
                          <strong style={{ color: '#1D4ED8' }}>{s.substring(0, query.length)}</strong>
                          {s.substring(query.length)}
                        </>
                      )
                      : s
                    }
                  </span>
                  <Plus size={compact ? 12 : 14} color="#94A3B8" style={{ flexShrink: 0, marginLeft: '8px' }} />
                </button>
              ))}

              {/* Option to add as custom skill */}
              {!GLOBAL_SKILLS.map(s => s.toLowerCase()).includes(query.trim().toLowerCase()) && query.trim().length > 1 && (
                <button
                  type="button"
                  onMouseDown={e => { e.preventDefault(); addSkill(query.trim()); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    width: '100%',
                    padding: compact ? '7px 12px' : '9px 14px',
                    background: '#F8FAFC',
                    border: 'none',
                    borderTop: '1px solid #F1F5F9',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: compact ? '0.78rem' : '0.82rem',
                    fontWeight: 600,
                    color: '#64748B',
                  }}
                >
                  <Plus size={12} color="#2563EB" />
                  Add <strong style={{ color: '#1D4ED8', marginLeft: '3px' }}>"{query.trim()}"</strong> as custom skill
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Helper hint ── */}
      <div style={{ fontSize: compact ? '0.68rem' : '0.72rem', color: '#94A3B8', fontWeight: 500 }}>
        {selectedSkills.length > 0
          ? `${selectedSkills.length}/${maxSkills} skills added · Press Backspace to undo last`
          : `Type to search from 300+ global skills · Press Enter or comma to add`}
      </div>
    </div>
  );
}
