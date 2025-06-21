import enum
import requests
from typing import Optional
from langchain_ollama import OllamaLLM as Ollama
from langchain_ollama.chat_models import ChatOllama
from ..config import (
    OLLAMA_HOST,
    PLANNER_MODEL,
    CODER_MODEL,
    ROUTER_MODEL # For future use
)

class ModelRole(enum.Enum):
    """Defines the role of the LLM for a specific task."""
    PLANNER = "planner"
    CODER = "coder"
    ROUTER = "router" # For future complex routing logic
    # Add other roles like 'SAFETY_CHECKER' here in the future

# A dictionary mapping roles to their configured model names
MODEL_MAP = {
    ModelRole.PLANNER: PLANNER_MODEL,
    ModelRole.CODER: CODER_MODEL,
    ModelRole.ROUTER: ROUTER_MODEL,
}

# Cache created LLM instances to avoid re-initializing
_llm_cache = {}

def check_ollama_server(base_url: str) -> bool:
    """
    Check if Ollama server is running and accessible.
    
    Args:
        base_url: The base URL of the Ollama server
        
    Returns:
        True if server is accessible, False otherwise
    """
    try:
        # Test the /api/tags endpoint which lists available models
        response = requests.get(f"{base_url}/api/tags", timeout=5)
        return response.status_code == 200
    except requests.RequestException:
        return False

def check_model_availability(base_url: str, model_name: str) -> bool:
    """
    Check if a specific model is available on the Ollama server.
    
    Args:
        base_url: The base URL of the Ollama server
        model_name: The name of the model to check
        
    Returns:
        True if model is available, False otherwise
    """
    try:
        response = requests.get(f"{base_url}/api/tags", timeout=5)
        if response.status_code == 200:
            models = response.json().get('models', [])
            available_models = [model['name'] for model in models]
            return model_name in available_models
        return False
    except requests.RequestException:
        return False

def get_llm(role: ModelRole, verify_connection: bool = True) -> ChatOllama:
    """
    Retrieves a pre-configured Ollama LLM instance for a specific role.

    This function acts as a factory and cache for our LLM models, ensuring that
    we use the right model for the right task without re-initializing it every time.

    Args:
        role: The ModelRole enum specifying the task for the LLM.
        verify_connection: Whether to verify server connection before creating instance.

    Returns:
        A configured instance of the Ollama client.
        
    Raises:
        ValueError: If no model is configured for the role.
        ConnectionError: If Ollama server is not accessible.
        RuntimeError: If the specified model is not available.
    """
    model_name = MODEL_MAP.get(role)
    if not model_name:
        raise ValueError(f"No model configured for role: {role.name}")
    
    # Check cache first
    if model_name in _llm_cache:
        return _llm_cache[model_name]

    # Verify server connection if requested
    if verify_connection:
        if not check_ollama_server(OLLAMA_HOST):
            raise ConnectionError(
                f"Ollama server is not accessible at {OLLAMA_HOST}. "
                f"Please ensure Ollama is running and accessible."
            )
        
        if not check_model_availability(OLLAMA_HOST, model_name):
            raise RuntimeError(
                f"Model '{model_name}' is not available on Ollama server. "
                f"Please pull the model using: ollama pull {model_name}"
            )

    # If not in cache, create, configure, and cache it
    print(f"INFO: Initializing LLM for role '{role.name}' with model '{model_name}'...")
    
    try:
        llm_instance = ChatOllama(
            model=model_name, 
            base_url=OLLAMA_HOST,
            timeout=30,  # Add timeout for better error handling
            # Add other parameters as needed
            # temperature=0.7,
            # num_ctx=4096,
        )
        _llm_cache[model_name] = llm_instance
        print(f"INFO: Successfully initialized LLM for role '{role.name}'")
        return llm_instance
    except Exception as e:
        print(f"ERROR: Failed to initialize LLM for role '{role.name}': {str(e)}")
        raise

def clear_llm_cache():
    """Clear the LLM cache. Useful for testing or when models need to be reloaded."""
    global _llm_cache
    _llm_cache.clear()
    print("INFO: LLM cache cleared")

def get_available_models() -> Optional[list]:
    """
    Get list of available models from Ollama server.
    
    Returns:
        List of available model names, or None if server is not accessible.
    """
    try:
        response = requests.get(f"{OLLAMA_HOST}/api/tags", timeout=5)
        if response.status_code == 200:
            models = response.json().get('models', [])
            return [model['name'] for model in models]
        return None
    except requests.RequestException:
        return None

# Health check function for the entire system
def health_check() -> dict:
    """
    Perform a health check of the LLM system.
    
    Returns:
        Dictionary containing health status information.
    """
    status = {
        "ollama_server": False,
        "configured_models": {},
        "available_models": [],
        "cache_size": len(_llm_cache)
    }
    
    # Check server
    status["ollama_server"] = check_ollama_server(OLLAMA_HOST)
    
    if status["ollama_server"]:
        # Get available models
        status["available_models"] = get_available_models() or []
        
        # Check each configured model
        for role, model_name in MODEL_MAP.items():
            status["configured_models"][role.name] = {
                "model_name": model_name,
                "available": check_model_availability(OLLAMA_HOST, model_name),
                "cached": model_name in _llm_cache
            }
    
    return status