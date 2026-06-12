import React, { useState } from 'react'
import { ChevronDown, ChevronUp, Bot, User, FileText, Zap } from 'lucide-react'

function ConfidenceBar({ score }) {
  const pct   = Math.round(score * 100)
  const color = pct > 75 ? 'bg-teal-400' : pct > 50 ? 'bg-amber-400' : 'bg-red-400'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] text-slate-500 w-8 text-right">{pct}%</span>
    </div>
  )
}

function SourcePanel({ sources }) {
  const [open, setOpen] = useState(false)
  if (!sources?.length) return null

  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
      >
        <FileText size={12} />
        <span>{sources.length} source{sources.length > 1 ? 's' : ''}</span>
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      {open && (
        <div className="mt-2 space-y-2 animate-fade-in">
          {sources.map(src => (
            <div
              key={src.source_number}
              className="bg-slate-900/80 border border-slate-800 rounded-lg p-3 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded">
                    [{src.source_number}]
                  </span>
                  <span className="text-[11px] font-medium text-slate-300 truncate max-w-[160px]">
                    {src.filename}
                  </span>
                  <span className="text-[10px] text-slate-600">p.{src.page}</span>
                </div>
              </div>
              <ConfidenceBar score={src.score} />
              <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-3 italic">
                "{src.excerpt}"
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const LANG_FLAGS = { en:'🇬🇧', hi:'🇮🇳', te:'🇮🇳', fr:'🇫🇷', de:'🇩🇪', es:'🇪🇸', zh:'🇨🇳', ja:'🇯🇵', ko:'🇰🇷', ar:'🇸🇦', pt:'🇧🇷', ru:'🇷🇺', it:'🇮🇹' }

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex gap-3 animate-slide-up ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`
        w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold
        ${isUser
          ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white'
          : 'bg-gradient-to-br from-teal-500/30 to-indigo-500/30 border border-teal-500/40 text-teal-400'
        }
      `}>
        {isUser ? <User size={14} /> : <Bot size={14} />}
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] space-y-1 ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        {/* Language tag */}
        {!isUser && message.language && (
          <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
            <span>{LANG_FLAGS[message.language.code] || '🌐'}</span>
            <span>{message.language.name}</span>
            {message.model && (
              <>
                <span className="text-slate-800">·</span>
                <Zap size={9} className="text-indigo-500" />
                <span className="text-indigo-600">{message.model}</span>
              </>
            )}
          </div>
        )}

        <div className={`
          rounded-2xl px-4 py-3 text-sm leading-relaxed
          ${isUser
            ? 'bg-indigo-500/20 border border-indigo-500/30 text-slate-100 rounded-tr-sm'
            : message.isError
              ? 'bg-red-500/10 border border-red-500/20 text-red-300 rounded-tl-sm'
              : 'bg-slate-800/60 border border-slate-700/60 text-slate-200 rounded-tl-sm'
          }
        `}>
          <p className="whitespace-pre-wrap">{message.content}</p>

          {!isUser && <SourcePanel sources={message.sources} />}
        </div>

        <p className="text-[10px] text-slate-700 px-1">
          {new Date(message.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  )
}
