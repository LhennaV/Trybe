import { describe, expect, it } from "vitest";
import { ERROR_STATUS, isErrorCode } from "@/shared/contracts/common";
import { AppError } from "@/server/errors";
import { canRespond, transitionTrade } from "@/server/trades/stateMachine";
import { TRADE_MATRIX } from "./matrix";

// The trade state machine against the rules matrix (docs/testing.md 7.1).

describe("transitionTrade: the full matrix", () => {
  it.each(TRADE_MATRIX)("$status + $action by $actor -> $expected", ({ status, action, actor, expected }) => {
    const run = () => transitionTrade({ status, action, actor });

    if (isErrorCode(expected)) {
      expect(run).toThrow(AppError);
      expect(run).toThrow(expect.objectContaining({ code: expected }));
    } else {
      expect(run()).toBe(expected);
    }
  });

  it("covers every status, action, and person", () => {
    // 5 statuses x 5 actions x 3 people, minus the 2 accepted + confirm cases
    // tested below.
    expect(TRADE_MATRIX).toHaveLength(5 * 5 * 3 - 3);
  });
});

describe("proposing", () => {
  it("starts a new trade as pending", () => {
    expect(transitionTrade({ status: null, action: "propose" })).toBe("pending");
  });
});

describe("completing (MEET-05)", () => {
  it.each(["maker", "responder"] as const)("records the %s's side and waits for the other", (actor) => {
    expect(transitionTrade({ status: "accepted", action: "confirm_complete", actor })).toBe("accepted");
  });

  it.each(["maker", "responder"] as const)("completes when the %s confirms second", (actor) => {
    expect(transitionTrade({ status: "accepted", action: "confirm_complete", actor, otherSideConfirmed: true })).toBe(
      "completed",
    );
  });

  it("never lets an outsider confirm", () => {
    expect(() =>
      transitionTrade({ status: "accepted", action: "confirm_complete", actor: "outsider", otherSideConfirmed: true }),
    ).toThrow(expect.objectContaining({ code: "NOT_TRADE_MEMBER" }));
  });
});

describe("error codes map to the right HTTP status", () => {
  it("uses 403 for who you are and 409 for where the trade is", () => {
    expect(ERROR_STATUS.NOT_TRADE_MEMBER).toBe(403);
    expect(ERROR_STATUS.CANNOT_ACCEPT_OWN_OFFER).toBe(403);
    expect(ERROR_STATUS.TRADE_NOT_PENDING).toBe(409);
    expect(ERROR_STATUS.TRADE_NOT_ACCEPTED).toBe(409);
  });
});

describe("canRespond (TRD-05)", () => {
  it("is true only for the responder on a pending trade", () => {
    expect(canRespond("pending", "responder")).toBe(true);
    expect(canRespond("pending", "maker")).toBe(false);
    expect(canRespond("pending", "outsider")).toBe(false);
    expect(canRespond("accepted", "responder")).toBe(false);
  });
});
