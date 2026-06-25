"use client";

import ReactECharts from "echarts-for-react";
import { Activity } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WeeklyCalendarProps {
  data: { date: string; count: number }[];
}

function getCalendarData(data: { date: string; count: number }[]) {
  const today = new Date();
  const result: [string, number][] = [];

  for (let i = 90; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const key = date.toISOString().split("T")[0];
    const found = data.find((d) => d.date === key);
    result.push([key, found?.count ?? 0]);
  }

  return result;
}

export function WeeklyCalendar({ data }: WeeklyCalendarProps) {
  const calendarData = getCalendarData(data);

  const option = {
    tooltip: {
      position: "top",
      textStyle: { fontFamily: "Vazirmatn, sans-serif", fontSize: 12 },
      formatter: (params: any) => {
        const date = new Date(params.value[0]);
        const persianDate = date.toLocaleDateString("fa-IR", { dateStyle: "full" });
        return `${persianDate}<br/>${params.value[1]} فعالیت`;
      },
    },
    visualMap: {
      min: 0,
      max: Math.max(...calendarData.map((d) => d[1]), 1),
      type: "piecewise",
      orient: "horizontal",
      left: "center",
      bottom: 0,
      textStyle: {
        color: "hsl(var(--muted-foreground))",
        fontFamily: "Vazirmatn, sans-serif",
        fontSize: 10,
      },
      pieces: [
        { min: 0, max: 0, color: "#f1f5f9", label: "بدون فعالیت" }, // light gray
        { min: 1, max: 3, color: "#bfdbfe", label: "کم" }, // blue-100
        { min: 4, max: 15, color: "#60a5fa", label: "متوسط" }, // blue-400
        { min: 16, max: 25, color: "#3b82f6", label: "زیاد" }, // blue-500
        { min: 26, max: 999, color: "#1d4ed8", label: "بسیار زیاد" }, // blue-700
      ],
    },
    calendar: {
      top: 20,
      left: 24,
      right: 24,
      cellSize: ["auto", 16],
      range: [
        new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString().split("T")[0],
        new Date().toISOString().split("T")[0],
      ],
      itemStyle: {
        borderRadius: 4,
        borderColor: "hsl(var(--background))",
        borderWidth: 2,
      },
      yearLabel: { show: false },
      monthLabel: {
        fontFamily: "Vazirmatn, sans-serif",
        fontSize: 11,
        color: "hsl(var(--muted-foreground))",
      },
      dayLabel: {
        fontFamily: "Vazirmatn, sans-serif",
        fontSize: 10,
        color: "hsl(var(--muted-foreground))",
      },
    },
    series: [
      {
        type: "heatmap",
        coordinateSystem: "calendar",
        data: calendarData,
      },
    ],
  };

  return (
    <Card className="min-h-fit flex-1">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Activity className="h-4 w-4 text-orange-500" />
          تقویم فعالیت
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ReactECharts option={option} style={{ height: 220 }} />
      </CardContent>
    </Card>
  );
}
