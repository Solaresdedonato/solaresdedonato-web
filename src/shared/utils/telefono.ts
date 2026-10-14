/**
 * Códigos de país del dropdown de teléfono de los formularios públicos. Argentina va
 * primera (default y caso más común); el resto, alfabético. La clave es el ISO del país y
 * no el código: varios comparten código (+1) y cada <option> necesita un valor único.
 */
export const CODIGOS_PAIS = [
  { iso: 'AR', pais: 'Argentina', codigo: '+54' },
  { iso: 'DE', pais: 'Alemania', codigo: '+49' },
  { iso: 'AD', pais: 'Andorra', codigo: '+376' },
  { iso: 'SA', pais: 'Arabia Saudita', codigo: '+966' },
  { iso: 'AM', pais: 'Armenia', codigo: '+374' },
  { iso: 'AU', pais: 'Australia', codigo: '+61' },
  { iso: 'AT', pais: 'Austria', codigo: '+43' },
  { iso: 'BE', pais: 'Bélgica', codigo: '+32' },
  { iso: 'BZ', pais: 'Belice', codigo: '+501' },
  { iso: 'BO', pais: 'Bolivia', codigo: '+591' },
  { iso: 'BR', pais: 'Brasil', codigo: '+55' },
  { iso: 'CA', pais: 'Canadá', codigo: '+1' },
  { iso: 'QA', pais: 'Catar', codigo: '+974' },
  { iso: 'CL', pais: 'Chile', codigo: '+56' },
  { iso: 'CN', pais: 'China', codigo: '+86' },
  { iso: 'CO', pais: 'Colombia', codigo: '+57' },
  { iso: 'KR', pais: 'Corea del Sur', codigo: '+82' },
  { iso: 'CR', pais: 'Costa Rica', codigo: '+506' },
  { iso: 'HR', pais: 'Croacia', codigo: '+385' },
  { iso: 'CU', pais: 'Cuba', codigo: '+53' },
  { iso: 'DK', pais: 'Dinamarca', codigo: '+45' },
  { iso: 'EC', pais: 'Ecuador', codigo: '+593' },
  { iso: 'EG', pais: 'Egipto', codigo: '+20' },
  { iso: 'SV', pais: 'El Salvador', codigo: '+503' },
  { iso: 'AE', pais: 'Emiratos Árabes Unidos', codigo: '+971' },
  { iso: 'ES', pais: 'España', codigo: '+34' },
  { iso: 'US', pais: 'Estados Unidos', codigo: '+1' },
  { iso: 'FI', pais: 'Finlandia', codigo: '+358' },
  { iso: 'FR', pais: 'Francia', codigo: '+33' },
  { iso: 'GR', pais: 'Grecia', codigo: '+30' },
  { iso: 'GT', pais: 'Guatemala', codigo: '+502' },
  { iso: 'GY', pais: 'Guyana', codigo: '+592' },
  { iso: 'HT', pais: 'Haití', codigo: '+509' },
  { iso: 'HN', pais: 'Honduras', codigo: '+504' },
  { iso: 'HU', pais: 'Hungría', codigo: '+36' },
  { iso: 'IN', pais: 'India', codigo: '+91' },
  { iso: 'IE', pais: 'Irlanda', codigo: '+353' },
  { iso: 'IL', pais: 'Israel', codigo: '+972' },
  { iso: 'IT', pais: 'Italia', codigo: '+39' },
  { iso: 'JP', pais: 'Japón', codigo: '+81' },
  { iso: 'LB', pais: 'Líbano', codigo: '+961' },
  { iso: 'LU', pais: 'Luxemburgo', codigo: '+352' },
  { iso: 'MA', pais: 'Marruecos', codigo: '+212' },
  { iso: 'MX', pais: 'México', codigo: '+52' },
  { iso: 'NI', pais: 'Nicaragua', codigo: '+505' },
  { iso: 'NO', pais: 'Noruega', codigo: '+47' },
  { iso: 'NZ', pais: 'Nueva Zelanda', codigo: '+64' },
  { iso: 'NL', pais: 'Países Bajos', codigo: '+31' },
  { iso: 'PA', pais: 'Panamá', codigo: '+507' },
  { iso: 'PY', pais: 'Paraguay', codigo: '+595' },
  { iso: 'PE', pais: 'Perú', codigo: '+51' },
  { iso: 'PL', pais: 'Polonia', codigo: '+48' },
  { iso: 'PT', pais: 'Portugal', codigo: '+351' },
  { iso: 'PR', pais: 'Puerto Rico', codigo: '+1' },
  { iso: 'GB', pais: 'Reino Unido', codigo: '+44' },
  { iso: 'CZ', pais: 'República Checa', codigo: '+420' },
  { iso: 'DO', pais: 'República Dominicana', codigo: '+1' },
  { iso: 'RO', pais: 'Rumania', codigo: '+40' },
  { iso: 'RU', pais: 'Rusia', codigo: '+7' },
  { iso: 'SY', pais: 'Siria', codigo: '+963' },
  { iso: 'ZA', pais: 'Sudáfrica', codigo: '+27' },
  { iso: 'SE', pais: 'Suecia', codigo: '+46' },
  { iso: 'CH', pais: 'Suiza', codigo: '+41' },
  { iso: 'SR', pais: 'Surinam', codigo: '+597' },
  { iso: 'TR', pais: 'Turquía', codigo: '+90' },
  { iso: 'UA', pais: 'Ucrania', codigo: '+380' },
  { iso: 'UY', pais: 'Uruguay', codigo: '+598' },
  { iso: 'VE', pais: 'Venezuela', codigo: '+58' },
] as const

export type IsoPais = (typeof CODIGOS_PAIS)[number]['iso']

export const ISO_PAIS_DEFAULT: IsoPais = 'AR'

export function codigoDePais(iso: IsoPais): string {
  return CODIGOS_PAIS.find((p) => p.iso === iso)?.codigo ?? ''
}

/**
 * El teléfono tal como se envía: código del dropdown + número tipeado. Si el número ya
 * arranca con "+" (alguien de un país que no está en la lista lo escribe completo), va tal cual.
 */
export function telefonoConCodigo(iso: IsoPais, numero: string): string {
  const limpio = numero.trim()
  return limpio.startsWith('+') ? limpio : `${codigoDePais(iso)} ${limpio}`
}
