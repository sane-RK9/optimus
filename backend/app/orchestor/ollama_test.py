# This script provides a simple, direct way to test the Ollama connection.
# Make sure you run 'pip install langchain_community' in your venv first.
from langchain_ollama import OllamaLLM as Ollama

# --- CONFIGURATION ---
# This is the URL your Python code needs to use to talk to Ollama.
# If Ollama is running on your local machine, this is the correct address.
OLLAMA_BASE_URL = "http://localhost:11434"
OLLAMA_MODEL = "llama3.2" # Make sure you have this model installed (e.g., 'ollama pull llama3')

print("--- Ollama Connection Test ---")
print(f"Attempting to connect to Ollama at: {OLLAMA_BASE_URL}")
print(f"Using model: {OLLAMA_MODEL}")

try:
    # 1. Instantiate the Ollama LLM
    # The 'base_url' parameter is CRUCIAL for telling the client where to connect.
    llm = Ollama(model=OLLAMA_MODEL, base_url=OLLAMA_BASE_URL)

    # 2. Send a simple prompt to the model
    print("\nSending a test prompt...")
    response = llm.invoke("Why is the sky blue?")

    # 3. Print the response
    print("\n✅ SUCCESS! Ollama responded:")
    print("---------------------------")
    print(response)
    print("---------------------------")

except Exception as e:
    print("\n❌ FAILURE! An error occurred:")
    print(e)
    print("\n--- Troubleshooting ---")
    print("1. Is the Ollama application running on your machine?")
    print("2. Is the address in OLLAMA_BASE_URL correct?")
    print("3. Is the model name in OLLAMA_MODEL correct and installed?")
    print("4. Is a firewall blocking the connection to port 11434?")