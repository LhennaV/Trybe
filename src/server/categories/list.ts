import "server-only";
import { asc, eq } from "drizzle-orm";
import type { Category } from "@/shared/contracts/items";
import { getDb } from "@/server/db";
import { categories, hobbies } from "@/server/db/schema";

// GET /api/categories?hobby=<slug>. Every category (about 75), or one hobby's,
// in display order with "Other" last. Small enough to send whole.
export async function listCategories(hobbySlug?: string): Promise<Category[]> {
  const query = getDb()
    .select({ id: categories.id, name: categories.name, hobbyId: categories.hobbyId })
    .from(categories)
    .innerJoin(hobbies, eq(hobbies.id, categories.hobbyId))
    .orderBy(asc(hobbies.name), asc(categories.position), asc(categories.name));
  return hobbySlug ? query.where(eq(hobbies.slug, hobbySlug)) : query;
}
