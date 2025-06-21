import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# --- Core Settings ---
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://127.0.0.1:11434")

# --- NEW: Multi-Model Configuration ---
# Define the model for each specific task.
PLANNER_MODEL = os.getenv("PLANNER_MODEL", "llama3.2:3b-instruct")
CODER_MODEL = os.getenv("CODER_MODEL", "codellama:7b-instruct")
ROUTER_MODEL = os.getenv("ROUTER_MODEL", "llama3.2:1b-instruct") # For future LLM-based routing

# --- Paths ---
BASE_DIR = Path(__file__).resolve().parent.parent.parent
EXECUTOR_SCRIPT_PATH = str(BASE_DIR / "backend" / "mcp_tools" / "secure_code_executor.py")