"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { SECTION_LABELS, SECTION_ORDER, type SectionType, type WorkBlock } from "@/domain/Workout";
import { BlockContent } from "@/components/wod/BlockContent";
import { RegisterTimeButton } from "@/components/wod/RegisterTimeButton";

interface WodSectionsProps {
  blocks: WorkBlock[];
  programarHref?: string;
  isEditing?: boolean;
}

/**
 * Navegación horizontal por sección (calentamiento → fuerza → levantamiento →
 * gimnasia → metcon → wod → accesorios) con scroll-snap nativo (funciona con
 * el dedo en móvil) más arrastre con el mouse (clic sostenido) en escritorio.
 * No cambia de día al llegar al final — eso solo pasa por el semanario. Solo
 * se navega/pagina entre las secciones que el Head Coach incluyó ese día —
 * una sección sin bloques de trabajo no genera parada en el swipe ni punto en
 * el paginado. Cada sección puede tener varios bloques de trabajo (ej. "WOD
 * A"/"WOD B") que se muestran apilados; el botón "Registrar tiempo" aparece
 * una sola vez por sección "wod", sin importar cuántos bloques tenga.
 */
export function WodSections({ blocks, programarHref, isEditing = false }: WodSectionsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{ startX: number; startScrollLeft: number } | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const sectionTypes: SectionType[] = SECTION_ORDER.filter((type) =>
    blocks.some((b) => b.sectionType === type)
  );
  const clampedActiveIndex = Math.min(activeIndex, Math.max(sectionTypes.length - 1, 0));

  function blocksFor(type: SectionType): WorkBlock[] {
    return blocks.filter((b) => b.sectionType === type).sort((a, b) => a.orderIndex - b.orderIndex);
  }

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
        {SECTION_LABELS[sectionTypes[clampedActiveIndex]]}
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
          <div key={type} className="flex w-full shrink-0 snap-center flex-col gap-6 px-5 pb-8">
            {blocksFor(type).map((block, i) => (
              <BlockContent key={i} block={block} />
            ))}
            {type === "wod" && <RegisterTimeButton />}
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
              aria-label={`Ir a ${SECTION_LABELS[type]}`}
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
