import { ENV } from "./env";

export type Role = "system" | "user" | "assistant" | "tool" | "function";

export type TextContent = {
  type: "text";
  text: string;
};

export type ImageContent = {
  type: "image_url";
  image_url: {
    url: string;
    detail?: "auto" | "low" | "high";
  };
};

export type FileContent = {
  type: "file_url";
  file_url: {
    url: string;
    mime_type?:
      | "audio/mpeg"
      | "audio/wav"
      | "application/pdf"
      | "audio/mp4"
      | "video/mp4";
  };
};

export type MessageContent = string | TextContent | ImageContent | FileContent;

export type Message = {
  role: Role;
  content: MessageContent | MessageContent[];
  name?: string;
  tool_call_id?: string;
};

export type Tool = {
  type: "function";
  function: {
    name: string;
    description?: string;
    parameters?: Record<string, unknown>;
  };
};

export type ToolChoicePrimitive = "none" | "auto" | "required";
export type ToolChoiceByName = { name: string };
export type ToolChoiceExplicit = {
  type: "function";
  function: {
    name: string;
  };
};

export type ToolChoice =
  | ToolChoicePrimitive
  | ToolChoiceByName
  | ToolChoiceExplicit;

export type InvokeParams = {
  messages?: Message[];
  model?: string;
  tools?: Tool[];
  toolChoice?: ToolChoice;
  tool_choice?: ToolChoice;
  maxTokens?: number;
  max_tokens?: number;
  outputSchema?: OutputSchema;
  output_schema?: OutputSchema;
  responseFormat?: ResponseFormat;
  response_format?: ResponseFormat;
};

export type ToolCall = {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
};

export type InvokeResult = {
  id: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: Role;
      content: string | Array<TextContent | ImageContent | FileContent>;
      tool_calls?: ToolCall[];
    };
    finish_reason: string | null;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

export type JsonSchema = {
  name: string;
  schema: Record<string, unknown>;
  strict?: boolean;
};

export type OutputSchema = JsonSchema;

export type ResponseFormat =
  | { type: "text" }
  | { type: "json_object" }
  | { type: "json_schema"; json_schema: JsonSchema };

const ensureArray = (
  value: MessageContent | MessageContent[]
): MessageContent[] => (Array.isArray(value) ? value : [value]);

const normalizeContentPart = (
  part: MessageContent
): TextContent | ImageContent | FileContent => {
  if (typeof part === "string") {
    return { type: "text", text: part };
  }

  if (part.type === "text") {
    return part;
  }

  if (part.type === "image_url") {
    return part;
  }

  if (part.type === "file_url") {
    return part;
  }

  throw new Error("Unsupported message content part");
};

const normalizeMessage = (message: Message) => {
  const { role, name, tool_call_id } = message;

  if (role === "tool" || role === "function") {
    const content = ensureArray(message.content)
      .map(part => (typeof part === "string" ? part : JSON.stringify(part)))
      .join("\n");

    return {
      role,
      name,
      tool_call_id,
      content,
    };
  }

  const contentParts = ensureArray(message.content).map(normalizeContentPart);

  // If there's only text content, collapse to a single string for compatibility
  if (contentParts.length === 1 && contentParts[0].type === "text") {
    return {
      role,
      name,
      content: contentParts[0].text,
    };
  }

  return {
    role,
    name,
    content: contentParts,
  };
};

const normalizeToolChoice = (
  toolChoice: ToolChoice | undefined,
  tools: Tool[] | undefined
): "none" | "auto" | ToolChoiceExplicit | undefined => {
  if (!toolChoice) return undefined;

  if (toolChoice === "none" || toolChoice === "auto") {
    return toolChoice;
  }

  if (toolChoice === "required") {
    if (!tools || tools.length === 0) {
      throw new Error(
        "tool_choice 'required' was provided but no tools were configured"
      );
    }

    if (tools.length > 1) {
      throw new Error(
        "tool_choice 'required' needs a single tool or specify the tool name explicitly"
      );
    }

    return {
      type: "function",
      function: { name: tools[0].function.name },
    };
  }

  if ("name" in toolChoice) {
    return {
      type: "function",
      function: { name: toolChoice.name },
    };
  }

  return toolChoice;
};

const resolveApiUrl = () => {
  // OpenRouter (GLM-4.5 Air FREE - 100% Accuracy) - Primary LLM
  if (ENV.openRouterApiKey && ENV.openRouterApiKey.trim()) {
    return "https://openrouter.ai/api/v1/chat/completions";
  }

  // Fallback: Ollama (local dev)
  if (ENV.ollamaBaseUrl) {
    return `${ENV.ollamaBaseUrl}/api/chat`;
  }

  // Fallback: Gemini
  if (ENV.geminiApiKey && ENV.geminiApiKey.trim()) {
    return `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${ENV.geminiApiKey}`;
  }

  // Fallback: OpenAI
  return "https://api.openai.com/v1/chat/completions";
};

const assertApiKey = () => {
  // OpenRouter (primary)
  if (ENV.openRouterApiKey && ENV.openRouterApiKey.trim()) {
    console.log(
      `[LLM] Using OpenRouter (${ENV.openRouterModel}) - FREE with 100% Accuracy`
    );
    return;
  }

  // Ollama (local fallback)
  if (ENV.ollamaBaseUrl) {
    console.log(
      `[LLM] Using Ollama (${ENV.ollamaModel}) at ${ENV.ollamaBaseUrl}`
    );
    return;
  }

  if (!ENV.geminiApiKey && !ENV.openAiApiKey) {
    throw new Error(
      "No LLM configured: Set OPENROUTER_API_KEY, OLLAMA_BASE_URL, GEMINI_API_KEY, or OPENAI_API_KEY"
    );
  }

  if (ENV.geminiApiKey && ENV.geminiApiKey.trim()) {
    console.log("[LLM] Using Gemini API (fallback)");
    return;
  }

  if (!ENV.openAiApiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
  console.log("[LLM] Using OpenAI API (fallback)");
};

const normalizeResponseFormat = ({
  responseFormat,
  response_format,
  outputSchema,
  output_schema,
}: {
  responseFormat?: ResponseFormat;
  response_format?: ResponseFormat;
  outputSchema?: OutputSchema;
  output_schema?: OutputSchema;
}):
  | { type: "json_schema"; json_schema: JsonSchema }
  | { type: "text" }
  | { type: "json_object" }
  | undefined => {
  const explicitFormat = responseFormat || response_format;
  if (explicitFormat) {
    if (
      explicitFormat.type === "json_schema" &&
      !explicitFormat.json_schema?.schema
    ) {
      throw new Error(
        "responseFormat json_schema requires a defined schema object"
      );
    }
    return explicitFormat;
  }

  const schema = outputSchema || output_schema;
  if (!schema) return undefined;

  if (!schema.name || !schema.schema) {
    throw new Error("outputSchema requires both name and schema");
  }

  return {
    type: "json_schema",
    json_schema: {
      name: schema.name,
      schema: schema.schema,
      ...(typeof schema.strict === "boolean" ? { strict: schema.strict } : {}),
    },
  };
};

export async function invokeLLM(params: InvokeParams): Promise<InvokeResult> {
  assertApiKey();

  const {
    messages,
    tools,
    toolChoice,
    tool_choice,
    outputSchema,
    output_schema,
    responseFormat,
    response_format,
  } = params;

  // Import Langfuse for tracing
  const { getLangfuseClient } = await import("../integrations/langfuse/client");
  const langfuse = getLangfuseClient();

  // Check which API we're using (priority: OpenRouter > Ollama > Gemini > OpenAI)
  const useOpenRouter = ENV.openRouterApiKey && ENV.openRouterApiKey.trim();
  const useOllamaApi = !useOpenRouter && ENV.ollamaBaseUrl;
  const useGeminiApi =
    !useOpenRouter &&
    !useOllamaApi &&
    ENV.geminiApiKey &&
    ENV.geminiApiKey.trim();

  // Determine model name for tracking
  const modelName = useOpenRouter
    ? ENV.openRouterModel
    : useOllamaApi
      ? ENV.ollamaModel
      : useGeminiApi
        ? "gemini-2.0-flash-exp"
        : "gpt-4o-mini";

  // Create trace if Langfuse is enabled
  const trace = langfuse?.trace({
    name: "llm-invocation",
    metadata: {
      hasTools: !!tools && tools.length > 0,
      toolCount: tools?.length || 0,
      model: modelName,
    },
  });

  // Create generation span (stringify input for Langfuse compatibility)
  const inputForLangfuse =
    messages?.map(m => ({
      role: m.role,
      content:
        typeof m.content === "string" ? m.content : JSON.stringify(m.content),
    })) || [];

  const generation = trace?.generation({
    name: "llm-call",
    input: inputForLangfuse,
    model: modelName,
  });

  const startTime = Date.now();

  let payload: Record<string, unknown>;

  if (useOpenRouter) {
    // OpenRouter format (OpenAI-compatible)
    payload = {
      model: ENV.openRouterModel,
      messages: messages?.map(normalizeMessage) || [],
    };
  } else if (useOllamaApi) {
    // Ollama format (OpenAI-compatible)
    payload = {
      model: ENV.ollamaModel,
      messages: messages?.map(normalizeMessage) || [],
      stream: false,
    };
  } else if (useGeminiApi) {
    // Gemini format
    payload = {
      contents: messages?.map(normalizeMessage).map(msg => ({
        parts: [
          {
            text:
              typeof msg.content === "string"
                ? msg.content
                : JSON.stringify(msg.content),
          },
        ],
        role: msg.role === "assistant" ? "model" : "user",
      })),
    };
  } else {
    // OpenAI format (fallback)
    payload = {
      model: "gpt-4o-mini",
      messages: messages?.map(normalizeMessage) || [],
    };
  }

  // Add OpenAI/Ollama-specific fields
  if (!useGeminiApi) {
    if (tools && tools.length > 0) {
      payload.tools = tools;
    }

    const normalizedToolChoice = normalizeToolChoice(
      toolChoice || tool_choice,
      tools
    );
    if (normalizedToolChoice) {
      payload.tool_choice = normalizedToolChoice;
    }

    payload.max_tokens = 32768;

    const normalizedResponseFormat = normalizeResponseFormat({
      responseFormat,
      response_format,
      outputSchema,
      output_schema,
    });

    if (normalizedResponseFormat) {
      payload.response_format = normalizedResponseFormat;
    }
  }

  const headers: Record<string, string> = {
    "content-type": "application/json",
  };

  // Add authorization header
  if (useOpenRouter) {
    headers.authorization = `Bearer ${ENV.openRouterApiKey}`;
    headers["HTTP-Referer"] = "https://tekup.dk"; // Optional: For rankings
    headers["X-Title"] = "Friday AI"; // Optional: For rankings
  } else if (!useOllamaApi && !useGeminiApi) {
    headers.authorization = `Bearer ${ENV.openAiApiKey}`;
  }

  try {
    const response = await fetch(resolveApiUrl(), {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `LLM invoke failed: ${response.status} ${response.statusText} – ${errorText}`
      );
    }

    const result = (await response.json()) as InvokeResult;

    // Track success in Langfuse
    const responseTime = Date.now() - startTime;

    // Extract text content from result for logging
    const outputText =
      result.choices?.[0]?.message?.content ||
      result.choices?.[0]?.message?.tool_calls
        ?.map(tc => tc.function.name)
        .join(", ") ||
      "No output";

    generation?.end({
      output: outputText,
      usage: result.usage
        ? {
            promptTokens: result.usage.prompt_tokens,
            completionTokens: result.usage.completion_tokens,
            totalTokens: result.usage.total_tokens,
          }
        : undefined,
      metadata: {
        responseTime,
        hasToolCalls: !!result.choices?.[0]?.message?.tool_calls,
        finishReason: result.choices?.[0]?.finish_reason,
      },
    });

    // Flush to Langfuse
    const { flushLangfuse } = await import("../integrations/langfuse/client");
    await flushLangfuse();

    return result;
  } catch (error) {
    // Track error in Langfuse
    const responseTime = Date.now() - startTime;
    generation?.end({
      level: "ERROR",
      statusMessage: error instanceof Error ? error.message : String(error),
      metadata: {
        responseTime,
        error: error instanceof Error ? error.message : String(error),
      },
    });

    // Flush to Langfuse
    const { flushLangfuse } = await import("../integrations/langfuse/client");
    await flushLangfuse();

    throw error;
  }
}

export async function* streamResponse(
  messages: Message[],
  params?: Omit<InvokeParams, "messages"> & { stream?: boolean }
): AsyncGenerator<string, void, unknown> {
  const {
    tools,
    toolChoice,
    tool_choice,
    outputSchema,
    output_schema,
    responseFormat,
    response_format,
    stream = true,
  } = params || {};

  // Check which API we're using (priority: OpenRouter > Ollama > Gemini > OpenAI)
  const useOpenRouter = ENV.openRouterApiKey && ENV.openRouterApiKey.trim();
  const useOllamaApi = !useOpenRouter && ENV.ollamaBaseUrl;
  const useGeminiApi =
    !useOpenRouter &&
    !useOllamaApi &&
    ENV.geminiApiKey &&
    ENV.geminiApiKey.trim();

  let payload: Record<string, unknown>;

  if (useOpenRouter) {
    // OpenRouter format (OpenAI-compatible)
    payload = {
      model: ENV.openRouterModel,
      messages: messages.map(normalizeMessage),
      stream,
    };
  } else if (useOllamaApi) {
    // Ollama format (OpenAI-compatible)
    payload = {
      model: ENV.ollamaModel,
      messages: messages.map(normalizeMessage),
      stream,
    };
  } else if (useGeminiApi) {
    // Gemini format
    payload = {
      contents: messages.map(normalizeMessage).map(msg => ({
        parts: [
          {
            text:
              typeof msg.content === "string"
                ? msg.content
                : JSON.stringify(msg.content),
          },
        ],
        role: msg.role === "assistant" ? "model" : "user",
      })),
      generationConfig: {
        temperature: 0.7,
      },
    };
  } else {
    // OpenAI format (fallback)
    payload = {
      model: "gpt-4o-mini",
      messages: messages.map(normalizeMessage),
      stream,
    };
  }

  // Add tools if provided
  if (tools && tools.length > 0) {
    payload.tools = tools;
    if (toolChoice || tool_choice) {
      payload.tool_choice = toolChoice || tool_choice;
    }
  }

  // Add response format if provided (only for OpenAI/OpenRouter)
  if ((useOpenRouter || (!useOllamaApi && !useGeminiApi)) && responseFormat) {
    const normalizedResponseFormat = normalizeResponseFormat({
      responseFormat,
    });
    if (normalizedResponseFormat) {
      payload.response_format = normalizedResponseFormat;
    }
  }

  const headers: Record<string, string> = {
    "content-type": "application/json",
  };

  // Add authorization header
  if (useOpenRouter) {
    headers.authorization = `Bearer ${ENV.openRouterApiKey}`;
    headers["HTTP-Referer"] = "https://tekup.dk"; // Optional: For rankings
    headers["X-Title"] = "Friday AI"; // Optional: For rankings
  } else if (!useOllamaApi && !useGeminiApi) {
    headers.authorization = `Bearer ${ENV.openAiApiKey}`;
  }

  const response = await fetch(resolveApiUrl(), {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `LLM stream failed: ${response.status} ${response.statusText} – ${errorText}`
    );
  }

  if (!response.body) {
    throw new Error("Response body is null");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6).trim();
          if (data === "[DONE]") return;

          try {
            const parsed = JSON.parse(data);
            const content =
              parsed.choices?.[0]?.delta?.content ||
              parsed.candidates?.[0]?.content?.parts?.[0]?.text ||
              "";
            if (content) {
              yield content;
            }
          } catch (e) {
            // Ignore parsing errors for malformed chunks
            continue;
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
