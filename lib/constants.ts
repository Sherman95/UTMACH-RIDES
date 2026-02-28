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
