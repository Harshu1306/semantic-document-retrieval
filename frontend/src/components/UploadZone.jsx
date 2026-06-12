import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, CheckCircle, AlertCircle, Loader } from 'lucide-react'

const ACCEPTED = {
  'application/pdf':                   ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/msword':                ['.doc'],
  'text/plain':                        ['.txt'],
  'text/markdown':                     ['.md'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
}

export default function UploadZone({ onUpload, uploading, progress }) {
  const [result, setResult]   = useState(null)
  const [fileErr, setFileErr] = useState(null)

  const onDrop = useCallback(async (accepted, rejected) => {
    setResult(null)
    setFileErr(null)
    if (rejected.length) {
      setFileErr(`Unsupported file type. Please use PDF, DOCX, TXT, MD, or PPTX.`)
      return
    }
    if (!accepted.length) return
    try {
      const res = await onUpload(accepted[0])
      setResult(res)
    } catch (e) {
      setFileErr(e.message)
    }
  }, [onUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept:    ACCEPTED,
    multiple:  false,
    disabled:  uploading,
  })

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer
          transition-all duration-200 select-none
          ${isDragActive
            ? 'border-indigo-500 bg-indigo-500/10'
            : 'border-slate-700 hover:border-indigo-500/60 hover:bg-white/[0.02]'
          }
          ${uploading ? 'opacity-60 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />

        {uploading ? (
          <div className="space-y-3">
            <Loader className="mx-auto text-indigo-400 animate-spin" size={28} />
            <p className="text-sm text-slate-300">Processing document…</p>
            <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-teal-400 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-slate-500">{progress}%</p>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="mx-auto text-slate-500" size={28} />
            <p className="text-sm font-medium text-slate-300">
              {isDragActive ? 'Drop it here' : 'Drop a document or click to browse'}
            </p>
            <p className="text-xs text-slate-600">PDF · DOCX · TXT · MD · PPTX — up to 50 MB</p>
          </div>
        )}
      </div>

      {/* Success */}
      {result && (
        <div className="flex items-start gap-3 bg-teal-500/10 border border-teal-500/30 rounded-lg p-3 animate-fade-in">
          <CheckCircle size={16} className="text-teal-400 mt-0.5 shrink-0" />
          <div className="text-xs text-teal-300 space-y-0.5">
            <p className="font-semibold">{result.filename}</p>
            <p>{result.chunks_stored} chunks indexed · {result.language?.name} detected · {result.file_size_kb} KB</p>
          </div>
        </div>
      )}

      {/* Error */}
      {fileErr && (
        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-lg p-3 animate-fade-in">
          <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
          <p className="text-xs text-red-300">{fileErr}</p>
        </div>
      )}
    </div>
  )
}
