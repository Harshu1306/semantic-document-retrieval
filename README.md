# 📄 Semantic Document Retrieval

A basic **RAG (Retrieval-Augmented Generation)** application that lets you upload documents, ask questions, and get answers grounded in the document content — powered by Google Gemini and ChromaDB.

---

## 🧩 Problem Statement

Reading through large documents to find specific information is slow and inefficient. Traditional keyword search misses relevant content when you use different wording than what's in the document.

This project solves that by converting documents into semantic vector embeddings and using an LLM to answer questions based on the most relevant chunks — so you get accurate, context-aware answers instead of raw search results.

---

## ✨ Features

- 📎 Upload documents (PDF, DOCX, TXT, PPTX)
- 🧠 Semantic search using Google Generative AI Embeddings + ChromaDB
- 💬 Ask questions and get answers grounded in your documents
- 🗂️ Manage uploaded documents (list & delete)
- ⚡ FastAPI backend + React (Vite) frontend

---

## 🏗️ How It Works

```
User uploads document
        │
        ▼
Text Extraction (pypdf / python-docx / python-pptx)
        │
        ▼
Chunking (RecursiveCharacterTextSplitter)
        │
        ▼
Embeddings (Google GenerativeAI embedding-001)
        │
        ▼
Stored in ChromaDB (vector store)
        │
   User asks a question
        │
        ▼
Query embedded → Similarity search in ChromaDB
        │
        ▼
Top-k chunks passed to Gemini 2.5 Flash as context
        │
        ▼
Answer returned to user
```

---

## 📁 File Structure

```
semantic-document-retrieval/
│
├── backend/
│   ├── main.py                    # FastAPI app entry point + CORS
│   ├── routes/
│   │   ├── upload.py              # POST /api/upload
│   │   ├── qa.py                  # POST /api/ask, /api/summarize
│   │   └── documents.py           # GET / DELETE /api/documents
│   ├── rag/
│   │   ├── loader.py              # Document loaders (PDF, DOCX, TXT, PPTX)
│   │   ├── chunker.py             # Text splitting logic
│   │   ├── embeddings.py          # Google embedding-001 → ChromaDB
│   │   ├── retriever.py           # Similarity search over vector store
│   │   └── chain.py               # Gemini prompt + answer generation
│   ├── database/
│   │   └── chroma_db.py           # ChromaDB client + CRUD helpers
│   └── utils/
│       └── language_detector.py   # Utility helper
│
├── frontend/
│   └── src/
│       ├── App.jsx                # Root layout
│       ├── hooks/
│       │   ├── useDocuments.js    # Document upload/list/delete state
│       │   └── useChat.js         # QA conversation state
│       ├── components/
│       │   ├── UploadZone.jsx     # Drag-and-drop file upload
│       │   ├── DocumentList.jsx   # Uploaded documents panel
│       │   ├── ChatMessage.jsx    # Message bubble with source info
│       │   └── ChatInput.jsx      # Question input + send button
│       └── services/
│           └── api.js             # Axios API calls
│
├── requirements.txt
├── start_backend.sh
├── start_frontend.sh
├── .gitignore
└── README.md
```

---

## ✅ Prerequisites

| Tool           | Version / Requirement              |
|----------------|------------------------------------|
| Python         | 3.11+                              |
| Node.js        | 18+                                |
| Google API Key | Access to Gemini + Embeddings API  |

---

## 🚀 Setup & Installation

### Step 1 — Clone the repository

```bash
git clone https://github.com/Harshu1306/semantic-document-retrieval.git
cd semantic-document-retrieval
```

---

### Step 2 — Get a Google API Key

1. Go to [Google AI Studio](https://aistudio.google.com)
2. Create an API key with access to **Gemini** and **Embeddings**

---

### Step 3 — Configure environment variables

```bash
cd backend
cp .env.example .env
```

Open `.env` and add your key:

```env
GOOGLE_API_KEY=your_google_api_key_here
```

---

### Step 4 — Start the backend

**Option A — Shell script:**
```bash
# From the project root
./start_backend.sh
```

**Option B — Manual:**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r ../requirements.txt
uvicorn main:app --reload
```

Backend runs at `http://localhost:8000`  
API docs (Swagger) at `http://localhost:8000/docs`

---

### Step 5 — Start the frontend

**Option A — Shell script:**
```bash
# In a new terminal, from the project root
./start_frontend.sh
```

**Option B — Manual:**
```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`

---

## 🔌 API Endpoints

| Method   | Endpoint                | Description                        |
|----------|-------------------------|------------------------------------|
| `POST`   | `/api/upload`           | Upload and index a document        |
| `POST`   | `/api/ask`              | Ask a question about a document    |
| `POST`   | `/api/summarize`        | Summarize a document               |
| `GET`    | `/api/documents`        | List all uploaded documents        |
| `DELETE` | `/api/documents/{id}`   | Delete a document and its vectors  |
| `GET`    | `/health`               | Health check                       |

---

## 📦 Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | React, Vite                         |
| Backend     | FastAPI, Uvicorn                    |
| RAG         | LangChain                           |
| LLM         | Google Gemini 2.5 Flash             |
| Embeddings  | Google GenerativeAI embedding-001   |
| Vector DB   | ChromaDB                            |
| Doc Parsing | pypdf, python-docx, python-pptx     |

---

## 📂 Supported File Types

| Format     | Extension       |
|------------|-----------------|
| PDF        | `.pdf`          |
| Word       | `.docx`, `.doc` |
| Plain Text | `.txt`          |
| PowerPoint | `.pptx`, `.ppt` |

---

## 🤝 Contributing

Pull requests are welcome. For major changes, open an issue first to discuss what you'd like to change.

---

## 📄 License

This project is open source. See [LICENSE](LICENSE) for details.
