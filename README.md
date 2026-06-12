# DocuLingua — Multilingual Document QA System

> Upload documents in any language, ask questions in any language, get answers in your language.

---

## Architecture

```
React Frontend  ──►  FastAPI Backend  ──►  LangChain
   (Vite)              (port 8000)         │
                                           ├── Loaders (PDF/DOCX/TXT/PPTX)
                                           ├── RecursiveCharacterTextSplitter
                                           ├── GoogleGenerativeAIEmbeddings
                                           └── ChromaDB (vector store)
                                                    │
                                                    ▼
                                           Gemini 2.5 Flash
                                           (answer + summarise)
```

## Project Structure

```
multilingual-rag/
│
├── backend/
│   ├── main.py                   # FastAPI app + CORS
│   ├── routes/
│   │   ├── upload.py             # POST /api/upload
│   │   ├── qa.py                 # POST /api/ask, /api/summarize
│   │   └── documents.py          # GET/DELETE /api/documents
│   ├── rag/
│   │   ├── loader.py             # PDF / DOCX / TXT / PPTX loaders
│   │   ├── chunker.py            # RecursiveCharacterTextSplitter
│   │   ├── embeddings.py         # Google embedding-001 → ChromaDB
│   │   ├── retriever.py          # Cosine-similarity vector search
│   │   └── chain.py              # Gemini 2.5 Flash prompt + answer
│   ├── database/
│   │   └── chroma_db.py          # ChromaDB client + CRUD helpers
│   └── utils/
│       └── language_detector.py  # langdetect wrapper
│
├── frontend/
│   └── src/
│       ├── App.jsx               # Root layout (sidebar + chat)
│       ├── hooks/
│       │   ├── useDocuments.js   # Upload / list / delete state
│       │   └── useChat.js        # Conversation + QA state
│       ├── components/
│       │   ├── UploadZone.jsx    # Drag-and-drop upload
│       │   ├── DocumentList.jsx  # Document selector + summary
│       │   ├── ChatMessage.jsx   # Message bubble + source panel
│       │   └── ChatInput.jsx     # Textarea + send button
│       └── services/
│           └── api.js            # Axios wrappers for all endpoints
│
├── requirements.txt
├── start_backend.sh
├── start_frontend.sh
└── README.md
```

## Prerequisites

| Tool | Version |
|------|---------|
| Python | 3.11+ |
| Node.js | 18+ |
| Google API Key | Gemini + Embeddings access |

## Quick Start

### 1. Get a Google API Key

1. Go to [Google AI Studio](https://aistudio.google.com)
2. Create an API key with access to **Gemini 2.5 Flash** and **Embeddings**

### 2. Configure the backend

```bash
cd backend
cp .env.example .env
# Edit .env and set GOOGLE_API_KEY=your_key_here
```

### 3. Start the backend

```bash
# From the project root:
./start_backend.sh

# Or manually:
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r ../requirements.txt
uvicorn main:app --reload
```

Backend runs on http://localhost:8000
API docs at  http://localhost:8000/docs

### 4. Start the frontend

```bash
# In a new terminal, from the project root:
./start_frontend.sh

# Or manually:
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:3000

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/upload` | Upload and index a document |
| `POST` | `/api/ask` | Ask a question (with optional document filter and chat history) |
| `POST` | `/api/summarize` | Generate short / detailed / keypoints summary |
| `GET`  | `/api/documents` | List all indexed documents |
| `DELETE` | `/api/documents/{id}` | Delete a document and its vectors |
| `GET`  | `/health` | Health check |

### Ask endpoint example

```json
POST /api/ask
{
  "question": "इस दस्तावेज़ का मुख्य उद्देश्य क्या है?",
  "document_ids": ["abc123"],
  "chat_history": [
    {"role": "user", "content": "What is RAG?"},
    {"role": "assistant", "content": "RAG stands for..."}
  ],
  "top_k": 5
}
```

## Supported Languages

English · Hindi · Telugu · French · German · Spanish · Chinese · Japanese · Korean · Arabic · Portuguese · Russian · Italian · Tamil · Urdu · Bengali · Kannada · Malayalam · Marathi · Gujarati · Punjabi · and more.

## Supported File Types

| Format | Extension |
|--------|-----------|
| PDF | `.pdf` |
| Word Document | `.docx`, `.doc` |
| Plain Text | `.txt`, `.md` |
| PowerPoint | `.pptx`, `.ppt` |

Maximum file size: **50 MB** (configurable via `MAX_FILE_SIZE_MB` env var)

## Key Design Decisions

- **Language detection** uses `langdetect` on the query, then instructs Gemini to respond in that exact language.
- **Cosine similarity** in ChromaDB ensures semantic matching across languages.
- **Chat history** keeps the last 3 round-trips in context so follow-up questions work naturally.
- **Deterministic chunk IDs** (MD5 of document_id + index) make re-uploads idempotent.
- **Source citations** include filename, page number, and a 0–1 confidence score derived from cosine distance.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `GOOGLE_API_KEY` | — | **Required.** Google AI API key |
| `CHROMA_PATH` | `./chroma_store` | Where ChromaDB persists data |
| `UPLOAD_DIR` | `./uploads` | Where uploaded files are saved |
| `MAX_FILE_SIZE_MB` | `50` | Maximum upload size |
