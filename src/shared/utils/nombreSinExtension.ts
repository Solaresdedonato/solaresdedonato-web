export function nombreSinExtension(nombre: string): string {
  return nombre.replace(/\.[^./]+$/, '')
}
