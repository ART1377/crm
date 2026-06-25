"use client";

import ReactECharts from "echarts-for-react";
import { PieChart } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface IndustryNightingaleProps {
  data: { name: string; value: number }[];
}

export function IndustryChart({ data }: IndustryNightingaleProps) {
  if (data.length === 0) return null;

  const sorted = [...data].sort((a, b) => b.value - a.value);

  const option = {
    tooltip: {
      trigger: "item",
      textStyle: { fontFamily: "Vazirmatn, sans-serif", fontSize: 12 },
      formatter: "{b}: {c} سرنخ ({d}%)",
    },
    legend: {
      top: "bottom",
      left: "right",
      textStyle: {
        fontFamily: "Vazirmatn, sans-serif",
        fontSize: 10,
        color: "hsl(var(--foreground))",
      },
      itemGap: 16,
      itemWidth: 12,
      itemHeight: 12,
    },
    series: [
      {
        top: "-10%",
        name: "صنعت",
        type: "pie",
        radius: ["40%", "70%"],
        center: ["50%", "45%"],
        avoidLabelOverlap: false,
        padAngle: 5,
        itemStyle: {
          borderRadius: 10,
          borderColor: "hsl(var(--background))",
          borderWidth: 3,
        },
        label: {
          show: false,
          position: "center",
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 24,
            fontWeight: "bold",
          },
          scaleSize: 10,
        },
        labelLine: {
          show: false,
        },
        data: sorted,
      },
    ],
    color: [
      "#3b82f6",
      "#8b5cf6",
      "#22c55e",
      "#f59e0b",
      "#ef4444",
      "#06b6d4",
      "#ec4899",
      "#84cc16",
      "#f97316",
      "#14b8a6",
      "#6366f1",
      "#d946ef",
    ],
  };

  return (
    <Card className="min-h-fit flex-1">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <PieChart className="h-4 w-4 text-purple-500" />
          توزیع صنعت
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ReactECharts option={option} style={{ height: 500 }} />
      </CardContent>
    </Card>
  );
}
