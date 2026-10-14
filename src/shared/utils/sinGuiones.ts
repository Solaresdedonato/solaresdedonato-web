/**
 * Saca los guiones que se cargan como separador desde el backoffice ("SOLARES - VILLA LURO",
 * "Farmacia Belén — Av. Rivadavia 9626"): el sitio no muestra guiones en títulos ni en ítems.
 * La raya y la semirraya (— –) siempre separan; el guion común solo cuando tiene espacios a
 * los lados, así no se tocan palabras ni números con guion ("Bel-Air", "2024-2025").
 */
export function sinGuiones(texto: string, separador = ', '): string {
  return texto
    .replace(/^\s*[-–—]+\s*|\s*[-–—]+\s*$/g, '')
    .replace(/(?:\s*[–—])+\s*|\s+-+\s+/g, separador)
    .trim()
}
