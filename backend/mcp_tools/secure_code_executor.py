import ast
import os
import subprocess
import sys
import logging
import tempfile
import time
from pathlib import Path
from langchain_mcp_adapters.protocol import (
    tool_from_function,
    serve_from_stdin_stdout,
)

# --- Setup Logging ---
logging.basicConfig(
    level=logging.DEBUG,  # More verbose logging for debugging
    format='%(asctime)s - %(levelname)s - SECURE_EXECUTOR - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stderr),
        # Optional: also log to file for persistence
        # logging.FileHandler('executor.log')
    ]
)

logger = logging.getLogger(__name__)

# --- Enhanced Safety Checks ---
DENY_LIST_MODULES = {
    'os', 'shutil', 'subprocess', 'sys', 'importlib', 
    'exec', 'eval', '__import__', 'compile', 'globals', 'locals'
}
DENY_LIST_FUNCTIONS = {
    'exec', 'eval', '__import__', 'compile', 'open', 'file',
    'input', 'raw_input', 'execfile', 'reload'
}
DENY_LIST_ATTRIBUTES = {
    '__globals__', '__locals__', '__dict__', '__class__',
    '__bases__', '__subclasses__'
}

def is_code_safe(code: str) -> tuple[bool, str]:
    """Enhanced AST-based safety check for Python code."""
    try:
        tree = ast.parse(code)
        
        for node in ast.walk(tree):
            # Check imports
            if isinstance(node, (ast.Import, ast.ImportFrom)):
                for alias in node.names:
                    module_name = alias.name.split('.')[0]  # Get root module
                    if module_name in DENY_LIST_MODULES:
                        return False, f"Unsafe import detected: '{alias.name}'"
            
            # Check function calls
            elif isinstance(node, ast.Call):
                if isinstance(node.func, ast.Name):
                    if node.func.id in DENY_LIST_FUNCTIONS:
                        return False, f"Unsafe function call detected: '{node.func.id}()'"
                elif isinstance(node.func, ast.Attribute):
                    if node.func.attr in DENY_LIST_FUNCTIONS:
                        return False, f"Unsafe method call detected: '{node.func.attr}()'"
            
            # Check attribute access
            elif isinstance(node, ast.Attribute):
                if node.attr in DENY_LIST_ATTRIBUTES:
                    return False, f"Unsafe attribute access detected: '{node.attr}'"
            
            # Check for dangerous assignments
            elif isinstance(node, ast.Assign):
                for target in node.targets:
                    if isinstance(target, ast.Name) and target.id in DENY_LIST_FUNCTIONS:
                        return False, f"Attempted to override builtin: '{target.id}'"
                        
    except SyntaxError as e:
        return False, f"Code has syntax errors: {e}"
    except Exception as e:
        return False, f"Code analysis failed: {e}"
        
    return True, "Code passed static analysis."


def execute_python_code(code: str) -> str:
    """
    Safely executes Python code in an isolated subprocess with enhanced error handling.
    """
    logger.info(f"Received code execution request")
    logger.debug(f"Code to execute:\n{code}")
    
    # Safety check
    is_safe, reason = is_code_safe(code)
    if not is_safe:
        logger.warning(f"Execution blocked: {reason}")
        return f"Execution Blocked by Static Analysis: {reason}"

    # Create workspace directory
    try:
        workspace_dir = Path(__file__).parent.parent.parent / 'workspace'
        workspace_dir.mkdir(exist_ok=True)
        logger.info(f"Using workspace directory: {workspace_dir}")
    except Exception as e:
        logger.error(f"Failed to create workspace directory: {e}")
        return f"Execution Error: Failed to create workspace directory: {e}"

    # Create temporary script file
    script_path = None
    try:
        with tempfile.NamedTemporaryFile(
            mode='w', 
            suffix='.py', 
            dir=workspace_dir, 
            delete=False,
            encoding='utf-8'
        ) as f:
            f.write(code)
            script_path = f.name
            
        logger.info(f"Created temporary script: {script_path}")
        
        # Prepare execution environment
        env = os.environ.copy()
        env['PYTHONPATH'] = str(workspace_dir)
        env['PYTHONIOENCODING'] = 'utf-8'
        
        # Execute the script
        logger.info(f"Executing script with timeout=30s")
        start_time = time.time()
        
        result = subprocess.run(
            [sys.executable, "-I", "-u", script_path],  # -u for unbuffered output
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=30,
            cwd=str(workspace_dir),
            encoding="utf-8",
            errors="replace",  # Handle encoding errors gracefully
            env=env,
            creationflags=subprocess.CREATE_NO_WINDOW if sys.platform == 'win32' else 0
        )
        
        execution_time = time.time() - start_time
        logger.info(f"Execution completed in {execution_time:.2f}s with return code: {result.returncode}")
        
        # Prepare output
        stdout = result.stdout.strip() if result.stdout else ""
        stderr = result.stderr.strip() if result.stderr else ""
        
        if result.returncode == 0:
            output = stdout
            if stderr:
                output += f"\n[STDERR]: {stderr}"
        else:
            output = f"[ERROR - Return Code {result.returncode}]"
            if stderr:
                output += f"\n{stderr}"
            if stdout:
                output += f"\n[STDOUT]: {stdout}"
        
        return f"Execution Result (code {result.returncode}):\n---_START_OF_OUTPUT_---\n{output}\n---_END_OF_OUTPUT_---"

    except subprocess.TimeoutExpired:
        logger.error("Execution timed out after 30 seconds")
        return "Execution Error: Process timed out after 30 seconds."
    
    except subprocess.CalledProcessError as e:
        logger.error(f"Process failed with return code {e.returncode}: {e}")
        return f"Execution Error: Process failed with return code {e.returncode}"
    
    except FileNotFoundError:
        logger.error("Python interpreter not found")
        return "Execution Error: Python interpreter not found. Check Python installation."
    
    except PermissionError as e:
        logger.error(f"Permission denied: {e}")
        return f"Execution Error: Permission denied. Check file permissions: {e}"
    
    except Exception as e:
        logger.error(f"Unexpected error during execution: {e}", exc_info=True)
        return f"Execution Error: An unexpected error occurred: {e}"
    
    finally:
        # Clean up temporary file
        if script_path and os.path.exists(script_path):
            try:
                os.remove(script_path)
                logger.debug(f"Cleaned up temporary script: {script_path}")
            except Exception as e:
                logger.warning(f"Failed to clean up temporary script: {e}")


if __name__ == "__main__":
    logger.info("=== Secure Code Executor Service Starting ===")
    logger.info(f"Python version: {sys.version}")
    logger.info(f"Platform: {sys.platform}")
    logger.info("Listening on stdin/stdout for MCP communication...")
    
    mcp_tool = tool_from_function(execute_python_code)
    
    try:
        serve_from_stdin_stdout([mcp_tool])
    except KeyboardInterrupt:
        logger.info("Service stopped by user")
    except Exception as e:
        logger.critical(f"MCP server crashed: {e}", exc_info=True)
        sys.exit(1)