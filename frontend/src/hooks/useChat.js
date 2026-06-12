import { useState, useCallback } from 'react'
import { askQuestion } from '../services/api'

export function useChat() {
  const [messages, setMessages]     = useState([])
  const [thinking, setThinking]     = useState(false)
  const [error, setError]           = useState(null)
  const [selectedDocs, setSelected] = useState([])  // [] = search all

  const sendMessage = useCallback(async (question) => {
    if (!question.trim()) return

    const userMsg = { role: 'user', content: question, ts: Date.now() }
    setMessages(prev => [...prev, userMsg])
    setThinking(true)
    setError(null)

    // Build LangChain-style history (exclude the message we just added)
    const history = messages.map(m => ({ role: m.role, content: m.content }))

    try {
      const result = await askQuestion({
        question,
        documentIds: selectedDocs,
        chatHistory: history,
        topK: 5,
      })

      const assistantMsg = {
        role:     'assistant',
        content:  result.answer,
        sources:  result.sources,
        language: result.query_language,
        model:    result.model,
        ts:       Date.now(),
      }
      setMessages(prev => [...prev, assistantMsg])
    } catch (e) {
      const msg = e.response?.data?.detail || e.message || 'Something went wrong'
      setError(msg)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `⚠️ ${msg}`,
        isError: true,
        ts: Date.now(),
      }])
    } finally {
      setThinking(false)
    }
  }, [messages, selectedDocs])

  const clearChat = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  return { messages, thinking, error, selectedDocs, setSelected, sendMessage, clearChat }
}
