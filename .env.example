#!/bin/bash
# Exit immediately if a command exits with a non-zero status.
set -e

echo "--- Local Agentic Automation System Setup ---"

# --- Step 1: Dependency Checks ---
echo "Checking for required system dependencies..."

# Function to check for a command
check_command() {
    if ! command -v $1 &> /dev/null
    then
        echo "ERROR: $1 is not installed. Please install it before running this script."
        exit 1
    fi
}

check_command "python3"
check_command "node"
check_command "npm"
check_command "cargo"
check_command "ollama"

echo "All system dependencies found."

# --- Step 2: Python Backend Setup ---
echo "Setting up Python backend..."
if [ -d "backend/venv" ]; then
    echo "Virtual environment already exists. Skipping creation."
else
    python3 -m venv backend/venv
    echo "Virtual environment created at backend/venv."
fi

# Activate venv and install dependencies
source backend/venv/bin/activate
pip install -r backend/requirements.txt
deactivate

echo "Python backend dependencies installed."

# --- Step 3: Frontend Setup ---
echo "Setting up Tauri frontend..."
cd frontend
npm install
cd ..
echo "Frontend dependencies installed."

# --- Step 4: Configuration Setup ---
echo "Setting up configuration..."
if [ -f ".env" ]; then
    echo ".env file already exists. Skipping creation."
else
    cp .env.example .env
    echo "Created .env file from .env.example. Please review and fill it out."
fi

# --- Step 5: Create Runtime Directories ---
echo "Creating runtime directories..."
mkdir -p data logs workspace

# --- Step 6: Ollama Model Check ---
echo "Checking for Ollama models..."
# A good, small, fast model for initial testing. Change if you prefer another.
DEFAULT_MODEL="phi3:latest" 
if ollama list | grep -q "$DEFAULT_MODEL"; then
    echo "Default model ($DEFAULT_MODEL) is already available."
else
    echo "Default model ($DEFAULT_MODEL) not found."
    read -p "Do you want to pull it now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        ollama pull $DEFAULT_MODEL
    else
        echo "Skipping model pull. Please ensure you have a model available for the agent to use."
    fi
fi


echo ""
echo "--- Setup Complete! ---"
echo "To run the application in development mode:"
echo "1. Make sure the Ollama server is running in a separate terminal ('ollama serve')."
echo "2. Run the application with: npm run tauri dev"