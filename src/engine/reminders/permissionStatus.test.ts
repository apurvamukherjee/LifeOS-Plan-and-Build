import { describe, expect, it } from 'vitest'
import { evaluateReminderHealth } from './permissionStatus'

describe('evaluateReminderHealth', () => {
  it('reports no issue when both permissions are granted', () => {
    const health = evaluateReminderHealth('granted', 'granted')
    expect(health).toEqual({ hasIssue: false, notificationDenied: false, exactAlarmDenied: false })
  })

  it('flags a denied notification permission', () => {
    const health = evaluateReminderHealth('denied', 'granted')
    expect(health.hasIssue).toBe(true)
    expect(health.notificationDenied).toBe(true)
    expect(health.exactAlarmDenied).toBe(false)
  })

  it('flags a denied exact-alarm permission', () => {
    const health = evaluateReminderHealth('granted', 'denied')
    expect(health.hasIssue).toBe(true)
    expect(health.notificationDenied).toBe(false)
    expect(health.exactAlarmDenied).toBe(true)
  })

  it('flags both when both are denied', () => {
    const health = evaluateReminderHealth('denied', 'denied')
    expect(health).toEqual({ hasIssue: true, notificationDenied: true, exactAlarmDenied: true })
  })

  it('does not treat "prompt" as an issue — the normal request flow can still succeed', () => {
    const health = evaluateReminderHealth('prompt', 'prompt')
    expect(health.hasIssue).toBe(false)
  })

  it('does not treat "prompt-with-rationale" as an issue', () => {
    const health = evaluateReminderHealth('prompt-with-rationale', 'granted')
    expect(health.hasIssue).toBe(false)
  })
})
