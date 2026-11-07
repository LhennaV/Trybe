"use client";

import { useEffect } from "react";

const HIDE_AFTER_MS = 900;
// How far inside the scrollbar the mouse counts as "near" it, in CSS px.
const NEAR_EDGE_PX = 10;

// Shows a scrollbar only while its scroller is scrolling, or while the mouse is
// over the scrollbar edge (see the scrollbar rules in globals.css). Scroll is
// heard in the capture phase so inner scrollers like the chat list count too.
export default function ScrollbarAutoHide() {
  useEffect(() => {
    const root = document.documentElement;
    const timers = new Map<Element, number>();
    let near = new Set<Element>();

    const onScroll = (event: Event) => {
      const target = event.target === document ? root : event.target;
      if (!(target instanceof Element)) return;

      target.classList.add("is-scrolling");
      window.clearTimeout(timers.get(target));
      timers.set(
        target,
        window.setTimeout(() => {
          target.classList.remove("is-scrolling");
          timers.delete(target);
        }, HIDE_AFTER_MS),
      );
    };

    // Is the pointer over this element's vertical scrollbar, or just inside it?
    const isNearScrollbar = (element: Element, x: number, y: number) => {
      if (element.scrollHeight <= element.clientHeight) return false;
      const overflow = getComputedStyle(element).overflowY;
      if (overflow !== "auto" && overflow !== "scroll") return false;
      const rect = element.getBoundingClientRect();
      const barStart = rect.left + element.clientLeft + element.clientWidth;
      return y >= rect.top && y <= rect.bottom && x >= barStart - NEAR_EDGE_PX && x <= rect.right;
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const { clientX: x, clientY: y } = event;
      const next = new Set<Element>();

      if (root.scrollHeight > root.clientHeight && x >= root.clientWidth - NEAR_EDGE_PX) next.add(root);
      for (let element = event.target instanceof Element ? event.target : null; element && element !== root; element = element.parentElement) {
        if (element !== document.body && isNearScrollbar(element, x, y)) next.add(element);
      }

      near.forEach((element) => {
        if (!next.has(element)) element.classList.remove("scrollbar-near");
      });
      next.forEach((element) => element.classList.add("scrollbar-near"));
      near = next;
    };

    // Mouse left the window: nothing is hovered any more.
    const onPointerLeave = () => {
      near.forEach((element) => element.classList.remove("scrollbar-near"));
      near = new Set();
    };

    document.addEventListener("scroll", onScroll, { capture: true, passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave);
    return () => {
      document.removeEventListener("scroll", onScroll, { capture: true });
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      timers.forEach((timer, element) => {
        window.clearTimeout(timer);
        element.classList.remove("is-scrolling");
      });
      onPointerLeave();
    };
  }, []);

  return null;
}
