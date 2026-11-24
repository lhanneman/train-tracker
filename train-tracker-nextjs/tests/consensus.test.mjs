import assert from 'node:assert/strict'
import test from 'node:test'
import { calculateConsensusStatus } from '../src/lib/consensus-utils.ts'

const start = new Date('2026-11-24T18:00:00Z')
const windowMs = 5 * 60_000

test('a newer clear report does not override an active crossing report', () => {
  const reports = [
    { isTrainCrossing: true, reportedAt: start, expiresAt: new Date(start.getTime() + 10 * 60_000) },
    { isTrainCrossing: false, reportedAt: new Date(start.getTime() + 30_000), expiresAt: null },
  ]
  const active = calculateConsensusStatus(reports, reports[1].reportedAt, windowMs)
  assert.equal(active.status, true)
  assert.equal(active.nextUpdateAt, '2026-11-24T18:05:00.000Z')
  assert.equal(calculateConsensusStatus(reports, new Date(active.nextUpdateAt), windowMs).status, false)
})

test('a clear report expires into unknown at the end of the consensus window', () => {
  const reports = [{ isTrainCrossing: false, reportedAt: start, expiresAt: null }]
  const active = calculateConsensusStatus(reports, start, windowMs)
  assert.equal(active.status, false)
  const expired = calculateConsensusStatus(reports, new Date(active.nextUpdateAt), windowMs)
  assert.equal(expired.status, null)
  assert.equal(expired.nextUpdateAt, null)
})
