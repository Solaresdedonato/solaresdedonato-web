import { http, HttpResponse, delay } from 'msw'
import { desarrollosSeed } from './data/desarrollos'
import { contenidoSeed } from './data/contenido'
import { consultaContactoSeed, registroBrokerSeed } from './data/consultas'
import { driveFilesSeed } from './data/driveFiles'
import { ADMIN_EMAIL, ADMIN_NOMBRE, ADMIN_PASSWORD } from './data/usuarioAdmin'
import { paginate, mockError, nextId, buildMockJwt } from './utils'
import type { Desarrollo } from '@/features/desarrollo/schemas/desarrollo.schema'
import type { ContenidoMedia } from '@/features/contenido/schemas/contenido.schema'
import type { ConsultaContacto } from '@/features/contacto/schemas/contacto.schema'
import type { RegistroBroker } from '@/features/broker/schemas/broker.schema'
import type { DriveFile } from '@/features/contenido/schemas/drive.schema'

let desarrollos: Desarrollo[] = structuredClone(desarrollosSeed)
let contenidos: ContenidoMedia[] = structuredClone(contenidoSeed)
let consultas: ConsultaContacto[] = structuredClone(consultaContactoSeed)
let brokers: RegistroBroker[] = structuredClone(registroBrokerSeed)
let driveFiles: DriveFile[] = structuredClone(driveFilesSeed)

/** Los handlers de arriba tienen estado mutable a nivel de módulo — server.resetHandlers()
 *  de MSW NO lo limpia entre tests, hay que llamar esto a mano en un afterEach. */
export function resetMockData(): void {
  desarrollos = structuredClone(desarrollosSeed)
  contenidos = structuredClone(contenidoSeed)
  consultas = structuredClone(consultaContactoSeed)
  brokers = structuredClone(registroBrokerSeed)
  driveFiles = structuredClone(driveFilesSeed)
}

const RESERVED_SLUGS = ['admin', 'resumen']

async function withLatency<T>(value: T): Promise<T> {
  await delay(150 + Math.random() * 250)
  return value
}

/** Compartida por POST /v1/contenido (multipart) y POST /v1/contenido/importacion-drive:
 *  desmarca la portada anterior del desarrollo y actualiza imagenPortadaUrl. */
function aplicarPortada(desarrolloId: number, archivoUrl: string) {
  contenidos.forEach((c) => {
    if (c.desarrolloId === desarrolloId) c.esPortada = false
  })
  const dIdx = desarrollos.findIndex((d) => d.id === desarrolloId)
  if (dIdx !== -1) desarrollos[dIdx].imagenPortadaUrl = archivoUrl
}

export const handlers = [
  // ---- auth ----
  http.post('/v1/auth/login', async ({ request }) => {
    await withLatency(null)
    const body = (await request.json()) as { email?: string; password?: string }
    if (body.email !== ADMIN_EMAIL || body.password !== ADMIN_PASSWORD) {
      return HttpResponse.json(mockError('CREDENCIALES_INVALIDAS', 'Email o contraseña incorrectos'), { status: 401 })
    }
    return HttpResponse.json({ token: buildMockJwt(body.email) })
  }),

  http.get('/v1/usuario-admin/me', async ({ request }) => {
    await withLatency(null)
    if (!request.headers.get('authorization')) {
      return HttpResponse.json(mockError('UNAUTHORIZED', 'No autenticado'), { status: 401 })
    }
    return HttpResponse.json({ nombre: ADMIN_NOMBRE, email: ADMIN_EMAIL, rol: 'ADMINISTRADOR' })
  }),

  // ---- desarrollo: público ----
  http.get('/v1/desarrollo', async ({ request }) => {
    await withLatency(null)
    const url = new URL(request.url)
    const estado = url.searchParams.get('estado')
    const zona = url.searchParams.get('zona')
    let items = desarrollos.filter((d) => d.publicado)
    if (estado) items = items.filter((d) => d.estado === estado)
    if (zona) items = items.filter((d) => d.zona.toLowerCase().includes(zona.toLowerCase()))
    return HttpResponse.json(paginate(items, url))
  }),

  // ---- desarrollo: admin ----
  // Nota de orden: las rutas /v1/desarrollo/admin* deben registrarse ANTES que
  // /v1/desarrollo/:slug (más abajo) — a diferencia de Spring, MSW no prioriza
  // segmentos literales sobre params, matchea por orden de registro y "admin"
  // también matchea el patrón de un solo segmento de :slug.
  http.get('/v1/desarrollo/admin/resumen', async () => {
    await withLatency(null)
    return HttpResponse.json({
      total: desarrollos.length,
      enVenta: desarrollos.filter((d) => d.estado === 'en-venta').length,
      preventa: desarrollos.filter((d) => d.estado === 'preventa').length,
      entregados: desarrollos.filter((d) => d.estado === 'entregado').length,
    })
  }),

  http.get('/v1/desarrollo/admin/:id', async ({ params }) => {
    await withLatency(null)
    const desarrollo = desarrollos.find((d) => d.id === Number(params.id))
    if (!desarrollo) {
      return HttpResponse.json(mockError('DESARROLLO_NOT_FOUND', 'Desarrollo no encontrado'), { status: 404 })
    }
    return HttpResponse.json(desarrollo)
  }),

  http.get('/v1/desarrollo/admin', async ({ request }) => {
    await withLatency(null)
    const url = new URL(request.url)
    const estado = url.searchParams.get('estado')
    const publicado = url.searchParams.get('publicado')
    const zona = url.searchParams.get('zona')
    let items = [...desarrollos]
    if (estado) items = items.filter((d) => d.estado === estado)
    if (publicado !== null) items = items.filter((d) => String(d.publicado) === publicado)
    if (zona) items = items.filter((d) => d.zona.toLowerCase().includes(zona.toLowerCase()))
    return HttpResponse.json(paginate(items, url))
  }),

  http.post('/v1/desarrollo', async ({ request }) => {
    await withLatency(null)
    const body = (await request.json()) as Omit<Desarrollo, 'id' | 'publicado' | 'imagenPortadaUrl'> & {
      publicar: boolean
      slug: string
    }
    if (RESERVED_SLUGS.includes(body.slug)) {
      return HttpResponse.json(mockError('SLUG_RESERVADO', `El slug "${body.slug}" está reservado`), { status: 409 })
    }
    if (desarrollos.some((d) => d.slug === body.slug)) {
      return HttpResponse.json(mockError('SLUG_DUPLICADO', `Ya existe un desarrollo con el slug "${body.slug}"`), { status: 409 })
    }
    const nuevo: Desarrollo = { ...body, id: nextId(desarrollos), publicado: body.publicar, imagenPortadaUrl: null }
    desarrollos.push(nuevo)
    return HttpResponse.json(nuevo, { status: 201 })
  }),

  http.put('/v1/desarrollo/:id', async ({ request, params }) => {
    await withLatency(null)
    const idx = desarrollos.findIndex((d) => d.id === Number(params.id))
    if (idx === -1) {
      return HttpResponse.json(mockError('DESARROLLO_NOT_FOUND', 'Desarrollo no encontrado'), { status: 404 })
    }
    const body = (await request.json()) as Omit<Desarrollo, 'id' | 'publicado' | 'imagenPortadaUrl'> & {
      publicar: boolean
    }
    desarrollos[idx] = { ...desarrollos[idx], ...body, publicado: body.publicar }
    return HttpResponse.json(desarrollos[idx])
  }),

  http.delete('/v1/desarrollo/:id', async ({ params }) => {
    await withLatency(null)
    const idx = desarrollos.findIndex((d) => d.id === Number(params.id))
    if (idx === -1) {
      return HttpResponse.json(mockError('DESARROLLO_NOT_FOUND', 'Desarrollo no encontrado'), { status: 404 })
    }
    desarrollos.splice(idx, 1)
    return new HttpResponse(null, { status: 204 })
  }),

  // Va DESPUÉS de todo /v1/desarrollo/admin* (ver nota de orden más arriba).
  http.get('/v1/desarrollo/:slug', async ({ params }) => {
    await withLatency(null)
    const desarrollo = desarrollos.find((d) => d.slug === params.slug && d.publicado)
    if (!desarrollo) {
      return HttpResponse.json(mockError('DESARROLLO_NOT_FOUND', 'Desarrollo no encontrado'), { status: 404 })
    }
    // El backend real arma esto componiendo ContenidoMediaRepositoryPort — acá se
    // simula filtrando el mismo seed que ya usa la biblioteca del backoffice.
    const galeria = contenidos.filter((c) => c.desarrolloId === desarrollo.id)
    return HttpResponse.json({ ...desarrollo, galeria })
  }),

  // ---- drive (registrados ANTES de /v1/contenido/:id más abajo por la misma razón
  // que /v1/desarrollo/admin* va antes de /v1/desarrollo/:slug: MSW matchea por orden
  // de registro, no prioriza segmentos literales sobre params) ----
  http.get('/v1/drive/archivo', async ({ request }) => {
    await withLatency(null)
    if (!request.headers.get('authorization')) {
      return HttpResponse.json(mockError('UNAUTHORIZED', 'No autenticado'), { status: 401 })
    }
    const url = new URL(request.url)
    const nombre = url.searchParams.get('nombre')
    let archivos = [...driveFiles]
    if (nombre) archivos = archivos.filter((a) => a.nombre.toLowerCase().includes(nombre.toLowerCase()))
    return HttpResponse.json({ archivos, nextPageToken: null })
  }),

  http.post('/v1/contenido/importacion-drive', async ({ request }) => {
    // Latencia más larga que withLatency: Drive de verdad tarda, y queremos que el
    // estado de carga del modal sea visible en desarrollo, no instantáneo.
    await delay(900 + Math.random() * 400)
    if (!request.headers.get('authorization')) {
      return HttpResponse.json(mockError('UNAUTHORIZED', 'No autenticado'), { status: 401 })
    }
    const body = (await request.json()) as {
      driveFileId: string
      titulo: string
      desarrolloId: number | null
      categoria: ContenidoMedia['categoria']
      descripcion?: string
      esPortada: boolean
    }

    const archivo = driveFiles.find((a) => a.id === body.driveFileId)
    if (!archivo) {
      return HttpResponse.json(mockError('ARCHIVO_DRIVE_NO_ENCONTRADO', 'El archivo ya no está disponible en Drive'), {
        status: 404,
      })
    }
    if (archivo.id === 'drive-file-roto') {
      return HttpResponse.json(mockError('DRIVE_NO_DISPONIBLE', 'Google Drive no está disponible en este momento'), {
        status: 502,
      })
    }
    if (archivo.yaImportado) {
      return HttpResponse.json(
        mockError('CONTENIDO_DRIVE_YA_IMPORTADO', 'Este archivo de Drive ya fue importado a la biblioteca', {
          contenidoMediaId: archivo.contenidoMediaId,
        }),
        { status: 409 }
      )
    }

    // El tipo lo decide el mimeType real del archivo, igual que el backend — nunca lo
    // que mande el cliente.
    const tipo: ContenidoMedia['tipo'] | null = archivo.mimeType.startsWith('image/')
      ? 'foto'
      : archivo.mimeType.startsWith('video/')
        ? 'video'
        : null
    if (!tipo) {
      return HttpResponse.json(
        mockError('CONTENIDO_TIPO_ARCHIVO_NO_PERMITIDO', 'El archivo de Drive no es una foto ni un video soportado'),
        { status: 400 }
      )
    }

    const desarrolloId = body.desarrolloId
    const desarrollo = desarrolloId ? desarrollos.find((d) => d.id === desarrolloId) : undefined

    // foto: simula "el backend bajó el archivo y lo re-sirve desde /media/**" (misma URL
    // del seed, para no depender de la red real). video: NUNCA se descarga, se enlaza
    // directo a Drive — mismo formato que arma el adapter real.
    const archivoUrl = tipo === 'foto' ? (archivo.miniaturaUrl ?? `https://drive.mock/${archivo.id}`) : null
    const videoUrl = tipo === 'video' ? `https://drive.google.com/file/d/${archivo.id}/preview` : null

    if (tipo === 'foto' && body.esPortada && desarrolloId && archivoUrl) {
      aplicarPortada(desarrolloId, archivoUrl)
    }

    const nuevo: ContenidoMedia = {
      id: nextId(contenidos),
      desarrolloId,
      desarrolloNombre: desarrollo?.nombre ?? null,
      tipo,
      titulo: body.titulo,
      categoria: body.categoria,
      descripcion: body.descripcion ?? null,
      archivoUrl,
      videoUrl,
      esPortada: tipo === 'foto' && !!(body.esPortada && desarrolloId),
      orden: body.categoria === 'hero' ? contenidos.filter((c) => c.categoria === 'hero').length : 0,
    }
    contenidos.push(nuevo)

    archivo.yaImportado = true
    archivo.contenidoMediaId = nuevo.id

    return HttpResponse.json(nuevo, { status: 201 })
  }),

  // ---- contenido ----
  http.get('/v1/contenido', async ({ request }) => {
    await withLatency(null)
    const url = new URL(request.url)
    const desarrolloId = url.searchParams.get('desarrolloId')
    const tipo = url.searchParams.get('tipo')
    const categoria = url.searchParams.get('categoria')
    let items = [...contenidos]
    if (desarrolloId) items = items.filter((c) => c.desarrolloId === Number(desarrolloId))
    if (tipo) items = items.filter((c) => c.tipo === tipo)
    if (categoria) items = items.filter((c) => c.categoria === categoria)
    return HttpResponse.json(paginate(items, url))
  }),

  http.post('/v1/contenido', async ({ request }) => {
    await withLatency(null)
    const formData = await request.formData()
    const tipo = String(formData.get('tipo'))
    const titulo = String(formData.get('titulo'))
    const desarrolloIdRaw = formData.get('desarrolloId')
    const desarrolloId = desarrolloIdRaw ? Number(desarrolloIdRaw) : null
    const categoria = String(formData.get('categoria'))
    const descripcion = (formData.get('descripcion') as string) || null
    const videoUrl = (formData.get('videoUrl') as string) || null
    const esPortada = formData.get('esPortada') === 'true'
    const archivo = formData.get('archivo') as File | null

    const desarrollo = desarrolloId ? desarrollos.find((d) => d.id === desarrolloId) : undefined
    const archivoUrl = tipo === 'foto' && archivo ? URL.createObjectURL(archivo) : null

    // ANTES de pushear "nuevo": aplicarPortada desmarca esPortada de todo lo que ya
    // esté en `contenidos` para ese desarrollo — si se llamara después, se auto-desmarcaría.
    if (esPortada && desarrolloId && archivoUrl) {
      aplicarPortada(desarrolloId, archivoUrl)
    }

    const nuevo: ContenidoMedia = {
      id: nextId(contenidos),
      desarrolloId,
      desarrolloNombre: desarrollo?.nombre ?? null,
      tipo: tipo as ContenidoMedia['tipo'],
      titulo,
      categoria: categoria as ContenidoMedia['categoria'],
      descripcion,
      archivoUrl,
      videoUrl: tipo === 'video' ? videoUrl : null,
      esPortada,
      orden: categoria === 'hero' ? contenidos.filter((c) => c.categoria === 'hero').length : 0,
    }
    contenidos.push(nuevo)

    return HttpResponse.json(nuevo, { status: 201 })
  }),

  // ---- hero: carrusel de inicio (público — sin auth, ver SecurityConfig) ----
  http.get('/v1/contenido/hero', async () => {
    await withLatency(null)
    const slides = contenidos
      .filter((c) => c.categoria === 'hero')
      .sort((a, b) => a.orden - b.orden || a.id - b.id)
    return HttpResponse.json(slides)
  }),

  http.put('/v1/contenido/hero/orden', async ({ request }) => {
    await withLatency(null)
    if (!request.headers.get('authorization')) {
      return HttpResponse.json(mockError('UNAUTHORIZED', 'No autenticado'), { status: 401 })
    }
    const body = (await request.json()) as { ids: number[] }
    body.ids.forEach((id, index) => {
      const item = contenidos.find((c) => c.id === id && c.categoria === 'hero')
      if (item) item.orden = index
    })
    const slides = contenidos
      .filter((c) => c.categoria === 'hero')
      .sort((a, b) => a.orden - b.orden || a.id - b.id)
    return HttpResponse.json(slides)
  }),

  http.delete('/v1/contenido/:id', async ({ params }) => {
    await withLatency(null)
    const idx = contenidos.findIndex((c) => c.id === Number(params.id))
    if (idx === -1) {
      return HttpResponse.json(mockError('CONTENIDO_NOT_FOUND', 'Contenido no encontrado'), { status: 404 })
    }
    const [removed] = contenidos.splice(idx, 1)
    if (removed.esPortada && removed.desarrolloId) {
      const dIdx = desarrollos.findIndex((d) => d.id === removed.desarrolloId)
      if (dIdx !== -1) desarrollos[dIdx].imagenPortadaUrl = null
    }
    return new HttpResponse(null, { status: 204 })
  }),

  // ---- consulta-contacto ----
  http.post('/v1/consulta-contacto', async ({ request }) => {
    await withLatency(null)
    const body = (await request.json()) as Omit<ConsultaContacto, 'id' | 'stampDate'>
    const nueva: ConsultaContacto = { ...body, id: nextId(consultas), stampDate: new Date().toISOString() }
    consultas.unshift(nueva)
    return HttpResponse.json(nueva, { status: 201 })
  }),

  http.get('/v1/consulta-contacto', async ({ request }) => {
    await withLatency(null)
    const url = new URL(request.url)
    return HttpResponse.json(paginate(consultas, url))
  }),

  http.delete('/v1/consulta-contacto/:id', async ({ params }) => {
    await withLatency(null)
    const idx = consultas.findIndex((c) => c.id === Number(params.id))
    if (idx === -1) {
      return HttpResponse.json(mockError('CONSULTA_NOT_FOUND', 'Consulta no encontrada'), { status: 404 })
    }
    consultas.splice(idx, 1)
    return new HttpResponse(null, { status: 204 })
  }),

  // ---- registro-broker ----
  http.post('/v1/registro-broker', async ({ request }) => {
    await withLatency(null)
    const body = (await request.json()) as Omit<RegistroBroker, 'id' | 'stampDate'>
    const nuevo: RegistroBroker = { ...body, id: nextId(brokers), stampDate: new Date().toISOString() }
    brokers.unshift(nuevo)
    return HttpResponse.json(nuevo, { status: 201 })
  }),

  http.get('/v1/registro-broker', async ({ request }) => {
    await withLatency(null)
    const url = new URL(request.url)
    return HttpResponse.json(paginate(brokers, url))
  }),

  http.delete('/v1/registro-broker/:id', async ({ params }) => {
    await withLatency(null)
    const idx = brokers.findIndex((b) => b.id === Number(params.id))
    if (idx === -1) {
      return HttpResponse.json(mockError('BROKER_NOT_FOUND', 'Registro no encontrado'), { status: 404 })
    }
    brokers.splice(idx, 1)
    return new HttpResponse(null, { status: 204 })
  }),
]
