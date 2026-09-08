interface SquatIconProps {
  size?: number;
  strokeWidth?: number;
  className?: string;
}

/**
 * Atleta en sentadilla con barra — no existe en lucide-react, así que se
 * dibuja a mano siguiendo el mismo lenguaje visual del resto de íconos de
 * la app (trazo delgado, discos rectos sin curvas — ver `BarbellIcon`,
 * que reemplaza en `BottomNav`), misma API de props que un ícono de
 * lucide para poder intercambiarse.
 */
export function SquatIcon({ size = 22, strokeWidth = 1.5, className }: SquatIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="4.5" r="2" stroke="currentColor" strokeWidth={strokeWidth} />
      <path
        d="M8.5 8 L15.5 8 L14 14 L10 14 Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <line x1="8.5" y1="8" x2="8.5" y2="12" stroke="currentColor" strokeWidth={strokeWidth} />
      <line x1="15.5" y1="8" x2="15.5" y2="12" stroke="currentColor" strokeWidth={strokeWidth} />
      <line x1="10" y1="14" x2="7.5" y2="21" stroke="currentColor" strokeWidth={strokeWidth} />
      <line x1="14" y1="14" x2="16.5" y2="21" stroke="currentColor" strokeWidth={strokeWidth} />
      <line
        x1="6.3"
        y1="21"
        x2="8.7"
        y2="21"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="square"
      />
      <line
        x1="15.3"
        y1="21"
        x2="17.7"
        y2="21"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="square"
      />
      <line
        x1="2"
        y1="12"
        x2="22"
        y2="12"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="square"
      />
      <rect x="0.75" y="7" width="2.25" height="10" fill="currentColor" />
      <rect x="3.75" y="9" width="1.5" height="6" fill="currentColor" />
      <rect x="21" y="7" width="2.25" height="10" fill="currentColor" />
      <rect x="18.75" y="9" width="1.5" height="6" fill="currentColor" />
    </svg>
  );
}
