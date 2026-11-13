import type { TradeStatus } from "@/shared/contracts/trades";
import { AppError } from "@/server/errors";

// The trade state machine (TRD section 11, docs/testing.md section 7.1).
//
// The single written-down version of who may do what to a trade, and what
// state it ends up in. It decides; it doesn't touch the database. The trade
// database functions (app.trade_accept and the rest, docs/database.md section
// 5) enforce the same rules under a row lock, and their tests reuse the same
// matrix (tests/unit/server/trades/matrix.ts).
//
// Errors come out as AppError codes the API already maps to HTTP statuses:
//   NOT_TRADE_MEMBER         403  not one of the two people in the trade
//   CANNOT_ACCEPT_OWN_OFFER  403  answering your own offer (TRD-04)
//   TRADE_NOT_PENDING        409  the trade already moved on
//   TRADE_NOT_ACCEPTED       409  completing a trade that isn't accepted
// Checks run in that order of importance: membership, then status, then who
// made the offer. So a maker countering an accepted trade gets 409, not 403.

export type TradeAction = "propose" | "counter" | "accept" | "decline" | "cancel" | "confirm_complete";

// Who is acting, relative to the current offer (docs/testing.md wording):
// maker made the current offer, responder is the other person in the trade,
// outsider is anyone else.
export type TradeActor = "maker" | "responder" | "outsider";

export type TradeTransitionInput =
  // A new trade. Who may propose (verified email, not to yourself, items up
  // for trade) is checked by the propose function, not here.
  | { status: null; action: "propose" }
  | {
      status: TradeStatus;
      action: Exclude<TradeAction, "propose">;
      actor: TradeActor;
      // confirm_complete only: whether the other person already confirmed the
      // handoff. The trade completes when both have (MEET-05).
      otherSideConfirmed?: boolean;
    };

const ANSWERS = new Set<TradeAction>(["counter", "accept", "decline"]);

// The status the trade has after `action`, or an AppError if it isn't allowed.
// For confirm_complete, "accepted" means "your side is recorded, still waiting
// for the other person".
export function transitionTrade(input: TradeTransitionInput): TradeStatus {
  if (input.status === null) {
    if (input.action === "propose") return "pending";
    throw new AppError("TRADE_NOT_FOUND");
  }

  const { status, action, actor } = input;

  // 1. Only the two people in the trade can do anything to it.
  if (actor === "outsider") throw new AppError("NOT_TRADE_MEMBER");

  // 2. The action has to fit the trade's current status.
  if (action === "confirm_complete") {
    if (status !== "accepted") throw new AppError("TRADE_NOT_ACCEPTED");
    return input.otherSideConfirmed ? "completed" : "accepted";
  }

  if (action === "cancel") {
    // Either person, before completion (TRD-08, MEET-06).
    if (status === "pending" || status === "accepted") return "cancelled";
    throw new AppError("TRADE_NOT_PENDING");
  }

  if (ANSWERS.has(action)) {
    if (status !== "pending") throw new AppError("TRADE_NOT_PENDING");

    // 3. Only the person who did NOT make the current offer answers it (TRD-04).
    if (actor === "maker") throw new AppError("CANNOT_ACCEPT_OWN_OFFER");

    if (action === "counter") return "pending"; // a new offer row, same trade (TRD-03)
    if (action === "accept") return "accepted";
    return "declined";
  }

  // "propose" on an existing trade: one trade is never proposed twice.
  throw new AppError("TRADE_NOT_PENDING");
}

// True when this person can accept, decline, or counter right now (TRD-05).
// The API sends it as `canRespond`; false while pending means "waiting for
// them".
export function canRespond(status: TradeStatus, actor: TradeActor): boolean {
  return status === "pending" && actor === "responder";
}
