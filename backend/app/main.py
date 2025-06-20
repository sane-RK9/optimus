from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import agent_router

app = FastAPI(title="Local Agent Backend")

# --- Middleware ---
# Configure CORS to allow the Tauri frontend (and others) to communicate with the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Routers ---
app.include_router(agent_router.router, prefix="/api", tags=["Agent"])

@app.get("/", tags=["Health Check"])
def read_root():
    return {"status": "ok"}