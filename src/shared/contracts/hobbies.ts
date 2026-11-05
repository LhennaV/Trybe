// Hobbies contract (TRD sections 8.2 and 10). Draft: changes need agreement
// from both owners.

import { z } from "zod";

// "has": already does it. "trying": wants to try it (PROF-01).
export const HOBBY_LEVELS = ["has", "trying"] as const;
export const hobbyLevelSchema = z.enum(HOBBY_LEVELS);
export type HobbyLevel = z.infer<typeof hobbyLevelSchema>;

export const hobbySchema = z.object({
  id: z.uuid(),
  name: z.string(),
  // Stable, URL-safe key, for example "film-photography". Use it in links and
  // filters instead of the display name.
  slug: z.string(),
});
export type Hobby = z.infer<typeof hobbySchema>;

// GET /api/hobbies -> { data: Hobby[] }, sorted by name.
export const hobbyListSchema = z.array(hobbySchema);
