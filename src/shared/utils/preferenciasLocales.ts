/**
 * Preferencias de UI por navegador (ej. "vista previa plegada"): conveniencias que no
 * hace falta persistir en el backend ni compartir entre usuarios. localStorage puede
 * no estar disponible (modo incógnito, datos bloqueados) o tirar al escribir: en ese
 * caso se degrada al default sin romper la pantalla.
 */
export function leerPreferenciaLocal(clave: string): string | null {
  try {
    return window.localStorage.getItem(clave)
  } catch {
    return null
  }
}

export function guardarPreferenciaLocal(clave: string, valor: string): void {
  try {
    window.localStorage.setItem(clave, valor)
  } catch {
    // Sin persistencia: la preferencia vale solo para esta sesión de la pantalla.
  }
}
