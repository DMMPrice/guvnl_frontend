import React from "react";
import {
    CartesianGrid,
    Line,
    LineChart,
    XAxis,
    YAxis,
    Legend
} from "recharts";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent
} from "@/components/ui/chart";

export default function DemandLineChart({data, chartConfig}) {
    return (
        <div className="mt-8">
            <Card>
                <CardHeader>
                    <CardTitle>Raw Demand (Actual vs Predicted)</CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig}>
                        <LineChart
                            data={data}
                            margin={{
                                top: 60,
                                left: 12,
                                right: 12,
                                bottom: 20,
                            }}
                        >
                            <CartesianGrid vertical={false}/>

                            {/* ✅ Use IST-formatted labels */}
                            <XAxis
                                dataKey="TimeStampIST"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                minTickGap={30}
                            />

                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                            />

                            <Legend verticalAlign="bottom" align="center" height={36}/>

                            <ChartTooltip cursor={false} content={<ChartTooltipContent/>}/>

                            <Line
                                dataKey="Demand(Actual)"
                                name={chartConfig.actual.label}
                                type="monotone"
                                stroke={chartConfig.actual.color}
                                strokeWidth={2}
                                dot={false}
                            />
                            <Line
                                dataKey="Demand(Pred)"
                                name={chartConfig.pred.label}
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