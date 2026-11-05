import type { MouseEvent } from 'react'
import { sinGuiones } from './sinGuiones'

/** Primera oración como entrada destacada; el resto del texto sigue igual en columnas.
 *  No corta en abreviaturas de dirección ("Av.", "Blvd.") ni antes de 40 caracteres. */
export function separarEntrada(descripcion: string) {
  const parrafos = descripcion
    .replace(/\r/g, '')
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s*\n\s*/g, ' ').trim())
    .filter(Boolean)
  const primero = parrafos[0] ?? ''
  const m = primero.match(/^[\s\S]{40,}?(?<!\b(?:Av|Blvd|Dr|Gral|Ing|N°|Sr|Sra|Pje))\.\s/)
  if (!m) return { entrada: primero, resto: parrafos.slice(1) }
  return { entrada: m[0].trim(), resto: [primero.slice(m[0].length).trim(), ...parrafos.slice(1)].filter(Boolean) }
}

/** Textos cargados TODO EN MAYÚSCULAS se muestran en tipo oración, sin tocar siglas (SUM, GYM). */
export function suavizar(texto: string) {
  const t = texto.trim()
  if (t !== t.toUpperCase()) return t
  return t
    .toLowerCase()
    .replace(/(^|\s)(\S)/g, (_, a: string, b: string) => a + b.toUpperCase())
    .replace(/\b(sum|gym)\b/gi, (w) => w.toUpperCase())
    .replace(/\b(De|Para|Y|En|La|El)\b/g, (w) => w.toLowerCase())
    .replace(/^./, (c) => c.toUpperCase())
}

/**
 * Separa el nombre del lugar de su distancia, tal como se cargan en el backoffice:
 * "Colegio X (Calle 123) — a 0,5 km" o "Plaza Y — 6 min a pie / 2 min en auto".
 * Devuelve km aproximados para ubicar el punto en el radar (null si no se puede leer).
 */
export function leerCercania(texto: string) {
  const [nombre, ...resto] = texto.split(/\s+[—–]\s+/)
  const detalle = resto.join(' ')
  let km: number | null = null
  const enKm = detalle.match(/a\s*([\d.,]+)\s*km/i)
  const aPie = detalle.match(/(\d+)(?:\s*a\s*(\d+))?\s*min a pie/i)
  if (enKm) km = parseFloat(enKm[1].replace(',', '.'))
  else if (aPie) km = Number(aPie[2] ?? aPie[1]) * 0.08
  return { nombre: sinGuiones(nombre), detalle: sinGuiones(detalle), km, completo: sinGuiones(texto) }
}

/** Lee (y borra) el punto del último clic en una card, para la apertura circular. */
export function tomarOrigenClic(): [number, number] | null {
  try {
    const o = JSON.parse(sessionStorage.getItem('rd-origen') ?? 'null')
    sessionStorage.removeItem('rd-origen')
    return Array.isArray(o) && o.length === 2 ? [Number(o[0]), Number(o[1])] : null
  } catch {
    return null
  }
}

/** Número romano al final del nombre comercial ("Solares de Donato XII" → "XII"). */
export function romanoDe(nombre: string) {
  return nombre.trim().match(/\b([IVXLC]+)$/)?.[1] ?? ''
}

/** Guarda el punto del clic para que la ficha del desarrollo se abra como un círculo
 *  que crece desde ahí (ver useAperturaCircular en DesarrolloDetalle). */
export function guardarOrigenClic(e: MouseEvent) {
  try {
    sessionStorage.setItem('rd-origen', JSON.stringify([e.clientX, e.clientY]))
  } catch {
    /* sin storage: la ficha abre desde arriba al centro */
  }
}
