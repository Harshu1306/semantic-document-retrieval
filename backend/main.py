from dotenv import load_dotenv
load_dotenv()
import os
print("GOOGLE_API_KEY =", os.getenv("GOOGLE_API_KEY"))
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.upload import router as upload_router
from routes.qa import router as qa_router
from routes.documents import router as documents_router
from database.chroma_db import initialize_chroma

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initialising ChromaDB …")
    initialize_chroma()
    logger.info("ChromaDB ready.")
    yield
    logger.info("Shutting down.")


app = FastAPI(
    title="Multilingual RAG API",
    description="Upload documents and ask questions in any language.",
    version="1.0.0",
    lifespan=lifespan,
)

# Configured to allow local development ports and your live deployed Render frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "https://semantic-document-ui.onrender.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router, prefix="/api", tags=["Upload"])
app.include_router(qa_router,     prefix="/api", tags=["QA"])
app.include_router(documents_router, prefix="/api", tags=["Documents"])


@app.get("/health")
async def health():
    return {"status": "ok", "service": "RAG API"}
