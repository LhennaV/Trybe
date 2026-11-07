import "server-only";
import { eq } from "drizzle-orm";
import type { Me, UpdateMe } from "@/shared/contracts/users";
import type { SessionUser } from "@/server/auth/session";
import { findPgError, PG_FOREIGN_KEY_VIOLATION, PG_UNIQUE_VIOLATION } from "@/server/db/pgError";
import { userHobbies, users } from "@/server/db/schema";
import { withActor } from "@/server/db/withActor";
import { AppError } from "@/server/errors";
import { getMe } from "@/server/users/profile";

type UserColumns = Partial<Pick<typeof users.$inferInsert, "displayName" | "handle" | "bio" | "city" | "messagePermission">>;

// Maps the input to column values, leaving out fields that weren't sent.
// Columns are listed one by one so a new contract field never reaches the
// table by accident. An empty bio clears it.
export function toUserColumns(input: UpdateMe): UserColumns {
  const { displayName, handle, city, messagePermission, bio } = input;
  const columns: UserColumns = { displayName, handle, city, messagePermission, bio: bio === "" ? null : bio };
  return Object.fromEntries(Object.entries(columns).filter(([, value]) => value !== undefined));
}

// PATCH /api/me. `hobbies`, when sent, replaces the whole list.
export async function updateMe(user: SessionUser, input: UpdateMe): Promise<Me> {
  const columns = toUserColumns(input);

  try {
    await withActor(user.id, async (tx) => {
      // Lock the row so two edits at once apply one after the other.
      const [row] = await tx.select({ id: users.id }).from(users).where(eq(users.id, user.id)).for("update");
      if (!row) throw new AppError("PROFILE_NOT_FOUND");

      if (Object.keys(columns).length > 0) {
        await tx.update(users).set(columns).where(eq(users.id, user.id));
      }

      if (input.hobbies) {
        await tx.delete(userHobbies).where(eq(userHobbies.userId, user.id));
        if (input.hobbies.length > 0) {
          await tx
            .insert(userHobbies)
            .values(input.hobbies.map((h) => ({ userId: user.id, hobbyId: h.hobbyId, level: h.level })));
        }
      }
    });
  } catch (error) {
    throw toUpdateError(error);
  }

  return getMe(user);
}

// Turns known constraint failures into errors the app can show.
export function toUpdateError(error: unknown): unknown {
  const pg = findPgError(error);
  if (pg?.code === PG_UNIQUE_VIOLATION && pg.constraint === "uq_users_handle") {
    return new AppError("HANDLE_TAKEN", undefined, { handle: ["Someone already has that handle."] });
  }
  if (pg?.code === PG_FOREIGN_KEY_VIOLATION && pg.constraint === "user_hobbies_hobby_id_hobbies_id_fk") {
    return new AppError("VALIDATION_FAILED", "One of those hobbies doesn't exist.", {
      hobbies: ["Pick hobbies from the list."],
    });
  }
  return error;
}
