import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from a .env file
load_dotenv()

# --- Core Settings ---
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://127.0.0.1:11434")
LLM_MODEL = os.getenv("LLM_MODEL", "llama3.2")

# --- Paths ---
BASE_DIR = Path(__file__).resolve().parent.parent.parent
EXECUTOR_SCRIPT_PATH = str(BASE_DIR / "mcp_tools" / "secure_code_executor.py")