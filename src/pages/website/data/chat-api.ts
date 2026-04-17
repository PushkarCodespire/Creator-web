import { CHAT_CONFIG, isChatWiredUp } from "./config";

export type ChatMessage = {
  id: string;
  content: string;
  senderType: "USER" | "AI" | "CREATOR";
  createdAt?: string;
};

export class ChatApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "ChatApiError";
    this.status = status;
  }
}

type StartConversationResult = {
  conversationId: string;
  creatorDisplayName?: string;
};

async function post<T>(path: string, body: unknown, guestId: string): Promise<T> {
  if (!isChatWiredUp()) {
    throw new ChatApiError("Chat API is not configured", 0);
  }
  const res = await fetch(`${CHAT_CONFIG.apiUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-guest-id": guestId,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new ChatApiError(
      `Chat API ${path} failed: ${res.status} ${text}`.trim(),
      res.status,
    );
  }
  const json = (await res.json()) as { success: boolean; data: T };
  if (!json.success) {
    throw new ChatApiError(`Chat API ${path} returned success:false`);
  }
  return json.data;
}

export async function startConversation(
  creatorBackendId: string,
  guestId: string,
): Promise<StartConversationResult> {
  const data = await post<{
    conversation: { id: string };
    creator: { id: string; displayName?: string };
  }>("/chat/start", { creatorId: creatorBackendId }, guestId);
  return {
    conversationId: data.conversation.id,
    creatorDisplayName: data.creator.displayName,
  };
}

export async function sendMessage(
  conversationId: string,
  content: string,
  guestId: string,
): Promise<{ userMessage: ChatMessage; aiMessage: ChatMessage | null }> {
  const data = await post<{
    userMessage: ChatMessage;
    aiMessage: ChatMessage | null;
  }>("/chat/message", { conversationId, content }, guestId);
  return data;
}
