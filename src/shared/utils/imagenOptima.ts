import { useEffect, useState } from "react";

/**
 * Las fotos llegan del backoffice en tamaño original (fotos de cámara de 4000-7000px y
 * hasta ~20MB). En producción se piden a la optimización de imágenes de Vercel
 * (`/_vercel/image`, configurada en vercel.json → "images"), que las achica al ancho
 * pedido y las comprime a WebP/AVIF. En desarrollo y en tests se usa la original.
 *
 * Los anchos tienen que estar en `images.sizes` de vercel.json.
 */
export const ANCHOS = [256, 640, 1080, 1920, 2560] as const;
export type Ancho = (typeof ANCHOS)[number];

let optimizacionDisponible = import.meta.env.PROD;

export function imagenOptima(
  url: string | undefined,
  ancho: Ancho,
  calidad = 75,
): string | undefined {
  if (!url || !optimizacionDisponible) return url;
  if (url.startsWith("data:") || url.endsWith(".svg")) return url;
  // Solo las fotos servidas por http(s); los assets del propio sitio ya están optimizados.
  if (!/^https?:\/\//.test(url)) return url;
  return `/_vercel/image?url=${encodeURIComponent(url)}&w=${ancho}&q=${calidad}`;
}

/** Si una imagen optimizada falla, el resto de la sesión usa las originales. */
export function desactivarOptimizacion() {
  optimizacionDisponible = false;
}

/**
 * Para fondos (background-image), donde no hay onError: precarga la versión optimizada
 * y, si falla, devuelve la original. Mientras carga devuelve la optimizada igual (el
 * navegador ya la está bajando).
 */
export function useImagenOptima(
  url: string | undefined,
  ancho: Ancho,
): string | undefined {
  const optima = imagenOptima(url, ancho);
  const [fallo, setFallo] = useState(false);
  useEffect(() => {
    if (!optima || optima === url) return;
    const img = new Image();
    img.onerror = () => {
      desactivarOptimizacion();
      setFallo(true);
    };
    img.src = optima;
    return () => {
      img.onerror = null;
    };
  }, [optima, url]);
  return fallo ? url : optima;
}

/** onError para <img>: si falla la optimizada, cambia a la original. */
export function alFallarUsarOriginal(original: string | undefined) {
  return (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (original && img.src !== original) {
      desactivarOptimizacion();
      img.removeAttribute("srcset");
      img.src = original;
    }
  };
}
