import React, { useRef, useEffect, useState } from 'react'
import { Bot, Trash2, ChevronLeft, ChevronRight, Sparkles, Globe2 } from 'lucide-react'

import { useDocuments } from './hooks/useDocuments'
import { useChat }      from './hooks/useChat'

import UploadZone    from './components/UploadZone'
import DocumentList  from './components/DocumentList'
import ChatMessage   from './components/ChatMessage'
import ChatInput     from './components/ChatInput'

function TypingIndicator() {
  return (
    <div className="flex gap-3 animate-fade-in">
      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-teal-500/30 to-indigo-500/30 border border-teal-500/40">
        <Bot size={14} className="text-teal-400" />
      </div>
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex items-center gap-1">
          <span className="dot" />
          <span className="dot" />
          <span className="dot" />
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [sidebarOpen, setSidebar] = useState(true)
  const bottomRef = useRef(null)

  const { documents, uploading, uploadProgress, upload, remove } = useDocuments()
  const { messages, thinking, selectedDocs, setSelected, sendMessage, clearChat } = useChat()

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, thinking])

  const toggleDoc = (id) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    )
  }

  const LANGS = ['English']

  return (
    <div className="flex h-screen bg-[#0F1117] text-slate-200 overflow-hidden">

      {/* ── Sidebar ──────────────────────────────────────────────── */}
      <aside className={`
        flex flex-col border-r border-slate-800/70 bg-slate-900/40 transition-all duration-300 shrink-0
        ${sidebarOpen ? 'w-72' : 'w-0 overflow-hidden'}
      `}>
        {/* Branding */}
        <div className="px-4 py-4 border-b border-slate-800/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-teal-500 flex items-center justify-center">
              <Globe2 size={16} className="text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-sm text-white tracking-tight">SmartDoc Retriver</h1>
              <p className="text-[10px] text-slate-600">Document retrevial</p>
            </div>
          </div>
        </div>

        {/* Upload */}
        <div className="px-3 pt-4 pb-2">
          <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest mb-2 px-1">Upload Document</p>
          <UploadZone onUpload={upload} uploading={uploading} progress={uploadProgress} />
        </div>

        {/* Document list */}
        <div className="px-3 py-2 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-2 px-1">
            <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest">
              Documents ({documents.length})
            </p>
            {selectedDocs.length > 0 && (
              <button
                onClick={() => setSelected([])}
                className="text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Clear filter
              </button>
            )}
          </div>

          {selectedDocs.length > 0 && (
            <div className="mb-2 px-1 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
              <p className="text-[10px] text-indigo-400">
                Searching {selectedDocs.length} selected document{selectedDocs.length > 1 ? 's' : ''}
              </p>
            </div>
          )}

          <DocumentList
            documents={documents}
            selectedDocs={selectedDocs}
            onToggle={toggleDoc}
            onDelete={remove}
          />
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-slate-800/70">
          <p className="text-[10px] text-slate-700 text-center">
            Powered by Gemini 2.5 Flash · LangChain · ChromaDB
          </p>
        </div>
      </aside>

      {/* ── Main chat area ──────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-slate-800/70 bg-slate-900/30 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebar(v => !v)}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-300 hover:bg-slate-800 transition-all"
            >
              {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>
            <div>
              <h2 className="text-sm font-semibold text-slate-200">Document Assistant</h2>
              <p className="text-[10px] text-slate-600">
                {documents.length === 0
                  ? 'Upload documents to begin'
                  : `${documents.length} document${documents.length > 1 ? 's' : ''} available · Ask in any language`
                }
              </p>
            </div>
          </div>

          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-red-500/10"
            >
              <Trash2 size={13} />
              Clear
            </button>
          )}
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-60">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-teal-500/20 border border-indigo-500/20 flex items-center justify-center">
                <Sparkles size={28} className="text-indigo-400" />
              </div>
              <div>
                <h3 className="font-display font-bold text-slate-300 mb-1">Ask anything</h3>
                <p className="text-sm text-slate-600 max-w-sm">
                  Upload a document and ask questions in English.
                  Answers are always delivered in your query language.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center mt-2">
                {LANGS.map(l => (
                  <span key={l} className="text-xs px-2.5 py-1 bg-slate-800/60 border border-slate-800 rounded-full text-slate-600">
                    {l}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, i) => <ChatMessage key={i} message={msg} />)
          )}

          {thinking && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-4 border-t border-slate-800/70 bg-slate-900/20 shrink-0">
          <ChatInput
            onSend={sendMessage}
            disabled={thinking}
            hasDocuments={documents.length > 0}
          />
        </div>
      </div>
    </div>
  )
}
