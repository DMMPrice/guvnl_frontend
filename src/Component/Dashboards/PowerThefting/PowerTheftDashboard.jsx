// src/Component/Dashboards/PowerThefting/PowerTheftDashboard.jsx
import React, {useState, useEffect} from 'react';
import {Card} from '@/components/ui/card';
import CommonComposedChart from '@/Component/Utils/CommonComposedChart.jsx';
import CommonTable from '@/Component/Utils/CommonTable.jsx';
import {API_URL} from '@/config.js';
import {toast, ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {Loader2} from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import BasicDateTimePicker from '@/Component/Utils/DateTimeBlock.jsx';

export default function PowerTheftDashboard() {
    // ─── Pending (editable) filter state ─────────────────────────────────────
    const [pendingRegion, setPendingRegion] = useState('');
    const [pendingDivision, setPendingDivision] = useState('');
    const [pendingSubstation, setPendingSubstation] = useState('');
    const [pendingFeeder, setPendingFeeder] = useState('');
    const [pendingDtr, setPendingDtr] = useState('');
    const [pendingStartDt, setPendingStartDt] = useState(null);
    const [pendingEndDt, setPendingEndDt] = useState(null);

    // ─── Applied (active) filter state ──────────────────────────────────────
    const [region, setRegion] = useState('');
    const [division, setDivision] = useState('');
    const [substation, setSubstation] = useState('');
    const [feeder, setFeeder] = useState('');
    const [dtr, setDtr] = useState('');
    const [startDt, setStartDt] = useState(null);
    const [endDt, setEndDt] = useState(null);

    // ─── Data & loading ─────────────────────────────────────────────────────
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // ─── Lookup lists ───────────────────────────────────────────────────────
    const [regions, setRegions] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const [substations, setSubstations] = useState([]);
    const [feeders, setFeeders] = useState([]);
    const [dtrs, setDtrs] = useState([]);

    // ─── Load Regions on mount ──────────────────────────────────────────────
    useEffect(() => {
        fetch(`${API_URL}region/`)
            .then(r => r.json())
            .then(setRegions)
            .catch(e => {
                console.error(e);
                toast.error('Failed to load regions');
            });
    }, []);

    // ─── Refresh downstream when pendingRegion changes ──────────────────────
    useEffect(() => {
        setPendingDivision('');
        setPendingSubstation('');
        setPendingFeeder('');
        setPendingDtr('');
        setDivisions([]);
        if (!pendingRegion) return;
        fetch(`${API_URL}division/by-region/${pendingRegion}`)
            .then(r => r.json())
            .then(setDivisions)
            .catch(e => {
                console.error(e);
                toast.error('Failed to load divisions');
            });
    }, [pendingRegion]);

    // ─── Refresh substations when pendingDivision changes ──────────────────
    useEffect(() => {
        setPendingSubstation('');
        setPendingFeeder('');
        setPendingDtr('');
        setSubstations([]);
        if (!pendingDivision) return;
        fetch(`${API_URL}substation/by-division/${pendingDivision}`)
            .then(r => r.json())
            .then(setSubstations)
            .catch(e => {
                console.error(e);
                toast.error('Failed to load substations');
            });
    }, [pendingDivision]);

    // ─── Refresh feeders when pendingSubstation changes ────────────────────
    useEffect(() => {
        setPendingFeeder('');
        setPendingDtr('');
        setFeeders([]);
        if (!pendingSubstation) return;
        fetch(`${API_URL}feeder/by-substation/${pendingSubstation}`)
            .then(r => r.json())
            .then(list => setFeeders(Array.isArray(list) ? list : []))
            .catch(e => {
                console.error(e);
                toast.error('Failed to load feeders');
            });
    }, [pendingSubstation]);

    // ─── Refresh DTRs when pendingFeeder changes ───────────────────────────
    useEffect(() => {
        setPendingDtr('');
        setDtrs([]);
        if (!pendingFeeder) return;
        fetch(`${API_URL}dtr/by-feeder/${pendingFeeder}`)
            .then(r => r.json())
            .then(setDtrs)
            .catch(e => {
                console.error(e);
                toast.error('Failed to load DTRs');
            });
    }, [pendingFeeder]);

    // ─── Helper to fetch one consumption series ────────────────────────────
    const fetchSeries = (path, paramName, paramValue) => {
        const params = new URLSearchParams();
        params.append('start_date', startDt);
        params.append('end_date', endDt);
        params.append(paramName, paramValue);
        return fetch(`${API_URL}${path}?${params.toString()}`)
            .then(r => {
                if (!r.ok) throw new Error(r.statusText);
                return r.json();
            })
            .then(arr =>
                arr.map(o => ({
                    timestamp: o.Timestamp,
                    value: o.Energy_output,
                }))
            );
    };

    // ─── Fetch consumption on **applied** filters ───────────────────────────
    useEffect(() => {
        if (!startDt || !endDt) {
            setData([]);
            return;
        }

        setIsLoading(true);
        let promises = [];

        if (dtr) {
            // substation + feeder + dtr
            promises = [
                fetchSeries('substation/consumption', 'substation_id', substation),
                fetchSeries('feeder/consumption', 'feeder_id', feeder),
                fetchSeries('dtr/consumption', 'dtr_id', dtr),
            ];
        } else if (feeder) {
            // substation + feeder
            promises = [
                fetchSeries('substation/consumption', 'substation_id', substation),
                fetchSeries('feeder/consumption', 'feeder_id', feeder),
            ];
        } else if (substation) {
            // only substation
            promises = [fetchSeries('substation/consumption', 'substation_id', substation)];
        } else {
            setData([]);
            setIsLoading(false);
            return;
        }

        Promise.all(promises)
            .then(seriesArrays => {
                // merge by timestamp
                const merged = {};
                const keys = ['substation', 'feeder', 'dtr'];
                seriesArrays.forEach((arr, i) => {
                    const key = keys[i];
                    arr.forEach(pt => {
                        if (!merged[pt.timestamp]) merged[pt.timestamp] = {timestamp: pt.timestamp};
                        merged[pt.timestamp][key] = pt.value;
                    });
                });
                const mergedArr = Object.values(merged).sort((a, b) =>
                    a.timestamp.localeCompare(b.timestamp)
                );
                setData(mergedArr);
            })
            .catch(e => {
                console.error(e);
                toast.error('Failed to fetch consumption series');
                setData([]);
            })
            .finally(() => setIsLoading(false));
    }, [substation, feeder, dtr, startDt, endDt]);

    // ─── Handlers ──────────────────────────────────────────────────────────
    const handleApply = () => {
        setRegion(pendingRegion);
        setDivision(pendingDivision);
        setSubstation(pendingSubstation);
        setFeeder(pendingFeeder);
        setDtr(pendingDtr);
        setStartDt(pendingStartDt);
        setEndDt(pendingEndDt);
    };
    const handleCancel = () => {
        setPendingRegion(region);
        setPendingDivision(division);
        setPendingSubstation(substation);
        setPendingFeeder(feeder);
        setPendingDtr(dtr);
        setPendingStartDt(startDt);
        setPendingEndDt(endDt);
    };

    // ─── Dynamic labels ─────────────────────────────────────────────────────
    const substationName =
        substations.find(s => s.substation_id === substation)?.substation_name ||
        substation;
    const feederName =
        feeders.find(f => f.feeder_id === feeder)?.feeder_name || feeder;
    const dtrName =
        dtrs.find(d => d.dtr_id === dtr)?.location_description || dtr;

    // ─── Build chartData with +5:30h offset so CommonComposedChart’s built-in –5:30 yields correct IST ─
    const chartData = data.map(pt => {
        const ms = new Date(pt.timestamp).getTime();
        const adjusted = new Date(ms + 5.5 * 60 * 60 * 1000);
        return {...pt, timestamp: adjusted.toISOString()};
    });

    // ─── Chart & Table config ──────────────────────────────────────────────
    const chartConfig = {
        data: chartData,
        title: 'Consumption',
        xAxisKey: 'timestamp',
        xAxisFormatter: ts => new Date(ts).toLocaleString(),
        series: [
            {key: 'substation', label: substationName, type: 'line', stackId: '1', unit: 'kWh', color: "#8884d8"},
            ...(feeder
                ? [{key: 'feeder', label: feederName, type: 'line', stackId: '1', unit: 'kWh', color: "#82ca9d"}]
                : []),
            ...(dtr
                ? [{key: 'dtr', label: dtrName, type: 'line', stackId: '1', unit: 'kWh', color: "#ffc658"}]
                : []),
        ],
    };

    const tableColumns = [
        {header: 'Time', accessor: 'timestamp', cell: v => new Date(v).toLocaleString()},
        {
            header: `${substationName} (kWh)`,
            accessor: 'substation',
            cell: v => (v != null ? v.toLocaleString() : '—'),
        },
        ...(feeder
            ? [
                {
                    header: `${feederName} (kWh)`,
                    accessor: 'feeder',
                    cell: v => (v != null ? v.toLocaleString() : '—'),
                },
            ]
            : []),
        ...(dtr
            ? [
                {
                    header: `${dtrName} (kWh)`,
                    accessor: 'dtr',
                    cell: v => (v != null ? v.toLocaleString() : '—'),
                },
            ]
            : []),
    ];

    // ─── Render ────────────────────────────────────────────────────────────
    return (
        <div className="container mx-auto p-6 space-y-6">
            <ToastContainer position="top-right"/>

            {/* Filters */}
            <Card className="p-4">
                {/* Row 1: selects */}
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-4">
                    <Select value={pendingRegion} onValueChange={setPendingRegion}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Region"/>
                        </SelectTrigger>
                        <SelectContent>
                            {regions.map(r => (
                                <SelectItem key={r.region_id} value={r.region_id}>
                                    {r.region_name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select
                        value={pendingDivision}
                        onValueChange={setPendingDivision}
                        disabled={!pendingRegion}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Division"/>
                        </SelectTrigger>
                        <SelectContent>
                            {divisions.map(d => (
                                <SelectItem key={d.division_id} value={d.division_id}>
                                    {d.division_name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select
                        value={pendingSubstation}
                        onValueChange={setPendingSubstation}
                        disabled={!pendingDivision}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Substation"/>
                        </SelectTrigger>
                        <SelectContent>
                            {substations.map(s => (
                                <SelectItem key={s.substation_id} value={s.substation_id}>
                                    {s.substation_name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select
                        value={pendingFeeder}
                        onValueChange={setPendingFeeder}
                        disabled={!pendingSubstation}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Feeder"/>
                        </SelectTrigger>
                        <SelectContent>
                            {feeders.map(f => (
                                <SelectItem key={f.feeder_id} value={f.feeder_id}>
                                    {f.feeder_name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select
                        value={pendingDtr}
                        onValueChange={setPendingDtr}
                        disabled={!pendingFeeder}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="DTR"/>
                        </SelectTrigger>
                        <SelectContent>
                            {dtrs.map(d => (
                                <SelectItem key={d.dtr_id} value={d.dtr_id}>
                                    {d.location_description}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Row 2: date/time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <BasicDateTimePicker
                        label="Start Date & Time"
                        value={pendingStartDt}
                        onChange={setPendingStartDt}
                    />
                    <BasicDateTimePicker
                        label="End Date & Time"
                        value={pendingEndDt}
                        onChange={setPendingEndDt}
                    />
                </div>

                {/* Row 3: Apply / Cancel */}
                <div className="flex justify-end space-x-2">
                    <button
                        onClick={handleCancel}
                        className="px-4 py-2 border rounded hover:bg-gray-100"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleApply}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Apply
                    </button>
                </div>
            </Card>

            {/* Chart */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="animate-spin h-6 w-6"/>
                </div>
            ) : data.length ? (
                <CommonComposedChart {...chartConfig} />
            ) : (
                <div className="text-center py-12 text-gray-500">No data to display</div>
            )}

            {/* Table */}
            {data.length > 0 && (
                <Card className="p-4">
                    <CommonTable data={data} columns={tableColumns} pagination pageSize={10} title="Consumption Data"/>
                </Card>
            )}
        </div>
    );
}