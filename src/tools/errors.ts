import { BlsApiError } from "../client.js";

export function wrapError(error: unknown): { content: { type: "text"; text: string }[]; isError: true } {
  if (error instanceof BlsApiError) {
    return {
      content: [
        {
          type: "text" as const,
          text: `Error: ${error.message}${error.isRateLimit ? "\nConsider setting BLS_API_KEY for higher rate limits." : ""}`,
        },
      ],
      isError: true,
    };
  }
  return {
    content: [{ type: "text" as const, text: `Unexpected error: ${String(error)}` }],
    isError: true,
  };
}

export function wrapValidationError(message: string): { content: { type: "text"; text: string }[]; isError: true } {
  return {
    content: [{ type: "text" as const, text: `Error: ${message}` }],
    isError: true,
  };
}
