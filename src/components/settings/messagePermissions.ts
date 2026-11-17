import type { MessagePermission } from "@/shared/contracts/users";

// Words for each "Who can message me" choice (CHAT-06). The values come from
// the contract; the default for new accounts is "anyone" (decided 2026-11-05).
export const MESSAGE_PERMISSION_COPY: Record<MessagePermission, { short: string; title: string; description: string }> = {
  anyone: {
    short: "Anyone",
    title: "Anyone on Trybe",
    description: "People you haven't traded with land in Requests first. You pick who to reply to.",
  },
  traded_only: {
    short: "Past traders",
    title: "Only people I've traded with",
    description: "People you haven't traded with can't start a chat with you.",
  },
};
