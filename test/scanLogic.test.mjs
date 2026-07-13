import assert from 'node:assert/strict'
import { interpretScanResult, formatScanTime } from '../src/scanLogic.js'

let passed = 0
function check(label, actual, expected) {
  assert.deepEqual(actual, expected, label)
  passed++
  console.log('  ok -', label)
}

console.log('interpretScanResult:')

check(
  'confirmed scan',
  interpretScanResult({ status: 'confirmed', reg_no: '23BCS001', checkpoint: 'Entry' }),
  { tone: 'confirm', headline: 'CONFIRMED', reg_no: '23BCS001', detail: 'Entry' }
)

check(
  'duplicate scan carries the original time',
  interpretScanResult({
    status: 'duplicate',
    reg_no: '23BCS001',
    checkpoint: 'Entry',
    scanned_at: '2026-07-12T02:03:46.323Z',
  }),
  {
    tone: 'duplicate',
    headline: 'ALREADY SCANNED',
    reg_no: '23BCS001',
    detail: formatScanTime('2026-07-12T02:03:46.323Z'),
  }
)

check(
  'unknown QR token',
  interpretScanResult({ status: 'invalid_token' }).headline,
  'NOT FOUND'
)

check(
  'unrecognized checkpoint code',
  interpretScanResult({ status: 'invalid_checkpoint' }).headline,
  'COUNTER ERROR'
)

check(
  'dropped request',
  interpretScanResult({ status: 'network_error' }).headline,
  'NO CONNECTION'
)

check(
  'malformed/empty response fails safe, not silent',
  interpretScanResult({}).tone,
  'error'
)

check('formatScanTime on a real timestamp returns a readable string',
  typeof formatScanTime('2026-07-12T02:03:46.323Z'),
  'string'
)

check('formatScanTime on missing input returns empty, not "Invalid Date"',
  formatScanTime(undefined),
  ''
)

check(
  'confirmed scan for Chat maps to Chaat',
  interpretScanResult({ status: 'confirmed', reg_no: '23BCS001', checkpoint: 'Chat' }),
  { tone: 'confirm', headline: 'CONFIRMED', reg_no: '23BCS001', detail: 'Chaat' }
)

console.log(`\n${passed}/${passed} checks passed`)
