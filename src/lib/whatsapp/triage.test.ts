import assert from 'node:assert/strict'
import test from 'node:test'
import { getNextCommunityTriageState, isSupportedMenuOption, serviceRequiresPhotos } from './triage'

test('acepta los cuatro servicios del menú', () => {
  for (const option of ['1', '2', '3', '4']) assert.equal(isSupportedMenuOption(option), true)
  assert.equal(isSupportedMenuOption('5'), false)
})

test('los servicios existentes mantienen la solicitud de fotos', () => {
  for (const service of ['sofas_alfombras', 'impermeabilizacion', 'carros']) {
    assert.equal(serviceRequiresPhotos(service), true)
  }
})

test('comunidades no exige fotos y termina después de tres respuestas', () => {
  assert.equal(serviceRequiresPhotos('comunidades'), false)
  const municipality = getNextCommunityTriageState('AWAITING_COMMUNITY_MUNICIPALITY')
  const portals = getNextCommunityTriageState(municipality)
  const frequency = getNextCommunityTriageState(portals)
  assert.equal(municipality, 'AWAITING_COMMUNITY_PORTALS')
  assert.equal(portals, 'AWAITING_COMMUNITY_FREQUENCY')
  assert.equal(frequency, 'TRIAGE_COMPLETED')
})
