import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { getTemplateMeta, RESUME_TEMPLATES } from '../lib/templates';

/**
 * Compact template trigger + Tier-3 glass picker overlay for /edit-resume preview panel.
 */
export default function TemplateSelector({
  templateId,
  onSelect,
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const active = getTemplateMeta(templateId);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onPointer = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onPointer);
    };
  }, [open]);

  const handleSelect = (id) => {
    if (id === templateId) {
      setOpen(false);
      return;
    }
    onSelect?.(id);
    setOpen(false);
  };

  return (
    <div className="relative font-sans" ref={rootRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="flex items-center gap-2 h-9 pl-1.5 pr-2.5 rounded-xl border transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-sm"
        style={{
          background: '#FFFFFF',
          borderColor: open ? 'rgba(20, 180, 140, 0.45)' : 'rgba(20, 40, 35, 0.12)',
          boxShadow: open ? '0 0 0 3px rgba(20, 180, 140, 0.12)' : 'none',
        }}
      >
        <span
          className="w-6 h-8 rounded-md overflow-hidden shrink-0 border bg-slate-50"
          style={{ borderColor: 'rgba(20, 40, 35, 0.10)' }}
        >
          <img
            src={active.thumbnail}
            alt=""
            className="w-full h-full object-cover object-top"
            draggable={false}
          />
        </span>
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 whitespace-nowrap">
          Template: <span className="text-teal-700">{active.name}</span>
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Choose resume template"
          className="glass-panel-tier-3 absolute right-0 top-[calc(100%+8px)] z-50 w-[min(420px,calc(100vw-2rem))] p-3"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          <div className="flex items-center justify-between mb-2.5 px-1">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
              Choose template
            </p>
            <span className="text-[10px] font-semibold text-slate-400">
              Content stays the same
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {RESUME_TEMPLATES.map((tpl) => {
              const isActive = tpl.id === active.id;
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => handleSelect(tpl.id)}
                  className="group text-left rounded-xl overflow-hidden transition-all duration-200 cursor-pointer bg-white"
                  style={{
                    border: isActive
                      ? '2px solid rgb(20, 180, 140)'
                      : '1px solid rgba(20, 40, 35, 0.10)',
                    boxShadow: isActive
                      ? '0 8px 20px rgba(20, 100, 80, 0.12)'
                      : '0 2px 8px rgba(15, 23, 42, 0.04)',
                    transform: 'translateY(0)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    if (!isActive) {
                      e.currentTarget.style.borderColor = 'rgba(20, 180, 140, 0.35)';
                      e.currentTarget.style.boxShadow = '0 10px 22px rgba(20, 100, 80, 0.10)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    if (!isActive) {
                      e.currentTarget.style.borderColor = 'rgba(20, 40, 35, 0.10)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(15, 23, 42, 0.04)';
                    }
                  }}
                >
                  <div className="relative aspect-[7/9] bg-slate-50 overflow-hidden border-b border-slate-100">
                    <img
                      src={tpl.thumbnail}
                      alt={`${tpl.displayName} preview`}
                      className="w-full h-full object-cover object-top"
                      draggable={false}
                    />
                    {isActive && (
                      <span
                        className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-white shadow-sm"
                        style={{ background: 'rgb(20, 180, 140)' }}
                      >
                        <Check className="w-3.5 h-3.5" strokeWidth={3} />
                      </span>
                    )}
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs font-bold text-slate-800 tracking-tight">
                      {tpl.displayName}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-snug line-clamp-2">
                      {tpl.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
