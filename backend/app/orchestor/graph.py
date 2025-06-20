from langgraph.graph import StateGraph, END
from .state_models import AgentState
from .nodes import planner_node, code_generator_node, sandbox_execution_node, router_node

def create_agent_graph() -> StateGraph:
    """Builds and compiles the agent's LangGraph workflow."""
    workflow = StateGraph(AgentState)

    # Add nodes to the graph
    workflow.add_node("planner", planner_node)
    workflow.add_node("generate_code", code_generator_node)
    workflow.add_node("execute_code", sandbox_execution_node)

    # Define the graph's edges (the flow of control)
    workflow.set_entry_point("planner")
    workflow.add_edge("planner", "generate_code")
    workflow.add_edge("generate_code", "execute_code")
    
    # The conditional router decides whether to loop or end
    workflow.add_conditional_edges(
        "execute_code",
        router_node,
        {"generate_code": "generate_code", "end": END}
    )

    # Compile the graph into a runnable application
    app = workflow.compile()
    return app

# A singleton instance of our compiled graph
agent_executor = create_agent_graph()