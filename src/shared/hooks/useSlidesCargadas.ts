import { useState } from 'react'

/**
 * Carruseles (hero, galería): todas las slides están en el DOM y se muestran/ocultan
 * con opacity, así que si todas llevan su background-image el navegador baja todas las
 * fotos de entrada. Este hook dice qué slides ya merecen su imagen: las que ya se
 * mostraron (quedan pintadas para el fundido de salida y para volver sin parpadeo), la
 * siguiente (precargada para el próximo cambio) y, si `conAnterior`, la anterior — para
 * los carruseles donde el usuario puede ir hacia atrás.
 */
export function useSlidesCargadas(actual: number, total: number, conAnterior = false) {
  const [vistas, setVistas] = useState<ReadonlySet<number>>(() => new Set([actual]))
  // Ajuste de estado durante el render (patrón recomendado por React para derivar de props)
  // en vez de un effect: la slide nueva ya sale con imagen en el mismo render.
  if (!vistas.has(actual)) setVistas(new Set(vistas).add(actual))

  return (i: number) =>
    vistas.has(i) ||
    i === actual ||
    (total > 0 && i === (actual + 1) % total) ||
    (conAnterior && total > 0 && i === (actual - 1 + total) % total)
}
