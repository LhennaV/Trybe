export type NotificationKind = "offer" | "accepted" | "meetup" | "rating" | "like" | "match" | "safety";

export type AppNotification = {
  id: string;
  kind: NotificationKind;
  body: string;
  time: string;
  group: "today" | "earlier";
  unread: boolean;
  action?: { label: string; href: string };
};

// Sample notifications from the Figma prototype (NOTIF-01). The "started
// following you" one is left out while followers are an open decision.
export const SAMPLE_NOTIFICATIONS: AppNotification[] = [
  {
    id: "n1",
    kind: "offer",
    body: "@kiln.and.co sent a counter offer: your AE-1 + PHP 1,000 for their Shimpo wheel.",
    time: "2 min ago",
    group: "today",
    unread: true,
    action: { label: "Review offer", href: "/trades/ae1-shimpo" },
  },
  {
    id: "n2",
    kind: "accepted",
    body: "@mika.makes accepted your trade. Pick a safe meetup spot to lock it in.",
    time: "1 hr ago",
    group: "today",
    unread: true,
  },
  {
    id: "n3",
    kind: "meetup",
    body: "Meetup tomorrow at 10:00 AM with @mika.makes. Bring the crochet hooks!",
    time: "3 hr ago",
    group: "today",
    unread: false,
  },
  {
    id: "n4",
    kind: "rating",
    body: '@filmbyjo rated your trade 5 stars: "Camera arrived exactly as described."',
    time: "Sep 28",
    group: "earlier",
    unread: false,
  },
  {
    id: "n5",
    kind: "like",
    body: '@mika.makes and 12 others liked "Amigurumi frog, free pattern".',
    time: "Sep 25",
    group: "earlier",
    unread: false,
  },
  {
    id: "n6",
    kind: "match",
    body: "3 pottery wheels went up for trade in Quezon City.",
    time: "Sep 24",
    group: "earlier",
    unread: false,
  },
  {
    id: "n7",
    kind: "safety",
    body: 'Safety tip: Trybe never asks for a "reservation fee". Report anyone who does.',
    time: "Sep 20",
    group: "earlier",
    unread: false,
  },
];
