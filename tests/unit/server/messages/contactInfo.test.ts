import { describe, expect, it } from "vitest";
import { asksForContact } from "@/server/messages/contactInfo";

// CHAT-04: the warning for messages that move the chat outside Trybe.
describe("asksForContact", () => {
  it.each([
    "call me 09171234567",
    "my number is 0917 123 4567",
    "+63 917-123-4567",
    "+639171234567",
    "reach me at ana@example.com",
    "add me on viber",
    "WhatsApp na lang tayo",
    "message me on Messenger",
    "ig ko: ana.makes",
    "dm me on instagram",
    "pm me pls",
    "ano number mo?",
    "can I get your number",
    "text mo ako",
    "tawagan mo ako mamaya",
  ])("flags %j", (text) => {
    expect(asksForContact(text)).toBe(true);
  });

  it.each([
    "Is the wheel still available?",
    "I can add 500 pesos",
    "Meet at SM North at 3pm?",
    "It has 2 bats and 1 splash pan",
    "Would you take 1,500 for it?",
    "See you on the 14th!",
    "The kiln reaches 1260 degrees",
    "Tiger figure, big",
  ])("leaves %j alone", (text) => {
    expect(asksForContact(text)).toBe(false);
  });
});
