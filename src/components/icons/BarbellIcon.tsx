interface BarbellIconProps {
  size?: number;
  strokeWidth?: number;
  className?: string;
}

/**
 * Barra olímpica estilo CrossFit: no existe en lucide-react, así que se
 * dibuja a mano siguiendo el mismo lenguaje visual del resto de íconos de
 * la app — trazo delgado, discos rectos (sin curvas), misma API de props
 * que un ícono de lucide para poder intercambiarse en BottomNav.
 */
export function BarbellIcon({ size = 22, strokeWidth = 1.5, className }: BarbellIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <line
        x1="7"
        y1="12"
        x2="17"
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
