import React from "react";
import { CartesianGrid, Line, LineChart, XAxis, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export default function DemandLineChart({ dailyData, chartConfig }) {
  return (
    <div className="mt-8">
      <Card>
        <CardHeader>
          <CardTitle>Daily Demand (Actual vs Predicted)</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <LineChart
              data={dailyData}
              margin={{
                left: 12,
                right: 12,
              }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <Legend verticalAlign="top" height={36} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Line
                dataKey="actual"
                type="monotone"
                stroke={chartConfig.actual.color}
                strokeWidth={2}
                dot={false}
              />
              <Line
                dataKey="pred"
                type="monotone"
                stroke={chartConfig.pred.color}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
