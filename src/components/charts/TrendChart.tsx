"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import type { KpiPoint } from "@/lib/types";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils";

type TrendLine = {
  key: keyof KpiPoint;
  color: string;
  name: string;
  axis?: "left" | "right";
  format?: "number" | "currency";
};

function valueFormatter(format: TrendLine["format"]) {
  return format === "currency" ? formatCurrency : formatNumber;
}

export function TrendChart({ data, lines }: { data: KpiPoint[]; lines: TrendLine[] }) {
  const hasRightAxis = lines.some((l) => l.axis === "right");
  const leftFormat = lines.find((l) => l.axis !== "right")?.format ?? "number";
  const rightFormat = lines.find((l) => l.axis === "right")?.format ?? "number";
  const formatByKey = Object.fromEntries(lines.map((l) => [l.key, l.format ?? "number"]));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 10, right: hasRightAxis ? 8 : 16, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="#2b2438" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={(v) => formatDate(v).slice(0, 6)}
          stroke="#9791a3"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          minTickGap={24}
        />
        <YAxis
          yAxisId="left"
          stroke="#9791a3"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => (leftFormat === "currency" ? `₦${Math.round(v / 1000)}k` : formatNumber(v))}
          width={leftFormat === "currency" ? 52 : 44}
        />
        {hasRightAxis && (
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#9791a3"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => (rightFormat === "currency" ? `₦${Math.round(v / 1000)}k` : formatNumber(v))}
            width={rightFormat === "currency" ? 52 : 40}
          />
        )}
        <Tooltip
          contentStyle={{
            background: "#1d1828",
            border: "1px solid #2b2438",
            borderRadius: 8,
            fontSize: 12,
          }}
          labelFormatter={(v) => formatDate(String(v))}
          formatter={(value, name, item) => [
            valueFormatter(formatByKey[item.dataKey as string])(Number(value)),
            String(name),
          ]}
        />
        <Legend wrapperStyle={{ fontSize: 12, color: "#9791a3" }} />
        {lines.map((line) => (
          <Line
            key={String(line.key)}
            yAxisId={line.axis === "right" ? "right" : "left"}
            type="monotone"
            dataKey={line.key}
            name={line.name}
            stroke={line.color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
