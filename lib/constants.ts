export const UTMACH_EMAIL_DOMAIN = '@utmachala.edu.ec'

export const CANTONES_EL_ORO = [
  'Machala',
  'Pasaje',
  'Santa Rosa',
  'El Guabo',
  'Piñas',
  'Huaquillas',
  'Arenillas',
  'Balsas',
  'Chilla',
  'Las Lajas',
  'Marcabelí',
  'Portovelo',
  'Zaruma',
  'Atahualpa',
] as const

export type TripDirection = 'to_campus' | 'from_campus'

export const TRIP_DIRECTIONS: Record<TripDirection, { label: string; description: string }> = {
  to_campus: {
    label: 'Ir a la U',
    description: 'Desde mi ciudad hacia el campus',
  },
  from_campus: {
    label: 'Volver a casa',
    description: 'Desde el campus hacia mi ciudad',
  },
}

export interface CampusInfo {
  id: string
  name: string
  shortName: string
  location: string
  description: string
}

export const CAMPUS_UTMACH: CampusInfo[] = [
  {
    id: 'campus-principal',
    name: 'Campus Principal (Matriz)',
    shortName: 'Matriz',
    location: 'Machala',
    description: 'Av. Panamericana km 5 1/2 Via a Pasaje',
  },
  {
    id: 'campus-10-agosto',
    name: 'Campus Machala (10 de Agosto)',
    shortName: '10 de Agosto',
    location: 'Machala',
    description: 'Av. Loja entre 25 de Junio y 10 de Agosto - Educacion Continua',
  },
  {
    id: 'campus-agropecuarias',
    name: 'Fac. Ciencias Agropecuarias',
    shortName: 'El Cambio',
    location: 'El Cambio',
    description: 'Facultad de Ciencias Agropecuarias - Frente al campus principal',
  },
  {
    id: 'campus-arenillas',
    name: 'Campus Arenillas',
    shortName: 'Arenillas',
    location: 'Arenillas',
    description: 'Zona fronteriza - Canton Arenillas',
  },
  {
    id: 'campus-pinas',
    name: 'Campus Piñas',
    shortName: 'Piñas',
    location: 'Piñas',
    description: 'Zona alta - Canton Piñas',
  },
]

export const ALL_CAMPUS_NAMES = CAMPUS_UTMACH.map((c) => c.name)

export const DESTINATIONS = [
  ...ALL_CAMPUS_NAMES,
  ...CANTONES_EL_ORO,
] as const

/* ─── Facultades y Carreras UTMACH 2026 ───────────────────────── */

export type CarreraInfo = {
  nombre: string
  campus?: string
  modalidad?: 'Presencial' | 'Online'
}

export type FacultadInfo = {
  id: string
  nombre: string
  carreras: CarreraInfo[]
}

export const FACULTADES_UTMACH: FacultadInfo[] = [
  {
    id: 'fic',
    nombre: 'Facultad de Ingeniería Civil',
    carreras: [
      { nombre: 'Ingeniería Civil' },
      { nombre: 'Tecnologías de la Información' },
      { nombre: 'Ingeniería Ambiental' },
      { nombre: 'Ciencia de Datos e Inteligencia Artificial' },
      { nombre: 'Ciencia de Datos e Inteligencia Artificial', campus: 'Piñas' },
    ],
  },
  {
    id: 'fce',
    nombre: 'Facultad de Ciencias Empresariales',
    carreras: [
      { nombre: 'Administración de Empresas' },
      { nombre: 'Comercio Exterior' },
      { nombre: 'Contabilidad y Auditoría' },
      { nombre: 'Contabilidad y Auditoría', campus: 'Piñas' },
      { nombre: 'Economía' },
      { nombre: 'Mercadotecnia' },
      { nombre: 'Turismo' },
      { nombre: 'Finanzas y Negocios Digitales' },
      { nombre: 'Finanzas y Negocios Digitales', campus: 'Arenillas' },
      { nombre: 'Gestión de la Innovación Organizacional y Productividad' },
    ],
  },
  {
    id: 'fca',
    nombre: 'Facultad de Ciencias Agropecuarias',
    carreras: [
      { nombre: 'Agronomía' },
      { nombre: 'Agropecuaria' },
      { nombre: 'Agropecuaria', campus: 'Piñas' },
      { nombre: 'Acuicultura' },
      { nombre: 'Medicina Veterinaria' },
    ],
  },
  {
    id: 'fcqs',
    nombre: 'Facultad de Ciencias Químicas y de la Salud',
    carreras: [
      { nombre: 'Ingeniería en Alimentos' },
      { nombre: 'Enfermería' },
      { nombre: 'Ingeniería Química' },
      { nombre: 'Medicina' },
      { nombre: 'Psicología Clínica' },
      { nombre: 'Psicología Clínica', campus: 'Arenillas' },
    ],
  },
  {
    id: 'fcs',
    nombre: 'Facultad de Ciencias Sociales',
    carreras: [
      { nombre: 'Derecho' },
      { nombre: 'Derecho', campus: 'Arenillas' },
      { nombre: 'Artes Plásticas' },
      { nombre: 'Educación Básica' },
      { nombre: 'Educación Básica', modalidad: 'Online' },
      { nombre: 'Educación Básica', modalidad: 'Online', campus: 'Arenillas' },
      { nombre: 'Educación Básica', modalidad: 'Online', campus: 'Piñas' },
      { nombre: 'Educación Inicial' },
      { nombre: 'Educación Inicial', campus: 'Arenillas' },
      { nombre: 'Pedagogía de la Actividad Física y Deporte' },
      { nombre: 'Pedagogía de las Ciencias Experimentales' },
      { nombre: 'Pedagogía de los Idiomas Nacionales y Extranjeros' },
      { nombre: 'Psicopedagogía' },
      { nombre: 'Sociología' },
      { nombre: 'Trabajo Social' },
    ],
  },
]

/** Label visible de una carrera */
export function getCarreraLabel(c: CarreraInfo): string {
  let label = c.nombre
  if (c.modalidad) label += ` (${c.modalidad})`
  if (c.campus) label += ` - ${c.campus}`
  return label
}

/** Obtiene la facultad dado un carrera label */
export function getFacultadByCarrera(carreraLabel: string): string | null {
  for (const f of FACULTADES_UTMACH) {
    for (const c of f.carreras) {
      if (getCarreraLabel(c) === carreraLabel) return f.nombre
    }
  }
  return null
}

/* ─── Validaciones ─────────────────────────────────────────────── */

/** Valida cedula ecuatoriana (10 digitos, algoritmo modulo 10) */
export function validarCedula(cedula: string): boolean {
  if (!/^\d{10}$/.test(cedula)) return false
  const provincia = parseInt(cedula.substring(0, 2), 10)
  if (provincia < 1 || provincia > 24) return false
  const tercerDigito = parseInt(cedula[2], 10)
  if (tercerDigito >= 6) return false
  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2]
  let suma = 0
  for (let i = 0; i < 9; i++) {
    let valor = parseInt(cedula[i], 10) * coeficientes[i]
    if (valor > 9) valor -= 9
    suma += valor
  }
  const verificador = suma % 10 === 0 ? 0 : 10 - (suma % 10)
  return verificador === parseInt(cedula[9], 10)
}

/** Valida nombre completo (min 2 palabras, solo letras y espacios) */
export function validarNombreCompleto(nombre: string): boolean {
  const t = nombre.trim()
  if (t.length < 5 || t.length > 100) return false
  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(t)) return false
  return t.split(/\s+/).filter((p) => p.length >= 2).length >= 2
}

/** Valida WhatsApp ecuatoriano */
export function validarWhatsApp(numero: string): boolean {
  return /^(09\d{8}|\+?593\d{9})$/.test(numero.trim())
}
