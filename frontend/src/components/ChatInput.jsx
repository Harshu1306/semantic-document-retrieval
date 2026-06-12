import React, { useState, useRef, useEffect } from 'react'
import { Send, Globe } from 'lucide-react'

const SUGGESTIONS = [
  'What is the main topic of this document?',
  'Summarise the key findings.',
  'List the important points.',   
  
]

export default function ChatInput({ onSend, disabled, hasDocuments }) {
  const [text, setText] = useState('')
  const textareaRef     = useRef(null)

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  }, [text])

  const submit = () => {
    if (!text.trim() || disabled) return
    onSend(text.trim())
    setText('')
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className="space-y-2">
      {/* Suggestions */}
      {!disabled && hasDocuments && (
        <div className="flex gap-2 flex-wrap">
          {SUGGESTIONS.slice(0, 3).map((s, i) => (
            <button
              key={i}
              onClick={() => { setText(s); textareaRef.current?.focus() }}
              className="text-[11px] px-2.5 py-1 rounded-full border border-slate-800 text-slate-500 hover:border-indigo-500/50 hover:text-slate-300 transition-all truncate max-w-[200px]"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <div className={`
        flex items-end gap-2 bg-slate-800/60 border rounded-2xl px-4 py-3 transition-all
        ${disabled ? 'border-slate-800 opacity-60' : 'border-slate-700 focus-within:border-indigo-500/60'}
      `}>
        <Globe size={16} className="text-slate-600 mb-0.5 shrink-0" />
        <textarea
          ref={textareaRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKey}
          placeholder={hasDocuments ? 'Ask anything — in any language…' : 'Upload a document to start asking questions'}
          disabled={disabled || !hasDocuments}
          rows={1}
          className="flex-1 bg-transparent resize-none outline-none text-sm text-slate-200 placeholder-slate-600 leading-relaxed"
          style={{ minHeight: '24px', maxHeight: '160px' }}
        />
        <button
          onClick={submit}
          disabled={!text.trim() || disabled || !hasDocuments}
          className={`
            p-2 rounded-xl transition-all shrink-0
            ${text.trim() && !disabled && hasDocuments
              ? 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
              : 'bg-slate-700/50 text-slate-600 cursor-not-allowed'
            }
          `}
        >
          <Send size={15} />
        </button>
      </div>
      <p className="text-[10px] text-slate-700 text-center">
        Shift+Enter for new line · Answers always in your query language
      </p>
    </div>
  )
}
