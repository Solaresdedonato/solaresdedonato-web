import type { DriveFile } from '@/features/contenido/schemas/drive.schema'

// En prod, miniaturaUrl es nuestro proxy (/v1/drive/archivo/{id}/miniatura, pedido como
// blob con axios) — acá usamos las mismas URLs de Unsplash que ya sirven de seed en
// contenido.ts, para que el picker se vea con fotos reales sin depender de la red real.
export const driveFilesSeed: DriveFile[] = [
  {
    id: 'drive-file-1',
    nombre: 'IMG_20260812_143210.jpg',
    mimeType: 'image/jpeg',
    tamanioBytes: 2_845_120,
    anchoPx: 4032,
    altoPx: 3024,
    fechaCreacion: '2026-08-12T14:32:10',
    miniaturaUrl: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=400&q=70',
    yaImportado: false,
    contenidoMediaId: null,
  },
  {
    id: 'drive-file-2',
    nombre: 'IMG_20260812_143512.jpg',
    mimeType: 'image/jpeg',
    tamanioBytes: 3_102_450,
    anchoPx: 4032,
    altoPx: 3024,
    fechaCreacion: '2026-08-12T14:35:12',
    miniaturaUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&q=70',
    yaImportado: false,
    contenidoMediaId: null,
  },
  {
    id: 'drive-file-3',
    nombre: 'fachada-pinamar-dron.jpg',
    mimeType: 'image/jpeg',
    tamanioBytes: 4_512_800,
    anchoPx: 5472,
    altoPx: 3648,
    fechaCreacion: '2026-08-10T09:15:00',
    miniaturaUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=70',
    // Ya está en la biblioteca: ejercita el badge "En biblioteca" del picker y el 409
    // de ImportarContenidoDesdeDrive si igual se intenta importar.
    yaImportado: true,
    contenidoMediaId: 3,
  },
  {
    id: 'drive-file-4',
    nombre: 'amenities-rooftop.png',
    mimeType: 'image/png',
    tamanioBytes: 1_820_330,
    anchoPx: 3024,
    altoPx: 4032,
    fechaCreacion: '2026-08-09T18:40:00',
    miniaturaUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&q=70',
    yaImportado: false,
    contenidoMediaId: null,
  },
  {
    id: 'drive-file-5',
    nombre: 'avance-obra-julio.webp',
    mimeType: 'image/webp',
    tamanioBytes: 2_204_600,
    anchoPx: 3840,
    altoPx: 2160,
    fechaCreacion: '2026-08-05T11:20:00',
    miniaturaUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=70',
    yaImportado: false,
    contenidoMediaId: null,
  },
  {
    id: 'drive-file-6',
    nombre: 'planos-unidad-3B.pdf',
    mimeType: 'application/pdf',
    tamanioBytes: 512_000,
    anchoPx: null,
    altoPx: null,
    fechaCreacion: '2026-08-01T10:00:00',
    // Sin miniatura real (Drive no genera thumbnail de PDF acá) — ejercita el tile
    // deshabilitado por mimeType no soportado.
    miniaturaUrl: null,
    yaImportado: false,
    contenidoMediaId: null,
  },
  {
    id: 'drive-file-7',
    nombre: 'recorrido-drone-agosto.mp4',
    mimeType: 'video/mp4',
    tamanioBytes: 48_300_000,
    // Drive sí genera poster frame para video (a diferencia de un PDF), y también
    // devuelve dimensiones vía videoMediaMetadata — ver GoogleDriveArchivoExternoAdapter.
    anchoPx: 1920,
    altoPx: 1080,
    fechaCreacion: '2026-07-28T16:00:00',
    miniaturaUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&q=70',
    yaImportado: false,
    contenidoMediaId: null,
  },
  {
    id: 'drive-file-roto',
    nombre: 'roto.jpg',
    mimeType: 'image/jpeg',
    tamanioBytes: 900_000,
    anchoPx: 1200,
    altoPx: 800,
    fechaCreacion: '2026-07-20T08:00:00',
    // Sin miniatura a propósito: el handler de importación siempre devuelve 502 para
    // este id, para poder desarrollar/testear la rama de error del picker.
    miniaturaUrl: null,
    yaImportado: false,
    contenidoMediaId: null,
  },
]
