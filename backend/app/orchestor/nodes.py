import json
import logging
from langchain_core.prompts import ChatPromptTemplate
from langchain_ollama import OllamaLLM as Ollama
from langchain_mcp_adapters.client import MultiServerMCPClient
from .state_models import AgentState
from ..config import LLM_MODEL, OLLAMA_HOST, EXECUTOR_SCRIPT_PATH

# --- LLM and Client Initialization ---
llm = Ollama(model=LLM_MODEL, base_url=OLLAMA_HOST)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Node Definitions ---

async def planner_node(state: AgentState) -> dict:
    """Generates a step-by-step plan to address the user's prompt."""
    prompt_template = ChatPromptTemplate.from_messages([
        ("system", "You are an AI planner. Given a user request, create a detailed step-by-step plan to accomplish the task. Each step should be clear and actionable. Respond with ONLY a single, valid JSON object with a single key 'plan', which is a list of strings."),
        ("user", "User Request: {prompt}")
    ])
    prompt = prompt_template.format_messages(prompt=state.original_prompt)
    response = await llm.ainvoke(prompt)
    logger.info(f"LLM Planner Raw Response: {response} (Type: {type(response)})")
    try:
        plan_data = json.loads(response)
        plan_list = plan_data.get('plan')
        if not isinstance(plan_list, list) or not plan_list:
            raise ValueError("JSON object from LLM did not contain a valid 'plan' list.")
        return {"plan": plan_list}
    except Exception as e:
        logger.error(f"CRITICAL: Failed to create a valid plan. Error: {e}", exc_info=True)
        return {"error": "The AI planner failed to create a valid plan. Please try rephrasing."}


async def code_generator_node(state: AgentState) -> dict:
    """Generates Python code for the current step of the plan."""
    current_plan_step = state.plan[state.current_step]
    
    prompt_template = ChatPromptTemplate.from_messages([
        ("system", "You are a Python code generation expert. Your task is to write a Python script to accomplish a single step in a plan. The script must be immediately executable. Do NOT wrap the code in a function. Do NOT use markdown. For web requests, use the 'requests' library. The script will be run in an environment where 'requests' is installed."),
        ("user", "Full Plan: {plan}\n\nYour Task: Write the Python script for this step ONLY: '{current_step}'")
    ])
    prompt = prompt_template.format_messages(
        plan=state.plan,
        current_step=current_plan_step
    )
    
    response = await llm.ainvoke(prompt)
    code = response.strip()
    logger.info(f"Generated Code for step {state.current_step}:\n{code}")
    return {"generated_code": code}


async def sandbox_execution_node(state: AgentState) -> dict:
    """Executes the generated code using the secure MCP tool."""
    code_to_run = state.generated_code
    if not code_to_run:
        return {"error": "No code was generated to execute."}

    client = MultiServerMCPClient({
        "secure_executor": { "command": "python", "args": [EXECUTOR_SCRIPT_PATH], "transport": "stdio" }
    })
    
    try:
        async with client.session("secure_executor") as session:
            result = await session.ainvoke("execute_python_code", code=code_to_run)
            return {"execution_result": result, "current_step": state.current_step + 1}
    except Exception as e:
        error_message = str(e) if str(e) else "An unknown error occurred during subprocess communication."
        logger.error(f"Error during MCP tool invocation: {error_message}", exc_info=True)
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