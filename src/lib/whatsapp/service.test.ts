import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import test from 'node:test'
import { shouldPersistIncomingMessage, verifyMetaSignature } from './service'

test('valida la firma SHA-256 del webhook y rechaza firmas incorrectas', () => {
  const body = JSON.stringify({ entry: [] })
  const secret = 'test-secret'
  const signature = `sha256=${crypto.createHmac('sha256', secret).update(body).digest('hex')}`
  assert.equal(verifyMetaSignature(body, signature, secret), true)
  assert.equal(verifyMetaSignature(body, 'sha256=incorrecta', secret), false)
  assert.equal(verifyMetaSignature(body, null, secret), false)
})

test('no persiste dos veces el mismo identificador de WhatsApp', () => {
  assert.equal(shouldPersistIncomingMessage(false), true)
  assert.equal(shouldPersistIncomingMessage(true), false)
})
