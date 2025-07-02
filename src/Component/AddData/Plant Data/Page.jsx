import React, {useState, useEffect} from 'react';
import Papa from 'papaparse';
import dayjs from 'dayjs';

import BasicDateTimePicker from '@/Component/Utils/DateTimeBlock.jsx';
import StatusModal from '@/Component/Utils/ErrorModal.jsx';
import CustomSelect from '@/Component/Utils/CustomSelect.jsx';   // ← NEW
import {SAVE_URL} from '@/config.js';

// ───────────────────────────────────
// Template for a fresh row
// ───────────────────────────────────
const blankRow = {TimeStamp: '', Actual: '', Pred: '', Code: ''};

export default function PlantConsumptionInputPanel() {
    const [rows, setRows] = useState([blankRow]);
    const [mustRun, setMustRun] = useState([]);          // catalogue (must-run only)

    const [modal, setModal] = useState({
        open: false,
        message: '',
        isError: false,
        errorCode: null,
    });

    // ─── Fetch plant catalogue (must-run only) ────────────────────────────────
    useEffect(() => {
        (async () => {
            try {
                const res = await fetch('http://127.0.0.1:5000/plant/');
                const json = await res.json();
                const list = json.must_run || [];
                setMustRun(list);

                // Pre-fill Code in every blank row with the first plant’s code
                if (list.length) {
                    setRows((prev) =>
                        prev.map((r) => ({...r, Code: r.Code || list[0].Code})),
                    );
                }
            } catch (err) {
                console.error('Failed to load plant list:', err);
            }
        })();
    }, []);

    // ─── CSV upload ───────────────────────────────────────────────────────────
    const handleCSV = (file) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: ({data}) => {
                const parsed = data.map((r) => ({
                    TimeStamp: r.TimeStamp
                        ? dayjs(r.TimeStamp).subtract(5.5, 'hour').format('YYYY-MM-DDTHH:mm')
                        : '',
                    Actual: r.Actual ?? '',
                    Pred: r.Pred ?? '',
                    Code: mustRun.some((p) => p.Code === r.Code)
                        ? r.Code
                        : mustRun[0]?.Code || '',
                }));
                setRows(parsed.length ? parsed : [blankRow]);
            },
        });
    };

    // ─── Inline edits ─────────────────────────────────────────────────────────
    const change = (idx, key, val) =>
        setRows((prev) => prev.map((r, i) => (i === idx ? {...r, [key]: val} : r)));

    const addRow = () => setRows((p) => [...p, {...blankRow, Code: mustRun[0]?.Code || ''}]);
    const deleteRow = (idx) => rows.length > 1 && setRows((p) => p.filter((_, i) => i !== idx));

    // ─── Submit to backend ────────────────────────────────────────────────────
    const handleSubmit = async () => {
        try {
            const payload = rows.map((r) => ({
                ...r,
                TimeStamp: r.TimeStamp
                    ? dayjs(r.TimeStamp).subtract(5.5, 'hour').toISOString()
                    : '',
            }));

            const res = await fetch(`${SAVE_URL}plant-consumption`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payload),
            });
            const json = await res.json();

            setModal({
                open: true,
                message: json.message || 'Data submitted successfully!',
                isError: !res.ok,
                errorCode: res.ok ? null : json.code || 'SUBMIT_FAIL',
            });

            if (res.ok) setRows([{...blankRow, Code: mustRun[0]?.Code || ''}]);
        } catch (err) {
            console.error(err);
            setModal({
                open: true,
                message: 'Network or server error.',
                isError: true,
                errorCode: 'NETWORK_ERROR',
            });
        }
    };

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="p-6 max-w-6xl mx-auto bg-white border rounded-lg shadow space-y-6">
            {/* Upload + Submit */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => e.target.files[0] && handleCSV(e.target.files[0])}
                    className="file:mr-4 file:py-2 file:px-4 file:border file:rounded file:bg-blue-100 text-sm"
                />
                <button
                    onClick={handleSubmit}
                    className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
                >
                    Submit
                </button>
            </div>

            {/* Editable table */}
            <table className="w-full table-auto border text-sm mt-4">
                <thead className="bg-gray-100">
                <tr>
                    <th className="border px-3 py-2">TimeStamp</th>
                    <th className="border px-3 py-2">Actual</th>
                    <th className="border px-3 py-2">Pred</th>
                    <th className="border px-3 py-2">Plant Code (Must-Run)</th>
                    <th className="border px-3 py-2">Action</th>
                </tr>
                </thead>
                <tbody>
                {rows.map((row, idx) => (
                    <tr key={idx}>
                        {/* Timestamp */}
                        <td className="border px-2 py-1">
                            <BasicDateTimePicker
                                value={row.TimeStamp}
                                onChange={(v) => change(idx, 'TimeStamp', v)}
                                textFieldProps={{size: 'small'}}
                            />
                        </td>

                        {/* Actual + Pred */}
                        {['Actual', 'Pred'].map((k) => (
                            <td key={k} className="border px-2 py-1">
                                <input
                                    type="number"
                                    value={row[k]}
                                    onChange={(e) => change(idx, k, e.target.value)}
                                    className="w-full p-1 border rounded"
                                />
                            </td>
                        ))}

                        {/* CustomSelect for plant code */}
                        <td className="border px-2 py-1">
                            <CustomSelect
                                options={mustRun.map((p) => `${p.Code} — ${p.name}`)}
                                value={
                                    mustRun.find((p) => p.Code === row.Code)
                                        ? `${row.Code} — ${mustRun.find((p) => p.Code === row.Code).name}`
                                        : ''
                                }
                                onChange={(opt) => change(idx, 'Code', opt.split(' — ')[0])}
                                placeholder="Choose plant"
                            />
                        </td>

                        {/* Delete */}
                        <td className="border px-2 py-1 text-center">
                            <button
                                onClick={() => deleteRow(idx)}
                                className="text-red-600 hover:text-red-800"
                            >
                                🗑️
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            {/* Add Row */}
            <button onClick={addRow} className="text-blue-600 hover:underline text-sm mt-2">
                + Add Row
            </button>

            {/* Modal */}
            {modal.open && (
                <StatusModal
                    message={modal.message}
                    errorCode={modal.errorCode}
                    onClose={() => setModal((m) => ({...m, open: false}))}
                    isError={modal.isError}
                />
            )}
        </div>
    );
}