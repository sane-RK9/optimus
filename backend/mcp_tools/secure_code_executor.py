import ast
import os
import subprocess
import sys
import logging
from langchain_mcp_adapters.protocol import (
    tool_from_function,
    serve_from_stdin_stdout,
)

# --- Setup Logging ---
# This is crucial for debugging the standalone process
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - SECURE_EXECUTOR - %(message)s',
    # Writing to a file is better for production, but stderr is fine for dev
    stream=sys.stderr 
)

# --- AST-based Safety Check ---
DENY_LIST_MODULES = {'os', 'shutil', 'subprocess'}
DENY_LIST_FUNCTIONS = {'exec', 'eval'}

def is_code_safe(code: str) -> (bool, str):
    """Parses Python code with AST to check for disallowed imports or function calls."""
    try:
        tree = ast.parse(code)
        for node in ast.walk(tree):
            if isinstance(node, (ast.Import, ast.ImportFrom)):
                for alias in node.names:
                    if alias.name in DENY_LIST_MODULES:
                        return False, f"Unsafe import detected: '{alias.name}'"
            elif isinstance(node, ast.Call) and isinstance(node.func, ast.Name):
                if node.func.id in DENY_LIST_FUNCTIONS:
                    return False, f"Unsafe function call detected: '{node.func.id}()'"
    except SyntaxError as e:
        return False, f"Code has syntax errors: {e}"
    return True, "Code passed static analysis."


# --- The Tool's Core Function ---
def execute_python_code(code: str) -> str:
    """
    Writes Python code to a file and executes it in an isolated subprocess,
    capturing its output robustly.
    """
    logging.info(f"Received code to execute:\n{code}")
    
    is_safe, reason = is_code_safe(code)
    if not is_safe:
        logging.warning(f"Execution blocked for safety reasons: {reason}")
        return f"Execution Blocked by Static Analysis: {reason}"

    workspace_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'workspace')
    os.makedirs(workspace_dir, exist_ok=True)
    script_path = os.path.join(workspace_dir, "agent_script.py")

    try:
        with open(script_path, "w", encoding="utf-8") as f:
            f.write(code)
        
        logging.info(f"Executing script: {script_path}")
        
        # We explicitly capture stdout and stderr to prevent handle inheritance issues,
        # especially on Windows.
        result = subprocess.run(
            [sys.executable, "-I", script_path],
            # Use PIPE to create new pipes for the child process's streams
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=30,
            cwd=workspace_dir,
            encoding="utf-8",
            # This helps prevent the child from opening a new console window on Windows
            creationflags=subprocess.CREATE_NO_WINDOW if sys.platform == 'win32' else 0
        )
        
        logging.info(f"Execution finished with return code: {result.returncode}")
        
        output = result.stdout + "\n" + result.stderr
        return f"Execution Result (code {result.returncode}):\n---_START_OF_OUTPUT_---\n{output.strip()}\n---_END_OF_OUTPUT_---"

    except subprocess.TimeoutExpired:
        logging.error("Execution timed out.")
        return "Execution Error: Process timed out after 30 seconds."
    except Exception as e:
        logging.error(f"An unexpected error occurred during execution: {e}", exc_info=True)
        return f"Execution Error: An unexpected error occurred: {e}"
    finally:
        if os.path.exists(script_path):
            os.remove(script_path)


if __name__ == "__main__":
    logging.info("Secure code executor service started. Listening on stdio.")
    mcp_tool = tool_from_function(execute_python_code)
    try:
        serve_from_stdin_stdout([mcp_tool])
    except Exception as e:
        logging.critical(f"MCP server crashed: {e}", exc_info=True)