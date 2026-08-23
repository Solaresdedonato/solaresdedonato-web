/**
 * Portado literal del backoffice HTML prototipo (`Backoffice Solares de Donato.dc.html`).
 * Sin librerías externas: arma un .xlsx a mano como zip OOXML mínimo (método store, sin compresión).
 */

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function buildTxtTable(headers: string[], rows: unknown[][]): string {
  const cols = headers.length
  const widths: number[] = []
  for (let i = 0; i < cols; i++) {
    let w = headers[i].length
    rows.forEach((r) => {
      w = Math.max(w, String(r[i] ?? '').length)
    })
    widths.push(Math.min(w, 60))
  }
  const line = (r: unknown[]) => r.map((v, i) => String(v ?? '').slice(0, 60).padEnd(widths[i])).join('  |  ')
  const sep = widths.map((w) => '-'.repeat(w)).join('--+--')
  return [line(headers), sep, ...rows.map(line)].join('\n')
}

export function exportRowsAsTxt(headers: string[], rows: unknown[][], filename: string): void {
  const text = buildTxtTable(headers, rows)
  downloadBlob(new Blob([text], { type: 'text/plain;charset=utf-8' }), filename)
}

let CRC_TABLE: number[] | null = null
function crc32(bytes: Uint8Array): number {
  if (!CRC_TABLE) {
    CRC_TABLE = []
    for (let n = 0; n < 256; n++) {
      let c = n
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
      CRC_TABLE[n] = c >>> 0
    }
  }
  let crc = 0xffffffff
  for (let i = 0; i < bytes.length; i++) crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ bytes[i]) & 0xff]
  return (crc ^ 0xffffffff) >>> 0
}

function strToBytes(str: string): Uint8Array {
  return new TextEncoder().encode(str)
}

interface ZipEntry {
  name: string
  data: Uint8Array
}

function makeZip(files: ZipEntry[]): Blob {
  const localParts: (Uint8Array | Blob)[] = []
  const centralParts: Uint8Array[] = []
  let offset = 0
  const dosTime = 0
  const dosDate = 0x21

  files.forEach((f) => {
    const nameBytes = strToBytes(f.name)
    const data = f.data
    const crc = crc32(data)
    const size = data.length

    const local = new Uint8Array(30 + nameBytes.length)
    const dv = new DataView(local.buffer)
    dv.setUint32(0, 0x04034b50, true)
    dv.setUint16(4, 20, true)
    dv.setUint16(6, 0, true)
    dv.setUint16(8, 0, true)
    dv.setUint16(10, dosTime, true)
    dv.setUint16(12, dosDate, true)
    dv.setUint32(14, crc, true)
    dv.setUint32(18, size, true)
    dv.setUint32(22, size, true)
    dv.setUint16(26, nameBytes.length, true)
    dv.setUint16(28, 0, true)
    local.set(nameBytes, 30)
    localParts.push(local, data)

    const central = new Uint8Array(46 + nameBytes.length)
    const cdv = new DataView(central.buffer)
    cdv.setUint32(0, 0x02014b50, true)
    cdv.setUint16(4, 20, true)
    cdv.setUint16(6, 20, true)
    cdv.setUint16(8, 0, true)
    cdv.setUint16(10, 0, true)
    cdv.setUint16(12, dosTime, true)
    cdv.setUint16(14, dosDate, true)
    cdv.setUint32(16, crc, true)
    cdv.setUint32(20, size, true)
    cdv.setUint32(24, size, true)
    cdv.setUint16(28, nameBytes.length, true)
    cdv.setUint16(30, 0, true)
    cdv.setUint16(32, 0, true)
    cdv.setUint16(34, 0, true)
    cdv.setUint16(36, 0, true)
    cdv.setUint32(38, 0, true)
    cdv.setUint32(42, offset, true)
    central.set(nameBytes, 46)
    centralParts.push(central)

    offset += local.length + data.length
  })

  const centralStart = offset
  const centralSize = centralParts.reduce((a, c) => a + c.length, 0)

  const end = new Uint8Array(22)
  const edv = new DataView(end.buffer)
  edv.setUint32(0, 0x06054b50, true)
  edv.setUint16(4, 0, true)
  edv.setUint16(6, 0, true)
  edv.setUint16(8, files.length, true)
  edv.setUint16(10, files.length, true)
  edv.setUint32(12, centralSize, true)
  edv.setUint32(16, centralStart, true)
  edv.setUint16(20, 0, true)

  // Cast: TS tipa Uint8Array como genérico sobre su buffer y Blob solo acepta ArrayBufferView<ArrayBuffer>,
  // pero en runtime cualquier Uint8Array es un BlobPart válido.
  return new Blob([...localParts, ...centralParts, end] as BlobPart[], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}

function xmlEscape(s: unknown): string {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function colLetter(n: number): string {
  let s = ''
  while (n > 0) {
    const m = (n - 1) % 26
    s = String.fromCharCode(65 + m) + s
    n = Math.floor((n - 1) / 26)
  }
  return s
}

function buildXlsx(headers: string[], rows: unknown[][], sheetName: string): Blob {
  const allRows = [headers, ...rows]
  const rowsXml = allRows
    .map((r, ri) => {
      const cells = r
        .map((val, ci) => {
          const ref = colLetter(ci + 1) + (ri + 1)
          return `<c r="${ref}" t="inlineStr"><is><t xml:space="preserve">${xmlEscape(val)}</t></is></c>`
        })
        .join('')
      return `<row r="${ri + 1}">${cells}</row>`
    })
    .join('')
  const sheetXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${rowsXml}</sheetData></worksheet>`

  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>`

  const rootRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`

  const workbook = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="${xmlEscape(sheetName)}" sheetId="1" r:id="rId1"/></sheets></workbook>`

  const workbookRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>`

  return makeZip([
    { name: '[Content_Types].xml', data: strToBytes(contentTypes) },
    { name: '_rels/.rels', data: strToBytes(rootRels) },
    { name: 'xl/workbook.xml', data: strToBytes(workbook) },
    { name: 'xl/_rels/workbook.xml.rels', data: strToBytes(workbookRels) },
    { name: 'xl/worksheets/sheet1.xml', data: strToBytes(sheetXml) },
  ])
}

export function exportRowsAsXlsx(headers: string[], rows: unknown[][], filename: string, sheetName = 'Datos'): void {
  downloadBlob(buildXlsx(headers, rows, sheetName), filename)
}
