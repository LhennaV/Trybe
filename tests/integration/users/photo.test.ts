import sharp from "sharp";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { DELETE as deletePhoto, POST as postPhoto } from "@/app/api/me/photo/route";
import { PHOTO_FIELD, PHOTO_UPLOAD_MAX_BYTES } from "@/shared/contracts/photos";
import { accessToken, createUser, deleteUsers, readJson } from "../helpers";

// Profile photo upload (PROF-06) through the real route, real image
// processing, and the local Supabase Storage bucket from migration 0006.
const created: string[] = [];
let token: string;

beforeAll(async () => {
  const user = await createUser({ label: "photo" });
  created.push(user.id);
  token = await accessToken(user.email);
});

afterAll(async () => {
  await deleteUsers(created);
});

async function jpeg(width = 1200, height = 900) {
  return sharp({ create: { width, height, channels: 3, background: { r: 200, g: 120, b: 80 } } })
    .jpeg()
    .toBuffer();
}

function upload(body: Blob, { auth = true, type = "image/jpeg" } = {}) {
  const form = new FormData();
  form.append(PHOTO_FIELD, new File([body], "photo.jpg", { type }));
  return new Request("http://localhost/api/me/photo", {
    method: "POST",
    headers: auth ? { authorization: `Bearer ${token}` } : {},
    body: form,
  });
}

describe("POST /api/me/photo", () => {
  let firstUrl: string;

  it("returns 401 without a session", async () => {
    const response = await postPhoto(upload(new Blob([await jpeg()]), { auth: false }), undefined);
    expect(response.status).toBe(401);
  });

  it("stores a small WebP and puts its URL on the profile", async () => {
    const { status, body } = await readJson(await postPhoto(upload(new Blob([await jpeg()])), undefined));
    expect(status).toBe(200);
    firstUrl = body.data.photoUrl;
    expect(firstUrl).toContain("/storage/v1/object/public/photos/users/");

    const stored = await fetch(firstUrl);
    expect(stored.status).toBe(200);
    expect(stored.headers.get("content-type")).toBe("image/webp");
    const meta = await sharp(Buffer.from(await stored.arrayBuffer())).metadata();
    expect(Math.max(meta.width ?? 0, meta.height ?? 0)).toBeLessThanOrEqual(400);
  });

  it("replaces the photo and deletes the old file", async () => {
    const { body } = await readJson(await postPhoto(upload(new Blob([await jpeg(800, 800)])), undefined));
    expect(body.data.photoUrl).not.toBe(firstUrl);
    expect((await fetch(body.data.photoUrl)).status).toBe(200);
    expect((await fetch(firstUrl)).ok).toBe(false);
  });

  it("refuses files that aren't photos, wrong types, and oversized uploads", async () => {
    const notPhoto = await readJson(await postPhoto(upload(new Blob(["hello"])), undefined));
    expect(notPhoto.status).toBe(400);
    expect(notPhoto.body.error.fields).toHaveProperty("photo");

    const gif = await postPhoto(upload(new Blob([await jpeg()]), { type: "image/gif" }), undefined);
    expect(gif.status).toBe(400);

    const huge = await postPhoto(upload(new Blob([new Uint8Array(PHOTO_UPLOAD_MAX_BYTES + 1)])), undefined);
    expect(huge.status).toBe(400);
  });

  it("refuses a request with no photo", async () => {
    const response = await postPhoto(
      new Request("http://localhost/api/me/photo", {
        method: "POST",
        headers: { authorization: `Bearer ${token}` },
        body: new FormData(),
      }),
      undefined,
    );
    expect(response.status).toBe(400);
  });
});

describe("DELETE /api/me/photo", () => {
  it("clears the profile photo and deletes the file", async () => {
    const { body: before } = await readJson(await postPhoto(upload(new Blob([await jpeg()])), undefined));
    const request = new Request("http://localhost/api/me/photo", {
      method: "DELETE",
      headers: { authorization: `Bearer ${token}` },
    });
    const { status, body } = await readJson(await deletePhoto(request, undefined));

    expect(status).toBe(200);
    expect(body.data.photoUrl).toBeNull();
    expect((await fetch(before.data.photoUrl)).ok).toBe(false);
  });
});
