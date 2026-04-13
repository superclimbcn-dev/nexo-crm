import { Prisma } from '@prisma/client'

export type ServiceInterest =
  | 'sofas_alfombras'
  | 'impermeabilizacion'
  | 'carros'

export type PricingTemplate = {
  id: string
  label: string
  message: string
}

export type PricingEstimate = {
  basePrice: number
  travelSurcharge: number
  totalPrice: number
  distanceKm: number | null
}

export const SABADELL_LOCATION = 'Sabadell / Barcelona'
export const PROJECT_CURRENCY = 'EUR'
export const TRAVEL_SURCHARGE_EUR = 20

const SOFA_THREE_SEATER_PRICE_EUR = 135
const IMPERMEABILIZATION_AVERAGE_EUR = 265
const CAR_DETAILING_AVERAGE_EUR = 130
const MATTRESS_SINGLE_EUR = 45
const MATTRESS_DOUBLE_EUR = 85
const RUG_SABADELL_EUR_M2 = 12
const RUG_SURROUNDINGS_EUR_M2 = 15
const CHAIR_EUR = 12
const ARMCHAIR_EUR = 35
const RECLINER_EUR = 90

const DISTANCE_FIELD_CANDIDATES = [
  'distanceKm',
  'distanceFromSabadellKm',
  'travelDistanceKm',
] as const

export const PRICE_TEMPLATES: PricingTemplate[] = [
  {
    id: 'sofa-3-plazas',
    label: 'Sofá 3 plazas',
    message: 'El sofá de 3 plazas sale por 135€.',
  },
  {
    id: 'impermeabilizacion-media',
    label: 'Impermeabilización',
    message: 'La impermeabilización suele situarse entre 180€ y 350€, con una media de 265€.',
  },
  {
    id: 'coche-detallado',
    label: 'Coche detallado',
    message: 'El detallado de coche sale entre 110€ y 150€ según el estado del vehículo.',
  },
  {
    id: 'colchon',
    label: 'Colchones',
    message: 'El colchón individual sale por 45€ y el matrimonial suele salir por 85€.',
  },
  {
    id: 'alfombra',
    label: 'Alfombras',
    message: 'Las alfombras salen por 12€/m² en Sabadell y 15€/m² en alrededores.',
  },
  {
    id: 'sillas-butacas',
    label: 'Sillas y butacas',
    message: 'Las sillas salen por 12€, las butacas por 35€ y los sillones relax por 90€.',
  },
]

function isJsonObject(value: Prisma.JsonValue | null): value is Prisma.JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function getDistanceFromCustomFields(customFields: Prisma.JsonValue | null): number | null {
  if (!isJsonObject(customFields)) {
    return null
  }

  for (const candidate of DISTANCE_FIELD_CANDIDATES) {
    const rawDistance = customFields[candidate]

    if (typeof rawDistance === 'number' && Number.isFinite(rawDistance)) {
      return rawDistance
    }

    if (typeof rawDistance === 'string') {
      const normalizedValue = Number(rawDistance.replace(',', '.'))

      if (Number.isFinite(normalizedValue)) {
        return normalizedValue
      }
    }
  }

  return null
}

export function getTravelSurcharge(customFields: Prisma.JsonValue | null): number {
  const distanceKm = getDistanceFromCustomFields(customFields)
  return distanceKm !== null && distanceKm > 30 ? TRAVEL_SURCHARGE_EUR : 0
}

export function getPricingEstimateForService(
  service: ServiceInterest,
  customFields: Prisma.JsonValue | null,
): PricingEstimate {
  const distanceKm = getDistanceFromCustomFields(customFields)
  const travelSurcharge = getTravelSurcharge(customFields)

  let basePrice = 0

  switch (service) {
    case 'sofas_alfombras':
      basePrice = SOFA_THREE_SEATER_PRICE_EUR
      break
    case 'impermeabilizacion':
      basePrice = IMPERMEABILIZATION_AVERAGE_EUR
      break
    case 'carros':
      basePrice = CAR_DETAILING_AVERAGE_EUR
      break
  }

  return {
    basePrice,
    travelSurcharge,
    totalPrice: basePrice + travelSurcharge,
    distanceKm,
  }
}

export function getPricingEstimateForPotential(
  potential: ServiceInterest | 'general',
  customFields: Prisma.JsonValue | null,
): PricingEstimate {
  if (potential === 'general') {
    const distanceKm = getDistanceFromCustomFields(customFields)
    const travelSurcharge = getTravelSurcharge(customFields)

    return {
      basePrice: 0,
      travelSurcharge,
      totalPrice: travelSurcharge,
      distanceKm,
    }
  }

  return getPricingEstimateForService(potential, customFields)
}

export function getPricingBadgeLabel(potential: ServiceInterest | 'general'): string {
  switch (potential) {
    case 'sofas_alfombras':
      return 'Sofás / Alfombras'
    case 'impermeabilizacion':
      return 'Impermeabilización'
    case 'carros':
      return 'Coches'
    default:
      return 'Sin clasificar'
  }
}

export const PRICING_REFERENCE = {
  sofaThreeSeater: SOFA_THREE_SEATER_PRICE_EUR,
  impermeabilizationRange: {
    min: 180,
    max: 350,
    average: IMPERMEABILIZATION_AVERAGE_EUR,
  },
  carDetailingRange: {
    min: 110,
    max: 150,
    average: CAR_DETAILING_AVERAGE_EUR,
  },
  mattresses: {
    single: MATTRESS_SINGLE_EUR,
    doubleAverage: MATTRESS_DOUBLE_EUR,
  },
  rugs: {
    sabadellPerSquareMeter: RUG_SABADELL_EUR_M2,
    surroundingsPerSquareMeter: RUG_SURROUNDINGS_EUR_M2,
  },
  chairs: CHAIR_EUR,
  armchairs: ARMCHAIR_EUR,
  recliners: RECLINER_EUR,
}
