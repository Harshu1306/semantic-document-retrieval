import React, { useState } from 'react'
import { FileText, Trash2, ChevronDown, ChevronUp, Globe } from 'lucide-react'
import { summarizeDocument } from '../services/api'

const LANG_FLAGS = { en:'🇬🇧', hi:'🇮🇳', te:'🇮🇳', fr:'🇫🇷', de:'🇩🇪', es:'🇪🇸', zh:'🇨🇳', ja:'🇯🇵', ko:'🇰🇷', ar:'🇸🇦', pt:'🇧🇷', ru:'🇷🇺', it:'🇮🇹' }

export default function DocumentList({ documents, selectedDocs, onToggle, onDelete }) {
  const [expanded, setExpanded]       = useState(null)
  const [summary, setSummary]         = useState({})
  const [summaryType, setSummaryType] = useState('short')
  const [loading, setLoading]         = useState(null)

  const loadSummary = async (doc) => {
    const key = `${doc.document_id}_${summaryType}`
    if (summary[key]) return
    setLoading(doc.document_id)
    try {
      const res = await summarizeDocument({ documentId: doc.document_id, summaryType })
      setSummary(prev => ({ ...prev, [key]: res.summary }))
    } catch {
      setSummary(prev => ({ ...prev, [key]: 'Summary unavailable.' }))
    } finally {
      setLoading(null)
    }
  }

  if (!documents.length) {
    return (
      <div className="text-center py-8 text-slate-600">
        <FileText size={32} className="mx-auto mb-2 opacity-40" />
        <p className="text-xs">No documents yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {documents.map(doc => {
        const isSelected = selectedDocs.includes(doc.document_id)
        const isExpanded = expanded === doc.document_id
        const flag       = LANG_FLAGS[doc.language] || '🌐'
        const summaryKey = `${doc.document_id}_${summaryType}`

        return (
          <div
            key={doc.document_id}
            className={`
              rounded-lg border transition-all duration-150
              ${isSelected
                ? 'border-indigo-500/60 bg-indigo-500/10'
                : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
              }
            `}
          >
            {/* Header row */}
            <div className="flex items-center gap-2 p-2.5">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggle(doc.document_id)}
                className="accent-indigo-500 w-3.5 h-3.5 shrink-0 cursor-pointer"
              />
              <span className="text-base shrink-0">{flag}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-200 truncate">{doc.filename}</p>
                <p className="text-[10px] text-slate-600">{doc.total_chunks} chunks</p>
              </div>
              <button
                onClick={() => {
                  if (!isExpanded) loadSummary(doc)
                  setExpanded(isExpanded ? null : doc.document_id)
                }}
                className="text-slate-600 hover:text-slate-400 transition-colors p-1"
                title="Summary"
              >
                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              <button
                onClick={() => onDelete(doc.document_id)}
                className="text-slate-700 hover:text-red-400 transition-colors p-1"
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>

            {/* Expandable summary */}
            {isExpanded && (
              <div className="px-3 pb-3 space-y-2 animate-fade-in">
                <div className="flex gap-1">
                  {['short', 'detailed', 'keypoints'].map(t => (
                    <button
                      key={t}
                      onClick={() => { setSummaryType(t); loadSummary({ ...doc }) }}
                      className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                        summaryType === t
                          ? 'border-teal-500 text-teal-400 bg-teal-500/10'
                          : 'border-slate-700 text-slate-500 hover:border-slate-600'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                {loading === doc.document_id ? (
                  <p className="text-xs text-slate-500 animate-pulse">Generating summary…</p>
                ) : (
                  <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-wrap">
                    {summary[summaryKey] || 'Click a type above to generate a summary.'}
                  </p>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
