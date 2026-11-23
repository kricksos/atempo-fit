"use client";

import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";

function position(anchor: HTMLDivElement | null) {
  const width = Math.min(400, document.documentElement.clientWidth - 32);
  const top = window.innerWidth < 640 ? 16 : Math.max(16, Math.min((anchor?.getBoundingClientRect().bottom ?? 8) + 8, window.innerHeight - 200));
  const left = window.innerWidth < 640 ? Math.max(16, (document.documentElement.clientWidth - width) / 2) : Math.max(16, Math.min((anchor?.getBoundingClientRect().right ?? width + 16) - width, document.documentElement.clientWidth - width - 16));
  return { top, left, width, maxHeight: Math.max(1, Math.min(544, window.innerHeight - top - 16)) };
}

export function HeaderMenuPopover({ anchorRef, id, titleId, onClose, children }: { anchorRef: RefObject<HTMLDivElement | null>; id: string; titleId: string; onClose: (restoreFocus: boolean) => void; children: ReactNode }) {
  const panelRef = useRef<HTMLElement>(null);
  const [placement, setPlacement] = useState<ReturnType<typeof position> | null>(null);
  const isPlaced = placement !== null;

  useEffect(() => {
    function updatePosition() { setPlacement(position(anchorRef.current)); }
    function outside(event: PointerEvent) {
      if (event.target instanceof Node && !anchorRef.current?.contains(event.target) && !panelRef.current?.contains(event.target)) onClose(false);
    }
    function keydown(event: KeyboardEvent) { if (event.key === "Escape") { event.preventDefault(); onClose(true); } }
    const frame = window.requestAnimationFrame(updatePosition);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", keydown);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", keydown);
    };
  }, [anchorRef, onClose]);

  useEffect(() => {
    if (isPlaced) panelRef.current?.focus();
  }, [isPlaced]);

  return createPortal(<>
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[90] bg-[#102a35]/10" />
    <section id={id} ref={panelRef} tabIndex={-1} aria-labelledby={titleId} style={placement ?? { visibility: "hidden" }} className="fixed z-[100] overflow-y-auto rounded-[1.5rem] border border-[#e1e7eb] bg-white p-4 text-left text-[#172f3b] shadow-[0_20px_50px_rgba(16,54,58,0.18)] focus:outline-none sm:p-5">{children}</section>
  </>, document.body);
}
