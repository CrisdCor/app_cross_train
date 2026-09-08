"use client";

import { useEffect, useRef, useState } from "react";
import { clsx } from "clsx";
import { X } from "lucide-react";
import { buttonClassName } from "@/components/ui/Button";

const TRANSITION_MS = 300;

/**
 * Botón "Registrar tiempo" del bloque WOD. Abre un modal tipo bottom sheet
 * (100% del ancho) con una animación suave de abajo hacia arriba al abrir
 * (y de vuelta hacia abajo al cerrar) — por ahora en construcción, solo se
 * puede cerrar con la X.
 */
export function RegisterTimeButton() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const closeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!mounted) return;
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, [mounted]);

  useEffect(() => {
    return () => {
      if (closeTimeout.current) clearTimeout(closeTimeout.current);
    };
  }, []);

  function handleOpen() {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
      closeTimeout.current = null;
    }
    setMounted(true);
  }

  function handleClose() {
    setVisible(false);
    closeTimeout.current = setTimeout(() => setMounted(false), TRANSITION_MS);
  }

  return (
    <>
      <button type="button" onClick={handleOpen} className={buttonClassName("primary", "mt-5")}>
        Registrar tiempo
      </button>

      {mounted && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className={clsx(
              "absolute inset-0 bg-black/40 transition-opacity duration-300 ease-out",
              visible ? "opacity-100" : "opacity-0"
            )}
            onClick={handleClose}
            aria-hidden
          />
          <div
            className={clsx(
              "relative z-10 flex w-full max-w-[520px] flex-col bg-white pb-safe",
              "transition-transform duration-300 ease-out",
              visible ? "translate-y-0" : "translate-y-full"
            )}
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <p className="label-heading text-sm text-text-primary">Registrar tiempo</p>
              <button type="button" onClick={handleClose} aria-label="Cerrar">
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
