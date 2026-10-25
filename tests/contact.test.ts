import { test } from 'node:test'
import assert from 'node:assert/strict'
import { normalisePhone, validateContact, leadText } from '../lib/contact.ts'

test('normalisePhone accepts Israeli mobile, landline and international forms', () => {
  assert.equal(normalisePhone('053-800-7008'), '0538007008')
  assert.equal(normalisePhone('053 800 7008'), '0538007008')
  assert.equal(normalisePhone('+972 53-800-7008'), '0538007008')
  assert.equal(normalisePhone('972538007008'), '0538007008')
  assert.equal(normalisePhone('03-1234567'), '031234567')
  assert.equal(normalisePhone('077-1234567'), '0771234567')
})

test('normalisePhone rejects junk', () => {
  for (const bad of ['', '123', '0538007', '05380070089', 'abc', '01-1234567', '+1 212 555 0100']) {
    assert.equal(normalisePhone(bad), null, bad)
  }
})

test('validateContact returns a clean lead for good input', () => {
  const r = validateContact({ name: '  דנה   כהן ', phone: '050-1234567', service: 'landing', message: ' דף לקמפיין ', consent: true })
  assert.equal(r.ok, true)
  if (r.ok) {
    assert.equal(r.lead.name, 'דנה כהן')
    assert.equal(r.lead.phone, '0501234567')
    assert.equal(r.lead.serviceLabel, 'דף נחיתה')
    assert.equal(r.lead.message, 'דף לקמפיין')
  }
})

test('validateContact reports every bad field in Hebrew', () => {
  const r = validateContact({ name: 'א', phone: '12', service: 'hacking', message: 'x'.repeat(1001) })
  assert.equal(r.ok, false)
  if (!r.ok) assert.deepEqual(Object.keys(r.errors).sort(), ['consent', 'message', 'name', 'phone', 'service'])
})

test('validateContact ignores non-string values and control characters', () => {
  const r = validateContact({ name: { $gt: '' }, phone: ['0501234567'], service: 'logo', consent: true })
  assert.equal(r.ok, false)
  const r2 = validateContact({ name: 'רון\u0000\u0007', phone: '0501234567', service: 'logo', consent: true })
  assert.equal(r2.ok && r2.lead.name, 'רון')
})

test('consent to the privacy policy and terms is required, and only a real yes counts', () => {
  const base = { name: 'רון', phone: '0501234567', service: 'card' }
  for (const consent of [undefined, false, 'true', 1]) {
    const r = validateContact({ ...base, consent })
    assert.equal(r.ok, false)
    if (!r.ok) assert.ok(r.errors.consent)
  }
  assert.equal(validateContact({ ...base, consent: true }).ok, true)
})

test('message is optional', () => {
  assert.equal(validateContact({ name: 'רון', phone: '0501234567', service: 'card', consent: true }).ok, true)
})

test('leadText carries everything the visitor filled in', () => {
  const r = validateContact({ name: 'רון', phone: '0501234567', service: 'card', message: 'צריך כרטיס ביקור', consent: true })
  assert.ok(r.ok)
  if (r.ok) {
    const t = leadText(r.lead)
    assert.match(t, /שם: רון/)
    assert.match(t, /טלפון: 050-1234567/)
    assert.match(t, /שירות: כרטיס ביקור/)
    assert.match(t, /פרטים: צריך כרטיס ביקור/)
  }
})
