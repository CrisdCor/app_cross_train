"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { BLOCK_LABELS, BLOCK_ORDER, type WorkoutBlock } from "@/domain/Workout";
import { BlockContent } from "@/components/wod/BlockContent";

interface WodSectionsProps {
  blocks: WorkoutBlock[];
  programarHref?: string;
}

/**
 * Navegación horizontal por sección (calentamiento → fuerza → habilidad →
 * wod → accesorios) con scroll-snap nativo (funciona con el dedo en
 * móvil) más arrastre con el mouse (clic sostenido) en escritorio. No
 * cambia de día al llegar al final — eso solo pasa por el semanario.
 */
export function WodSections({ blocks, programarHref }: WodSectionsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{ startX: number; startScrollLeft: number } | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  function handleScroll() {
    const el = containerRef.current;
    if (!el || el.clientWidth === 0) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    setActiveIndex(Math.min(BLOCK_ORDER.length - 1, Math.max(0, index)));
  }

  function goTo(index: number) {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({ left: index * el.clientWidth, behavior: "smooth" });
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse") return;
    const el = containerRef.current;
    if (!el) return;
    dragState.current = { startX: e.clientX, startScrollLeft: el.scrollLeft };
    el.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = containerRef.current;
    if (!el || !dragState.current) return;
    el.scrollLeft = dragState.current.startScrollLeft - (e.clientX - dragState.current.startX);
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    const el = containerRef.current;
    if (!el || !dragState.current) return;
    dragState.current = null;
    el.releasePointerCapture(e.pointerId);
    const index = Math.round(el.scrollLeft / el.clientWidth);
    goTo(Math.min(BLOCK_ORDER.length - 1, Math.max(0, index)));
  }

  return (
    <div className="relative flex flex-1 flex-col">
      <p className="label-heading px-5 pb-4 text-xs text-text-primary">
        {BLOCK_LABELS[BLOCK_ORDER[activeIndex]]}
      </p>

      <div
        ref={containerRef}
        onScroll={handleScroll}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="no-scrollbar flex flex-1 snap-x snap-mandatory overflow-x-auto overscroll-x-contain cursor-grab active:cursor-grabbing"
      >
        {BLOCK_ORDER.map((type) => (
          <div key={type} className="w-full shrink-0 snap-center px-5 pb-8">
            <BlockContent
              blockType={type}
              block={blocks.find((b) => b.blockType === type)}
              showRegisterButton
              compact
            />
          </div>
        ))}
      </div>

      {programarHref && (
        <Link
          href={programarHref}
          aria-label="Programar"
          className="fixed bottom-[92px] right-5 z-20 flex h-[52px] w-[52px] items-center justify-center bg-black"
        >
          <Plus size={24} strokeWidth={1.5} className="text-white" />
        </Link>
      )}
    </div>
  );
}
