import json
import logging
from langchain_core.prompts import ChatPromptTemplate
from langchain_mcp_adapters.client import MultiServerMCPClient
from .state_models import AgentState
from ..services import llm_services
from ..services.llm_services import ModelRole
from ..config import EXECUTOR_SCRIPT_PATH

# --- LLM and Client Initialization ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Node Definitions ---

async def planner_node(state: AgentState) -> dict:
    """Generates a step-by-step plan to address the user's prompt."""
    planner_llm = llm_services.get_llm(ModelRole.PLANNER)

    prompt_template = ChatPromptTemplate.from_messages([
        ("system", """You are an AI planner that creates programmatic solutions. 
        
        IMPORTANT CONSTRAINTS:
        - Only create plans that can be executed programmatically with Python code
        - Do NOT include manual steps like "open browser", "click on", "manually download"
        - Focus on API calls, web scraping with requests/beautifulsoup, file operations
        - Each step should be a specific programming task
        - Available libraries: requests, beautifulsoup4, json, csv, pandas, numpy
        - NO subprocess, os.system, or shell commands allowed
        
        For web scraping tasks:
        - Use requests library to fetch web pages
        - Use beautifulsoup4 to parse HTML
        - Save results to files using standard Python file operations
        
        Respond with ONLY a single, valid JSON object with a single key 'plan', which is a list of strings."""),
        ("user", "User Request: {prompt}")
    ])
    prompt = prompt_template.format_messages(prompt=state.original_prompt)
    response = await planner_llm.ainvoke(prompt)
    logger.info(f"LLM Planner Raw Response: {response} (Type: {type(response)})")
    
    try:
        # Handle both string and object responses
        if hasattr(response, 'content'):
            response_text = response.content
        else:
            response_text = str(response)
            
        plan_data = json.loads(response_text)
        plan_list = plan_data.get('plan')
        if not isinstance(plan_list, list) or not plan_list:
            raise ValueError("JSON object from LLM did not contain a valid 'plan' list.")
        return {"plan": plan_list}
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse LLM response as JSON: {e}")
        logger.error(f"Raw response: {response_text}")
        return {"error": "The AI planner returned invalid JSON. Please try rephrasing your request."}
    except Exception as e:
        logger.error(f"CRITICAL: Failed to create a valid plan. Error: {e}", exc_info=True)
        return {"error": "The AI planner failed to create a valid plan. Please try rephrasing."}


async def code_generator_node(state: AgentState) -> dict:
    """Generates Python code for the current step of the plan."""
    coder_llm = llm_services.get_llm(ModelRole.CODER)
    
    current_plan_step = state.plan[state.current_step]
    
    prompt_template = ChatPromptTemplate.from_messages([
        ("system", """You are a Python code generation expert. 
        
        CRITICAL REQUIREMENTS:
        - Write ONLY Python code that uses allowed libraries
        - ALLOWED: requests, beautifulsoup4, json, csv, pandas, numpy, urllib, re, datetime
        - FORBIDDEN: os, subprocess, shutil, sys.exit, exec, eval, import os, import subprocess
        - Do NOT wrap code in functions or classes
        - Do NOT use markdown code blocks
        - Write direct executable Python statements
        - For web requests, always use 'requests' library
        - For HTML parsing, use 'from bs4 import BeautifulSoup'
        - Always include proper error handling with try/except blocks
        - Always include print statements to show progress
        
        Example for web scraping:
        ```
        import requests
        from bs4 import BeautifulSoup
        
        try:
            response = requests.get('https://example.com')
            response.raise_for_status()
            soup = BeautifulSoup(response.content, 'html.parser')
            # ... parsing logic
            print("Successfully completed task")
        except Exception as e:
            print(f"Error: {e}")
        ```"""),
        ("user", "Full Plan: {plan}\n\nWrite Python code for this specific step: '{current_step}'\n\nMake sure the code is safe and uses only allowed libraries.")
    ])
    prompt = prompt_template.format_messages(
        plan=state.plan,
        current_step=current_plan_step
    )
    
    response = await coder_llm.ainvoke(prompt)
    
    # Handle both string and object responses
    if hasattr(response, 'content'):
        code = response.content.strip()
    else:
        code = str(response).strip()
        
    # Remove markdown code blocks if present
    if code.startswith('```python'):
        code = code[9:]
    if code.startswith('```'):
        code = code[3:]
    if code.endswith('```'):
        code = code[:-3]
    
    code = code.strip()
    logger.info(f"Generated Code for step {state.current_step}:\n{code}")
    return {"generated_code": code}


async def sandbox_execution_node(state: AgentState) -> dict:
    """Executes the generated code using the secure MCP tool."""
    code_to_run = state.generated_code
    if not code_to_run:
        return {"error": "No code was generated to execute."}

    try:
        client = MultiServerMCPClient({
            "secure_executor": { 
                "command": "python", 
                "args": [EXECUTOR_SCRIPT_PATH], 
                "transport": "stdio" 
            }
        })
        
        async with client.session("secure_executor") as session:
            logger.info(f"Executing code via MCP for step {state.current_step}")
            result = await session.ainvoke("execute_python_code", code=code_to_run)
            logger.info(f"MCP execution result: {result}")
            return {"execution_result": result, "current_step": state.current_step + 1}
            
    except Exception as e:
        error_message = str(e) if str(e) else "An unknown error occurred during subprocess communication."
        logger.error(f"Error during MCP tool invocation: {error_message}", exc_info=True)
        logger.error(f"Failed code was:\n{code_to_run}")
        
        # Provide more specific error information
        if "Permission denied" in error_message:
            error_message = "Permission denied - check file permissions and security settings"
        elif "No such file" in error_message:
            error_message = f"Executor script not found at: {EXECUTOR_SCRIPT_PATH}"
        elif "Connection refused" in error_message:
            error_message = "Cannot connect to MCP server - check if it's running"
            
        return {"error": f"Failed to execute code: {error_message}"}


def router_node(state: AgentState) -> str:
    """Determines the next step in the workflow."""
    if state.error:
        logger.error(f"Routing to end due to error: {state.error}")
        return "end"
    if state.current_step >= len(state.plan):
        logger.info("Plan complete. Routing to end.")
        return "end"
    else:
        logger.info(f"Routing to step {state.current_step}: generate_code")
        return "generate_code"