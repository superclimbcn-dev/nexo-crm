export type CommunityTriageState =
  | 'AWAITING_COMMUNITY_MUNICIPALITY'
  | 'AWAITING_COMMUNITY_PORTALS'
  | 'AWAITING_COMMUNITY_FREQUENCY'
  | 'TRIAGE_COMPLETED'

export function isSupportedMenuOption(message: string): boolean {
  return message === '1' || message === '2' || message === '3' || message === '4'
}

export function getNextCommunityTriageState(state: CommunityTriageState): CommunityTriageState {
  switch (state) {
    case 'AWAITING_COMMUNITY_MUNICIPALITY':
      return 'AWAITING_COMMUNITY_PORTALS'
    case 'AWAITING_COMMUNITY_PORTALS':
      return 'AWAITING_COMMUNITY_FREQUENCY'
    case 'AWAITING_COMMUNITY_FREQUENCY':
    case 'TRIAGE_COMPLETED':
      return 'TRIAGE_COMPLETED'
  }
}

export function serviceRequiresPhotos(service: string): boolean {
  return service !== 'comunidades'
}
