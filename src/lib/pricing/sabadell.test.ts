import assert from 'node:assert/strict'
import test from 'node:test'
import { getPricingEstimateForService, PROJECT_CURRENCY } from './sabadell'

test('las oportunidades operan en EUR', () => {
  assert.equal(PROJECT_CURRENCY, 'EUR')
})

test('comunidades no inventa un precio automático', () => {
  assert.equal(getPricingEstimateForService('comunidades', null).totalPrice, 0)
})
