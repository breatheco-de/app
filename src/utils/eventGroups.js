const startMs = (event) => new Date(event?.starting_at).getTime();
const endMs = (event) => new Date(event?.ending_at || event?.ended_at).getTime();

export function pickGroupRepresentative(events, now = new Date()) {
  if (!Array.isArray(events) || events.length === 0) return null;

  const nowMs = now.getTime();
  const byStart = [...events].sort((a, b) => startMs(a) - startMs(b));
  const inProgress = byStart.find((event) => startMs(event) <= nowMs && nowMs < endMs(event));
  if (inProgress) return inProgress;

  const upcoming = byStart.find((event) => startMs(event) > nowMs);
  if (upcoming) return upcoming;

  return byStart[byStart.length - 1];
}

export function seriesPosition(events, current) {
  if (!Array.isArray(events) || !current || events.length < 2) return null;
  const ordered = [...events].sort((a, b) => startMs(a) - startMs(b));
  const index = ordered.findIndex((item) => item?.id === current.id || item?.slug === current.slug);
  if (index < 0) return null;
  return { index: index + 1, total: ordered.length };
}

export function collapseEventsByGroup(events, now = new Date()) {
  if (!Array.isArray(events)) return [];

  const groups = new Map();
  events.forEach((event) => {
    const key = event?.event_group;
    if (!key) return;
    const list = groups.get(key) || [];
    list.push(event);
    groups.set(key, list);
  });

  const seen = new Set();
  const collapsed = [];
  events.forEach((event) => {
    const key = event?.event_group;
    if (!key) {
      collapsed.push(event);
      return;
    }
    if (seen.has(key)) return;
    seen.add(key);
    const members = groups.get(key);
    const representative = pickGroupRepresentative(members, now);
    const series = seriesPosition(members, representative);
    if (representative) collapsed.push(series ? { ...representative, eventGroupSeries: series } : representative);
  });

  return collapsed;
}
