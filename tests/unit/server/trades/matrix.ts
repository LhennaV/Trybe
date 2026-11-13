import type { ErrorCode } from "@/shared/contracts/common";
import type { TradeStatus } from "@/shared/contracts/trades";
import type { TradeAction, TradeActor } from "@/server/trades/stateMachine";

// The full trade rules matrix from docs/testing.md section 7.1, as data.
// Written out by hand, not computed from the state machine, so a mistake in
// one is caught by the other. The unit tests run it against transitionTrade;
// the trade database functions (Phase 3) will run it against Postgres too.

export type Expected = TradeStatus | ErrorCode;
export type MatrixCase = {
  status: TradeStatus;
  action: Exclude<TradeAction, "propose">;
  actor: TradeActor;
  expected: Expected;
};

type Row = [TradeStatus, Exclude<TradeAction, "propose">, maker: Expected, responder: Expected, outsider: Expected];

const NOT_MEMBER = "NOT_TRADE_MEMBER";
const OWN_OFFER = "CANNOT_ACCEPT_OWN_OFFER";
const NOT_PENDING = "TRADE_NOT_PENDING";
const NOT_ACCEPTED = "TRADE_NOT_ACCEPTED";

// confirm_complete on an accepted trade is covered separately (it depends on
// whether the other side already confirmed).
const ROWS: Row[] = [
  // status       action              maker          responder      outsider
  ["pending", "counter", OWN_OFFER, "pending", NOT_MEMBER],
  ["pending", "accept", OWN_OFFER, "accepted", NOT_MEMBER],
  ["pending", "decline", OWN_OFFER, "declined", NOT_MEMBER],
  ["pending", "cancel", "cancelled", "cancelled", NOT_MEMBER],
  ["pending", "confirm_complete", NOT_ACCEPTED, NOT_ACCEPTED, NOT_MEMBER],

  ["accepted", "counter", NOT_PENDING, NOT_PENDING, NOT_MEMBER],
  ["accepted", "accept", NOT_PENDING, NOT_PENDING, NOT_MEMBER],
  ["accepted", "decline", NOT_PENDING, NOT_PENDING, NOT_MEMBER],
  ["accepted", "cancel", "cancelled", "cancelled", NOT_MEMBER],

  ...(["completed", "declined", "cancelled"] as const).flatMap((status): Row[] => [
    [status, "counter", NOT_PENDING, NOT_PENDING, NOT_MEMBER],
    [status, "accept", NOT_PENDING, NOT_PENDING, NOT_MEMBER],
    [status, "decline", NOT_PENDING, NOT_PENDING, NOT_MEMBER],
    [status, "cancel", NOT_PENDING, NOT_PENDING, NOT_MEMBER],
    [status, "confirm_complete", NOT_ACCEPTED, NOT_ACCEPTED, NOT_MEMBER],
  ]),
];

export const TRADE_MATRIX: MatrixCase[] = ROWS.flatMap(([status, action, maker, responder, outsider]) => [
  { status, action, actor: "maker" as const, expected: maker },
  { status, action, actor: "responder" as const, expected: responder },
  { status, action, actor: "outsider" as const, expected: outsider },
]);
