/**
 * Tool Call Optimizer for LiteLLM
 * Handles function calling efficiently to minimize API calls
 */

interface ToolCallResult {
  tool_call_id: string;
  name: string;
  result: any;
}

export class ToolCallOptimizer {
  /**
   * Batch multiple tool calls into single request
   * Reduces API calls from N to 1
   */
  async batchToolCalls(
    toolCalls: any[],
    executor: (toolName: string, args: any) => Promise<any>
  ): Promise<ToolCallResult[]> {
    console.log(
      `🔧 [ToolOptimizer] Batching ${toolCalls.length} tool calls into parallel execution`
    );

    // Execute all tools in parallel
    const results = await Promise.all(
      toolCalls.map(async call => {
        try {
          const result = await executor(
            call.function.name,
            call.function.arguments
          );
          return {
            tool_call_id: call.id,
            name: call.function.name,
            result,
          };
        } catch (error) {
          console.error(
            `❌ [ToolOptimizer] Tool ${call.function.name} failed:`,
            error
          );
          return {
            tool_call_id: call.id,
            name: call.function.name,
            result: {
              error: error instanceof Error ? error.message : "Unknown error",
            },
          };
        }
      })
    );

    console.log(`✅ [ToolOptimizer] Completed ${results.length} tool calls`);
    return results;
  }

  /**
   * Check if tools can be cached
   * Reduces redundant tool calls
   */
  canCacheToolResult(toolName: string): boolean {
    // These tools have stable results that can be cached
    const cacheableTools = [
      "getBusinessHours",
      "getServicePricing",
      "getCompanyInfo",
      "getAvailableServices",
    ];

    return cacheableTools.includes(toolName);
  }

  /**
   * Estimate API calls needed for tool conversation
   */
  estimateApiCalls(toolCount: number): number {
    // Formula: 1 initial + 1 per tool batch + 1 final response
    return 1 + Math.ceil(toolCount / 5) + 1;
  }

  /**
   * Suggest priority based on tool usage
   */
  suggestPriority(
    hasTools: boolean,
    toolCount: number
  ): "high" | "medium" | "low" {
    if (!hasTools) return "medium";

    // More tools = higher priority (to avoid timeout)
    if (toolCount >= 3) return "high";
    if (toolCount >= 1) return "medium";
    return "low";
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      // Could track tool usage patterns here
      note: "Tool optimizer active",
    };
  }
}

export const toolOptimizer = new ToolCallOptimizer();
