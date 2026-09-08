"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { buttonClassName } from "@/components/ui/Button";

/**
 * Botón "Registrar tiempo" del bloque WOD. Abre un modal tipo bottom sheet
 * (100% del ancho) — por ahora en construcción, solo se puede cerrar con la X.
 */
export function RegisterTimeButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={buttonClassName("primary", "mt-5")}>
        Registrar tiempo
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="relative z-10 flex w-full max-w-[520px] flex-col bg-white pb-safe">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <p className="label-heading text-sm text-text-primary">Registrar tiempo</p>
              <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar">
                <X size={20} strokeWidth={1.5} className="text-text-primary" />
              </button>
            </div>
            <div className="px-5 py-12 text-center">
              <p className="text-sm text-text-muted">
                En construcción. Muy pronto podrás registrar aquí tus tiempos y logros de este
                WOD.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
