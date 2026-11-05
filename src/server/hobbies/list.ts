import "server-only";
import { asc } from "drizzle-orm";
import type { Hobby } from "@/shared/contracts/hobbies";
import { getDb } from "@/server/db";
import { hobbies } from "@/server/db/schema";

// The full hobby list, sorted by name. Used by onboarding, filters, and the
// new post flow.
export async function listHobbies(): Promise<Hobby[]> {
  return getDb()
    .select({ id: hobbies.id, name: hobbies.name, slug: hobbies.slug })
    .from(hobbies)
    .orderBy(asc(hobbies.name));
}
