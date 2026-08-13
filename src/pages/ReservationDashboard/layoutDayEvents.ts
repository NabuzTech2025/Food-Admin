// Pure day-view layout: assign each timed item a column so overlapping
// bookings sit side by side (Google-Calendar style). Kept framework-free so
// it can be reasoned about and checked on its own.

export interface TimedItem {
  start: number; // minutes from midnight
  end: number; // minutes from midnight
}

export interface Placed<T> {
  item: T;
  col: number; // 0-based column index
  cols: number; // total columns in this item's overlap cluster
}

// Greedy interval graph colouring, clustered so every item in a run of
// mutually-overlapping bookings shares the same column count (equal widths).
export function layoutDayEvents<T extends TimedItem>(items: T[]): Placed<T>[] {
  const sorted = [...items].sort((a, b) => a.start - b.start || a.end - b.end);
  const out: Placed<T>[] = [];
  let cluster: Placed<T>[] = [];
  let colEnds: number[] = []; // last end time per active column
  let clusterEnd = -Infinity;

  const flush = () => {
    const cols = colEnds.length;
    for (const p of cluster) p.cols = cols;
    out.push(...cluster);
    cluster = [];
    colEnds = [];
  };

  for (const item of sorted) {
    if (cluster.length && item.start >= clusterEnd) flush();

    let col = colEnds.findIndex((end) => end <= item.start);
    if (col === -1) {
      col = colEnds.length;
      colEnds.push(item.end);
    } else {
      colEnds[col] = item.end;
    }

    cluster.push({ item, col, cols: 1 });
    clusterEnd = Math.max(clusterEnd, item.end);
  }
  if (cluster.length) flush();

  return out;
}
