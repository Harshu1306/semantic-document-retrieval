import { useState, useCallback, useEffect } from 'react'
import { listDocuments, uploadDocument, deleteDocument } from '../services/api'

export function useDocuments() {
  const [documents, setDocuments]     = useState([])
  const [uploading, setUploading]     = useState(false)
  const [uploadProgress, setProgress] = useState(0)
  const [error, setError]             = useState(null)

  const fetchDocuments = useCallback(async () => {
    try {
      const docs = await listDocuments()
      setDocuments(docs)
    } catch (e) {
      console.error('Failed to fetch documents', e)
    }
  }, [])

  useEffect(() => { fetchDocuments() }, [fetchDocuments])

  const upload = useCallback(async (file) => {
    setUploading(true)
    setProgress(0)
    setError(null)
    try {
      const result = await uploadDocument(file, setProgress)
      await fetchDocuments()
      return result
    } catch (e) {
      const msg = e.response?.data?.detail || e.message || 'Upload failed'
      setError(msg)
      throw new Error(msg)
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }, [fetchDocuments])

  const remove = useCallback(async (documentId) => {
    try {
      await deleteDocument(documentId)
      setDocuments(prev => prev.filter(d => d.document_id !== documentId))
    } catch (e) {
      setError(e.response?.data?.detail || 'Delete failed')
    }
  }, [])

  return { documents, uploading, uploadProgress, error, upload, remove, refetch: fetchDocuments }
}
