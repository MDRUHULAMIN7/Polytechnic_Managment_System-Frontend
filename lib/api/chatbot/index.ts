import { API_BASE_URL, ensureApiBaseUrl } from "@/lib/api/dashboard/api";
import type {
  ChatbotApiResponse,
  ChatbotConversationMessage,
  ChatbotReply
} from "@/lib/type/chatbot";

async function parseChatbotResponse(
  response: Response,
  fallbackMessage: string
): Promise<ChatbotApiResponse> {
  const text = await response.text();

  try {
    return JSON.parse(text) as ChatbotApiResponse;
  } catch {
    const preview = text.slice(0, 180).replace(/\s+/g, " ").trim();
    throw new Error(
      preview
        ? `${fallbackMessage} Received: ${preview}`
        : `${fallbackMessage} Invalid JSON response.`
    );
  }
}

export async function askPublicChatbot(
  question: string,
  messages: ChatbotConversationMessage[]
): Promise<ChatbotReply> {
  ensureApiBaseUrl();

  const response = await fetch(`${API_BASE_URL}/chatbot/ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ question, messages })
  });

  const payload = await parseChatbotResponse(
    response,
    "Failed to get chatbot answer."
  );

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to get chatbot answer.");
  }

  return payload.data;
}
