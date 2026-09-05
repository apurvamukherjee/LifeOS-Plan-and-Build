/** The next occurrence (today if the time hasn't passed yet, else tomorrow) of a given local
 * HH:mm — the "daily reminder" scheduling primitive shared by both the native and in-app paths. */
export function nextOccurrenceOf(hour: number, minute: number, now: Date = new Date()): Date {
  const candidate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0, 0)
  if (candidate.getTime() <= now.getTime()) {
    candidate.setDate(candidate.getDate() + 1)
  }
  return candidate
}
