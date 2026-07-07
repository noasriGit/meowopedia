/**
 * Pick a random draft time within the configured daily window.
 */

export function todayInTimezone(timezone) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/**
 * Convert a local wall-clock time in `timeZone` to UTC epoch milliseconds.
 */
export function zonedTimeToUtcMs(datePart, hour, minute, timeZone) {
  const [year, month, day] = datePart.split("-").map(Number);
  const target = `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")} ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

  let low = Date.UTC(year, month - 1, day, 0, 0, 0);
  let high = Date.UTC(year, month - 1, day + 1, 0, 0, 0);

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    const parts = Object.fromEntries(
      formatter.formatToParts(new Date(mid)).map((part) => [part.type, part.value]),
    );
    const formatted = `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}`;
    if (formatted < target) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }

  return low;
}

export function randomDraftAt({ date, startHour, endHour, timezone }) {
  const windowMinutes = (endHour - startHour) * 60;
  if (windowMinutes <= 0) {
    throw new Error("draft window endHour must be greater than startHour");
  }

  const offsetMinutes = Math.floor(Math.random() * windowMinutes);
  const totalMinutes = startHour * 60 + offsetMinutes;
  const draftHour = Math.floor(totalMinutes / 60);
  const draftMinute = totalMinutes % 60;

  const datePart = date ?? todayInTimezone(timezone);
  const draftAtEpochMs = zonedTimeToUtcMs(datePart, draftHour, draftMinute, timezone);

  return {
    draftAt: `${datePart}T${String(draftHour).padStart(2, "0")}:${String(draftMinute).padStart(2, "0")}:00`,
    draftAtIso: new Date(draftAtEpochMs).toISOString(),
    draftAtEpochMs,
    timezone,
    window: { startHour, endHour },
  };
}

export function isDraftDue(queue, now = new Date()) {
  if (!queue?.keyword || queue.drafted) return false;

  if (typeof queue.draftAtEpochMs === "number") {
    return now.getTime() >= queue.draftAtEpochMs;
  }

  if (queue.draftAtIso) {
    return now >= new Date(queue.draftAtIso);
  }

  return false;
}
