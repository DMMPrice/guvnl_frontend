import React, {useState, useRef} from "react";
import {
    ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip
} from "recharts";
import {FaExpandAlt, FaTimes} from "react-icons/fa";
import {Card, CardHeader, CardTitle, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {
    DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";

export default function CommonComposedChart({
                                                data,
                                                title,
                                                series,
                                                height = 300,
                                                maxWidthClass = "max-w-6xl",
                                                modalHeight = "80vh",
                                                bgColor = "bg-blue-100",         // default background
                                                titleColor = "text-blue-900",    // default heading color
                                                downloadFileName,                // optional custom filename
                                            }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [visibleKeys, setVisibleKeys] = useState(series.map((s) => s.key));

    // refs to grab the SVG inside the chart area for export
    const inlineChartRef = useRef(null);
    const modalChartRef = useRef(null);

    const toggleKey = (key) =>
        setVisibleKeys((vk) =>
            vk.includes(key) ? vk.filter((k) => k !== key) : [...vk, key]
        );

    // IST conversion
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
                <Button size="sm" variant="outline">Select Series</Button>
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

    // ----- JPG EXPORT (SVG -> Canvas -> JPEG) -----
    const exportJPG = async (which = "inline") => {
        const container = which === "modal" ? modalChartRef.current : inlineChartRef.current;
        if (!container) return;

        const svg = container.querySelector("svg");
        if (!svg) return;

        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svg);

        const svgBlob = new Blob([svgString], {type: "image/svg+xml;charset=utf-8"});
        const url = URL.createObjectURL(svgBlob);

        const img = new Image();
        // important to avoid tainting canvas if custom fonts/external images are present
        img.crossOrigin = "anonymous";

        img.onload = () => {
            const scale = 2; // export at 2x for sharper image
            const w = svg.viewBox.baseVal?.width || svg.clientWidth || 1200;
            const h = svg.viewBox.baseVal?.height || svg.clientHeight || 600;

            const canvas = document.createElement("canvas");
            canvas.width = Math.max(1, Math.floor(w * scale));
            canvas.height = Math.max(1, Math.floor(h * scale));
            const ctx = canvas.getContext("2d");
            // optional: fill with a light bg so JPEG doesn’t show black where transparent
            ctx.fillStyle = "#e6f0ff"; // a soft blue to match default
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
            const a = document.createElement("a");
            a.href = dataUrl;
            a.download = (downloadFileName || `${title || "chart"}.jpg`).replace(/\s+/g, "_");
            a.click();

            URL.revokeObjectURL(url);
        };

        img.onerror = () => URL.revokeObjectURL(url);
        img.src = url;
    };

    const chartElement = (
        <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{top: 40, right: 20, left: 0, bottom: 20}}>
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey="TimeStampIST" hide/>
                <YAxis hide/>
                <Tooltip/>
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
            <Card className={`mt-8 ${bgColor}`}>
                <CardHeader className="flex flex-row items-center justify-between p-4 border-b rounded-t-lg">
                    <div className="flex items-center space-x-4">
                        <CardTitle className={`text-lg m-0 ${titleColor}`}>{title}</CardTitle>
                        <SeriesSelector/>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => exportJPG("inline")}>
                            Download JPG
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setIsModalOpen(true)}>
                            <FaExpandAlt/>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div
                        ref={inlineChartRef}
                        style={{height}}
                        className="w-full overflow-hidden rounded-lg shadow-sm bg-transparent"
                    >
                        {chartElement}
                    </div>
                </CardContent>
            </Card>

            {/* EXPANDED MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* backdrop */}
                    <div className="absolute inset-0 bg-black opacity-30" onClick={() => setIsModalOpen(false)}/>
                    <div
                        className={`relative ${bgColor} rounded-lg shadow-lg w-full ${maxWidthClass} flex flex-col overflow-hidden`}
                        style={{height: modalHeight}}
                    >
                        <div className="flex items-center justify-between p-4 border-b rounded-t-lg">
                            <div className="flex items-center space-x-4">
                                <CardTitle className={`text-lg m-0 ${titleColor}`}>{title}</CardTitle>
                                <SeriesSelector/>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button size="sm" variant="outline" onClick={() => exportJPG("modal")}>
                                    Download JPG
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => setIsModalOpen(false)}>
                                    <FaTimes/>
                                </Button>
                            </div>
                        </div>
                        <div ref={modalChartRef} className="flex-1 p-4">
                            {chartElement}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}