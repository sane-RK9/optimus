from pydantic import BaseModel, Field
from typing import List, Optional

# --- API Models (for communication with frontend) ---

class PromptRequest(BaseModel):
    prompt: str

class AgentResponse(BaseModel):
    type: str  # e.g., "plan", "code", "result", "error"
    data: dict

# --- Agent State (for internal LangGraph use) ---

class AgentState(BaseModel):
    original_prompt: str
    plan: List[str] = Field(default_factory=list)
    current_step: int = 0
    generated_code: Optional[str] = None
    execution_result: Optional[str] = None
    final_response: Optional[str] = None
    error: Optional[str] = None