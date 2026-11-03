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

const sameSession = (item, current) => (
  (current?.id != null && item?.id === current.id) || (current?.slug && item?.slug === current.slug)
);

export function seriesPosition(events, current) {
  if (!Array.isArray(events) || !current || events.length === 0) return null;
  const ordered = [...events].sort((a, b) => startMs(a) - startMs(b));
  const index = ordered.findIndex((item) => sameSession(item, current));
  if (index < 0) return null;
  return { index: index + 1, total: ordered.length };
}

export function withFullGroupSeries(events, catalog) {
  if (!Array.isArray(events)) return [];
  const source = Array.isArray(catalog) ? catalog : [];
  const groups = new Map();
  source.forEach((event) => {
    const key = event?.event_group;
    if (!key) return;
    const list = groups.get(key) || [];
    list.push(event);
    groups.set(key, list);
  });

  return events.map((event) => {
    const key = event?.event_group;
    if (!key || !event?.starting_at) return event;
    const members = groups.get(key) || [];
    const group = members.some((item) => sameSession(item, event)) ? members : [...members, event];
    const series = seriesPosition(group, event);
    return series ? { ...event, eventGroupSeries: series } : event;
  });
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
