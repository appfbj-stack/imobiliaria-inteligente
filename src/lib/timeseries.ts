/** Buckets a list of ISO date strings into the last `months` calendar months, oldest first. */
export function monthlyCounts(dates: string[], months = 6, reference = new Date()) {
  const buckets = Array.from({ length: months }, (_, i) => {
    const d = new Date(Date.UTC(reference.getFullYear(), reference.getMonth() - (months - 1 - i), 1));
    return { year: d.getUTCFullYear(), month: d.getUTCMonth(), value: 0 };
  });

  dates.forEach((iso) => {
    const d = new Date(iso);
    const bucket = buckets.find((b) => b.year === d.getUTCFullYear() && b.month === d.getUTCMonth());
    if (bucket) bucket.value += 1;
  });

  return buckets.map((b) => ({ value: b.value }));
}

export function percentChange(series: { value: number }[]) {
  if (series.length < 2) return 0;
  const prev = series[series.length - 2].value;
  const current = series[series.length - 1].value;
  if (prev === 0) return current > 0 ? 100 : 0;
  return ((current - prev) / prev) * 100;
}
