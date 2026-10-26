import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { AppError } from "@/server/errors";
import { parseBody, parseQuery } from "@/server/http/parse";
import { fail, handleRoute, ok, toErrorResponse } from "@/server/http/respond";

// Builds an error shaped like a postgres-js PostgresError.
function pgError(code: string, message: string) {
  return Object.assign(new Error(message), { code });
}

async function read(response: Response) {
  return { status: response.status, body: await response.json() };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ok and fail", () => {
  it("wraps data in { data }", async () => {
    expect(await read(ok({ id: "t1" }, 201))).toEqual({ status: 201, body: { data: { id: "t1" } } });
  });

  it("uses the code's status and default message", async () => {
    const { status, body } = await read(fail("TRADE_NOT_PENDING"));
    expect(status).toBe(409);
    expect(body.error.code).toBe("TRADE_NOT_PENDING");
    expect(body.error.message).toBeTypeOf("string");
    expect(body.error).not.toHaveProperty("fields");
  });
});

describe("toErrorResponse", () => {
  it("maps an AppError to its code and message", async () => {
    const { status, body } = await read(toErrorResponse(new AppError("EMAIL_NOT_VERIFIED", "Verify first.")));
    expect(status).toBe(403);
    expect(body).toEqual({ error: { code: "EMAIL_NOT_VERIFIED", message: "Verify first." } });
  });

  it("maps a ZodError to VALIDATION_FAILED with field errors", async () => {
    const result = z.strictObject({ cash: z.object({ amount: z.number().positive() }) }).safeParse({ cash: { amount: -1 } });
    const { status, body } = await read(toErrorResponse(result.error));
    expect(status).toBe(400);
    expect(body.error.code).toBe("VALIDATION_FAILED");
    expect(Object.keys(body.error.fields)).toEqual(["cash.amount"]);
  });

  it("maps a database function's raised code", async () => {
    const { status, body } = await read(toErrorResponse(pgError("P0001", "CANNOT_ACCEPT_OWN_OFFER")));
    expect(status).toBe(403);
    expect(body.error.code).toBe("CANNOT_ACCEPT_OWN_OFFER");
  });

  it("finds the Postgres error when Drizzle wraps it", async () => {
    const wrapped = new Error("Failed query", { cause: pgError("P0001", "ITEM_NOT_AVAILABLE") });
    expect((await read(toErrorResponse(wrapped))).body.error.code).toBe("ITEM_NOT_AVAILABLE");
  });

  it.each(["40P01", "40001"])("maps SQLSTATE %s to a retryable CONFLICT", async (code) => {
    const { status, body } = await read(toErrorResponse(pgError(code, "deadlock detected")));
    expect(status).toBe(409);
    expect(body.error.code).toBe("CONFLICT");
  });

  it("hides unexpected errors behind INTERNAL_ERROR", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { status, body } = await read(toErrorResponse(new Error("password=hunter2 leaked in a stack")));
    expect(status).toBe(500);
    expect(body.error.code).toBe("INTERNAL_ERROR");
    expect(JSON.stringify(body)).not.toContain("hunter2");
  });

  it("does not trust a P0001 message that isn't a known code", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect((await read(toErrorResponse(pgError("P0001", "some raw message")))).status).toBe(500);
  });
});

describe("handleRoute", () => {
  it("passes through a successful response", async () => {
    const handler = handleRoute(async () => ok("hi"));
    expect((await read(await handler(new Request("http://x"), undefined))).body).toEqual({ data: "hi" });
  });

  it("turns a thrown error into an error response", async () => {
    const handler = handleRoute(async () => {
      throw new AppError("TRADE_NOT_FOUND");
    });
    expect((await handler(new Request("http://x"), undefined)).status).toBe(404);
  });
});

describe("parseBody", () => {
  const schema = z.strictObject({ note: z.string() });

  function post(body: string) {
    return new Request("http://x", { method: "POST", body, headers: { "content-type": "application/json" } });
  }

  it("returns the parsed body", async () => {
    expect(await parseBody(post('{"note":"hi"}'), schema)).toEqual({ note: "hi" });
  });

  it("rejects invalid JSON", async () => {
    await expect(parseBody(post("{nope"), schema)).rejects.toMatchObject({ code: "VALIDATION_FAILED" });
  });

  it("rejects unknown fields", async () => {
    await expect(parseBody(post('{"note":"hi","isAdmin":true}'), schema)).rejects.toBeInstanceOf(z.ZodError);
  });
});

describe("parseQuery", () => {
  it("reads single and repeated params", () => {
    const schema = z.strictObject({ q: z.string(), hobby: z.array(z.string()) });
    const request = new Request("http://x/api/search?q=kiln&hobby=pottery&hobby=film");
    expect(parseQuery(request, schema)).toEqual({ q: "kiln", hobby: ["pottery", "film"] });
  });
});
