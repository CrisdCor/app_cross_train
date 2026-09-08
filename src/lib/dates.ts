const DAY_LABELS = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"] as const;

/** Fecha de hoy en formato YYYY-MM-DD (calendario del servidor). */
export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Lunes de la semana que contiene `isoDate`, como Date a medianoche. */
export function mondayOf(isoDate: string): Date {
  const date = new Date(`${isoDate}T00:00:00Z`);
  const day = date.getUTCDay(); // 0 = domingo .. 6 = sábado
  const diff = day === 0 ? -6 : 1 - day;
  date.setUTCDate(date.getUTCDate() + diff);
  return date;
}

export function toIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Las 7 fechas (lunes a domingo) de la semana que contiene `isoDate`, con su etiqueta y número de día. */
export function weekOf(isoDate: string): { iso: string; label: string; dayNumber: string }[] {
  const monday = mondayOf(isoDate);
  return DAY_LABELS.map((label, i) => {
    const date = new Date(monday);
    date.setUTCDate(monday.getUTCDate() + i);
    return { iso: toIso(date), label, dayNumber: String(date.getUTCDate()).padStart(2, "0") };
  });
}
