// Reads emails caught by Mailpit, the local stack's fake inbox. Nothing is
// ever sent to a real address. https://mailpit.axllent.org/docs/api-v1/

type MailpitSummary = { ID: string; Subject: string; Created: string };

const MAILPIT = () => process.env.MAILPIT_URL ?? "http://127.0.0.1:54324";

// Waits for the newest email to `to` and returns its first Trybe link
// (the /api/auth/confirm link in our templates).
export async function latestConfirmLink(to: string, { timeoutMs = 20_000 } = {}): Promise<string> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const search = await fetch(`${MAILPIT()}/api/v1/search?query=${encodeURIComponent(`to:"${to}"`)}`);
    const { messages = [] } = (await search.json()) as { messages?: MailpitSummary[] };

    if (messages.length > 0) {
      const newest = [...messages].sort((a, b) => b.Created.localeCompare(a.Created))[0];
      const message = await fetch(`${MAILPIT()}/api/v1/message/${newest.ID}`);
      const { HTML } = (await message.json()) as { HTML: string };
      const link = HTML.match(/href="([^"]*\/api\/auth\/confirm[^"]*)"/)?.[1];
      if (link) return link.replaceAll("&amp;", "&");
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`No Trybe email for ${to} within ${timeoutMs}ms.`);
}
