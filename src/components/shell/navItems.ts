import { ChatCircle, House, MagnifyingGlass, User, type Icon } from "@phosphor-icons/react";

export type NavItem = {
  href: string;
  label: string;
  icon: Icon;
};

// Shared by the mobile bottom nav and the desktop sidebar. New post isn't in
// this list because both render it as its own button.
export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Feed", icon: House },
  { href: "/explore", label: "Explore", icon: MagnifyingGlass },
  { href: "/trades", label: "Trades", icon: ChatCircle },
  { href: "/profile", label: "Profile", icon: User },
];

export const NEW_POST_HREF = "/new";

export function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  // Search results belong to the Explore tab.
  if (href === "/explore" && (pathname === "/search" || pathname.startsWith("/search/"))) return true;
  return pathname === href || pathname.startsWith(`${href}/`);
}
