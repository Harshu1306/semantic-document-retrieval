import axios from 'axios'

// 1. Vite uses import.meta.env.PROD to check for production mode
// 2. Appended /api to match your FastAPI router prefixes
const BACKEND_URL = import.meta.env.PROD 
  ? 'https://smartdoc-retrieval.onrender.com/api' 
  : 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: BACKEND_URL,
  timeout: 120_000,
})

export const uploadDocument = async (file, onProgress) => {
  const form = new FormData()
  form.append('file', file)
  const { data } = await api.post('/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: e => onProgress && onProgress(Math.round((e.loaded * 100) / e.total)),
  })
  return data
}

export const askQuestion = async ({ question, documentIds, chatHistory, topK = 5 }) => {
  const { data } = await api.post('/ask', {
    question,
    document_ids:  documentIds?.length ? documentIds : null,
    chat_history:  chatHistory || [],
    top_k:         topK,
  })
  return data
}

export const summarizeDocument = async ({ documentId, summaryType = 'short', language = 'English' }) => {
  const { data } = await api.post('/summarize', {
    document_id:  documentId,
    summary_type: summaryType,
    language,
  })
  return data
}

export const listDocuments = async () => {
  const { data } = await api.get('/documents')
  return data
}

export const deleteDocument = async (documentId) => {
  const { data } = await api.delete(`/documents/${documentId}`)
  return data
}