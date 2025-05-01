import React, {useState} from "react";
import {
    ResponsiveContainer,
    ComposedChart,
    Area,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from "recharts";
import {FaExpandAlt, FaTimes} from "react-icons/fa";
import {Card, CardHeader, CardTitle, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";

export default function CommonComposedChart({
                                                data,
                                                title,
                                                series,
                                                height = 300,
                                                // tailwind supports only certain widths – here we default to 'max-w-6xl'
                                                maxWidthClass = "max-w-6xl",
                                                // you can pass anything valid to CSS height, e.g. '80vh' or '600px'
                                                modalHeight = "80vh",
                                            }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // which series keys are currently visible
    const [visibleKeys, setVisibleKeys] = useState(series.map((s) => s.key));
    const toggleKey = (key) =>
        setVisibleKeys((vk) =>
            vk.includes(key) ? vk.filter((k) => k !== key) : [...vk, key]
        );

    // adjust timestamps to IST
    const chartData = data.map((row) => {
        const dt = new Date(row.timestamp);
        const offset = 5.5 * 60 * 60 * 1000;
        const adjusted = new Date(dt.getTime() - offset);
        return {
            ...row,
            TimeStampIST: adjusted.toLocaleString("en-IN", {
                day: "2-digit",
                month: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
            }),
        };
    });

    const SeriesSelector = () => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline">
                    Select Series
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="bottom" align="start">
                {series.map((s) => (
                    <DropdownMenuCheckboxItem
                        key={s.key}
                        checked={visibleKeys.includes(s.key)}
                        onCheckedChange={() => toggleKey(s.key)}
                    >
                        {s.label}
                    </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );

    const chartElement = (
        <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
                data={chartData}
                margin={{top: 40, right: 20, left: 0, bottom: 20}}
            >
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey="TimeStampIST" hide/>
                <YAxis hide/>
                <Tooltip/>
                {/*<Legend verticalAlign="buttom" height={36}/>*/}
                {series.map((s) =>
                    visibleKeys.includes(s.key) ? (
                        s.type === "area" ? (
                            <Area
                                key={s.key}
                                type="monotone"
                                dataKey={s.key}
                                name={s.label}
                                stackId={s.stackId ?? "a"}
                                stroke={s.color}
                                fill={s.color}
                            />
                        ) : (
                            <Line
                                key={s.key}
                                type="monotone"
                                dataKey={s.key}
                                name={s.label}
                                stroke={s.color}
                                strokeWidth={2}
                                dot={false}
                            />
                        )
                    ) : null
                )}
            </ComposedChart>
        </ResponsiveContainer>
    );

    return (
        <>
            {/* INLINE CARD */}
            <Card className="mt-8">
                <CardHeader className="flex flex-row items-center justify-between p-4 border-b rounded-t-lg">
                    <div className="flex items-center space-x-4">
                        <CardTitle className="text-lg m-0">{title}</CardTitle>
                        <SeriesSelector/>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => setIsModalOpen(true)}>
                        <FaExpandAlt/>
                    </Button>
                </CardHeader>
                <CardContent>
                    <div style={{height}} className="w-full overflow-hidden rounded-lg shadow-sm">
                        {chartElement}
                    </div>
                </CardContent>
            </Card>

            {/* EXPANDED MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* backdrop */}
                    <div
                        className="absolute inset-0 bg-black opacity-30"
                        onClick={() => setIsModalOpen(false)}
                    />

                    <div
                        className={`relative bg-white rounded-lg shadow-lg w-full ${maxWidthClass} flex flex-col overflow-hidden`}
                        style={{height: modalHeight}}
                    >
                        <div className="flex items-center justify-between p-4 border-b rounded-t-lg">
                            <div className="flex items-center space-x-4">
                                <CardTitle className="text-lg m-0">{title}</CardTitle>
                                <SeriesSelector/>
                            </div>
                            <Button size="sm" variant="ghost" onClick={() => setIsModalOpen(false)}>
                                <FaTimes/>
                            </Button>
                        </div>
                        <div className="flex-1 p-4">{chartElement}</div>
                    </div>
                </div>
            )}
        </>
    );
}