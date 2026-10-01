"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const COLORS = ["#6366f1", "#3b82f6", "#10b981", "#f59e0b", "#f43f5e", "#8b5cf6", "#06b6d4", "#84cc16", "#ec4899", "#64748b"];

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid #e2e8f0",
  boxShadow: "0 4px 12px rgba(16,24,40,0.08)",
  fontSize: 13,
};

export function SkillGapRadar({
  data,
}: {
  data: { skill: string; current: number; required: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <RadarChart data={data} outerRadius="72%">
        <PolarGrid stroke="#e2e8f0" />
        <PolarAngleAxis dataKey="skill" tick={{ fontSize: 12, fill: "#64748b" }} />
        <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} axisLine={false} />
        <Radar name="Required level" dataKey="required" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.18} />
        <Radar name="Your level" dataKey="current" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
        <Legend wrapperStyle={{ fontSize: 13 }} />
        <Tooltip contentStyle={tooltipStyle} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

export function ScoreBarChart({
  data,
  xKey,
  bars,
  horizontal = false,
  height = 300,
}: {
  data: Record<string, string | number>[];
  xKey: string;
  bars: { key: string; label: string; color?: string }[];
  horizontal?: boolean;
  height?: number;
}) {
  const Chart = horizontal ? BarChart : BarChart;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <Chart data={data} layout={horizontal ? "vertical" : "horizontal"} margin={{ left: horizontal ? 20 : 0, right: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={horizontal} horizontal={!horizontal} />
        {horizontal ? (
          <>
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12, fill: "#64748b" }} />
            <YAxis type="category" dataKey={xKey} width={110} tick={{ fontSize: 12, fill: "#334155" }} />
          </>
        ) : (
          <>
            <XAxis dataKey={xKey} tick={{ fontSize: 12, fill: "#64748b" }} interval={0} angle={data.length > 6 ? -20 : 0} height={data.length > 6 ? 60 : 30} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#64748b" }} width={36} />
          </>
        )}
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#f1f5f9" }} />
        <Legend wrapperStyle={{ fontSize: 13 }} />
        {bars.map((bar, i) => (
          <Bar key={bar.key} dataKey={bar.key} name={bar.label} fill={bar.color ?? COLORS[i % COLORS.length]} radius={horizontal ? [0, 6, 6, 0] : [6, 6, 0, 0]} barSize={horizontal ? 16 : 28} />
        ))}
      </Chart>
    </ResponsiveContainer>
  );
}

export function CountBarChart({
  data,
  xKey,
  barKey,
  label,
  color = "#6366f1",
  height = 300,
  maxValue,
}: {
  data: Record<string, string | number>[];
  xKey: string;
  barKey: string;
  label: string;
  color?: string;
  height?: number;
  maxValue?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ right: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis dataKey={xKey} tick={{ fontSize: 12, fill: "#64748b" }} interval={0} angle={data.length > 6 ? -20 : 0} height={data.length > 6 ? 60 : 30} />
        <YAxis allowDecimals={false} domain={maxValue ? [0, maxValue] : undefined} tick={{ fontSize: 12, fill: "#64748b" }} width={36} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#f1f5f9" }} />
        <Bar dataKey={barKey} name={label} fill={color} radius={[6, 6, 0, 0]} barSize={32} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function HorizontalCountChart({
  data,
  yKey,
  barKey,
  label,
  color = "#6366f1",
  height = 300,
}: {
  data: Record<string, string | number>[];
  yKey: string;
  barKey: string;
  label: string;
  color?: string;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: "#64748b" }} />
        <YAxis type="category" dataKey={yKey} width={130} tick={{ fontSize: 12, fill: "#334155" }} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#f1f5f9" }} />
        <Bar dataKey={barKey} name={label} fill={color} radius={[0, 6, 6, 0]} barSize={18} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ReadinessPie({ data }: { data: { range: string; count: number }[] }) {
  const filtered = data.filter((d) => d.count > 0);
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie data={filtered} dataKey="count" nameKey="range" cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={3} strokeWidth={2}>
          {filtered.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 13 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function TrendLineChart({
  data,
  xKey,
  lines,
  height = 300,
}: {
  data: Record<string, string | number>[];
  xKey: string;
  lines: { key: string; label: string; color?: string }[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ right: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey={xKey} tick={{ fontSize: 12, fill: "#64748b" }} />
        <YAxis tick={{ fontSize: 12, fill: "#64748b" }} width={36} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 13 }} />
        {lines.map((line, i) => (
          <Line
            key={line.key}
            type="monotone"
            dataKey={line.key}
            name={line.label}
            stroke={line.color ?? COLORS[i % COLORS.length]}
            strokeWidth={2.5}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export { COLORS };
