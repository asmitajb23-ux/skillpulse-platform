// Deterministic QR-style code rendered as SVG.
// Visual placeholder for the future public verification URL — swap for a
// real QR library when public passport links go live.

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SIZE = 25;

export function QrCode({ value, className }: { value: string; className?: string }) {
  const rand = mulberry32(hashString(value));

  const isFinderZone = (r: number, c: number) =>
    (r < 7 && c < 7) || (r < 7 && c >= SIZE - 7) || (r >= SIZE - 7 && c < 7);

  const cells: boolean[][] = [];
  for (let r = 0; r < SIZE; r++) {
    const row: boolean[] = [];
    for (let c = 0; c < SIZE; c++) {
      row.push(isFinderZone(r, c) ? false : rand() > 0.52);
    }
    cells.push(row);
  }

  const finder = (r0: number, c0: number) => (
    <g key={`${r0}-${c0}`}>
      <rect x={c0} y={r0} width={7} height={7} fill="#0f172a" rx={1} />
      <rect x={c0 + 1} y={r0 + 1} width={5} height={5} fill="#fff" rx={0.5} />
      <rect x={c0 + 2} y={r0 + 2} width={3} height={3} fill="#0f172a" rx={0.5} />
    </g>
  );

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className={className}
      role="img"
      aria-label={`QR code linking to ${value}`}
      shapeRendering="crispEdges"
    >
      <rect width={SIZE} height={SIZE} fill="#fff" />
      {cells.map((row, r) =>
        row.map((on, c) =>
          on ? <rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill="#0f172a" /> : null
        )
      )}
      {finder(0, 0)}
      {finder(0, SIZE - 7)}
      {finder(SIZE - 7, 0)}
    </svg>
  );
}
