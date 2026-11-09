export function todayIso() {
  const now = new Date();
  const pad = value => String(value).padStart(2, '0');
  return now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate());
}

export function todayLabel() {
  return new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export function isValidIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return false;
  const [year, month, day] = String(value).split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day;
}

export function createRecordId() {
  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 12);
}

export function mergePendingData(cloud, pending) {
  const merge = (remote = [], local = [], preserveFields = []) => {
    const byId = new Map(remote.map(record => [String(record.id), record]));
    for (const record of local) {
      const previous = byId.get(String(record.id));
      const merged = previous ? { ...previous, ...record } : record;
      for (const field of preserveFields) if (merged[field] == null && previous?.[field] != null) merged[field] = previous[field];
      byId.set(String(record.id), merged);
    }
    return Array.from(byId.values());
  };
  return {
    profiles: merge(cloud.profiles, pending.profiles, ['avatarImage']),
    logs: merge(cloud.logs, pending.logs),
    labs: merge(cloud.labs, pending.labs),
    assessments: merge(cloud.assessments, pending.assessments),
    active: pending.active || cloud.active || null,
  };
}
