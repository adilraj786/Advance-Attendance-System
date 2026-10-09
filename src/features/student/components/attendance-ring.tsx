export function AttendanceRing({
  percent,
  size = 148,
  label = "Overall",
}: {
  percent: number;
  size?: number;
  label?: string;
}) {
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (percent / 100) * c;
  const tone = percent >= 85 ? "var(--present)" : percent >= 75 ? "var(--accent)" : "var(--absent)";

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--muted)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={tone}
          strokeWidth={stroke}
          strokeDasharray={`${dash} ${c - dash}`}
          strokeLinecap="butt"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-[30px] font-semibold leading-none tabular">{percent}%</span>
        <span className="mt-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}
