"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { BLOCK_LABELS, BLOCK_ORDER, type WorkoutBlock } from "@/domain/Workout";
import { BlockContent } from "@/components/wod/BlockContent";

interface WodSectionsProps {
  blocks: WorkoutBlock[];
  programarHref?: string;
  isEditing?: boolean;
}

/**
 * Navegación horizontal por sección (calentamiento → fuerza → habilidad →
 * wod → accesorios) con scroll-snap nativo (funciona con el dedo en
 * móvil) más arrastre con el mouse (clic sostenido) en escritorio. No
 * cambia de día al llegar al final — eso solo pasa por el semanario.
 * Solo se navega/pagina entre las secciones que el Head Coach incluyó
 * ese día — un bloque sin programar no genera parada en el swipe ni
 * punto en el paginado.
 */
export function WodSections({ blocks, programarHref, isEditing = false }: WodSectionsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{ startX: number; startScrollLeft: number } | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const sectionTypes = BLOCK_ORDER.filter((type) => blocks.some((b) => b.blockType === type));
  const clampedActiveIndex = Math.min(activeIndex, Math.max(sectionTypes.length - 1, 0));

  function handleScroll() {
    const el = containerRef.current;
    if (!el || el.clientWidth === 0) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    setActiveIndex(Math.min(sectionTypes.length - 1, Math.max(0, index)));
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
    goTo(Math.min(sectionTypes.length - 1, Math.max(0, index)));
  }

  if (sectionTypes.length === 0) {
    return (
      <div className="relative flex flex-1 flex-col">
        <div className="flex flex-1 flex-col items-center justify-center px-5 text-center">
          <p className="text-sm text-text-muted">Aún no hay programación para este día.</p>
        </div>

        {programarHref && (
          <Link
            href={programarHref}
            aria-label={isEditing ? "Editar programación" : "Programar"}
            className="fixed bottom-[92px] right-5 z-20 flex h-[52px] w-[52px] items-center justify-center bg-black"
          >
            {isEditing ? (
              <Pencil size={22} strokeWidth={1.5} className="text-white" />
            ) : (
              <Plus size={24} strokeWidth={1.5} className="text-white" />
            )}
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="relative flex flex-1 flex-col">
      <p className="label-heading px-5 pb-4 text-xs text-text-primary">
        {BLOCK_LABELS[sectionTypes[clampedActiveIndex]]}
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
        {sectionTypes.map((type) => (
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

      {sectionTypes.length > 1 && (
        <div className="flex shrink-0 items-center justify-center gap-2 pb-6">
          {sectionTypes.map((type, index) => (
            <button
              key={type}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`Ir a ${BLOCK_LABELS[type]}`}
              aria-current={index === clampedActiveIndex ? "true" : undefined}
              className="flex h-4 w-4 items-center justify-center"
            >
              <span
                className={
                  index === clampedActiveIndex
                    ? "h-[7px] w-[7px] bg-black"
                    : "h-[5px] w-[5px] bg-text-muted"
                }
              />
            </button>
          ))}
        </div>
      )}

      {programarHref && (
        <Link
          href={programarHref}
          aria-label={isEditing ? "Editar programación" : "Programar"}
          className="fixed bottom-[92px] right-5 z-20 flex h-[52px] w-[52px] items-center justify-center bg-black"
        >
          {isEditing ? (
            <Pencil size={22} strokeWidth={1.5} className="text-white" />
          ) : (
            <Plus size={24} strokeWidth={1.5} className="text-white" />
          )}
        </Link>
      )}
    </div>
  );
}
