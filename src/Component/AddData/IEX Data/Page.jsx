import React, {useState, useEffect, useMemo} from 'react';
import Papa from 'papaparse';
import dayjs from 'dayjs';
import BasicDateTimePicker from '@/Component/Utils/DateTimeBlock.jsx';
import StatusModal from '@/Component/Utils/ErrorModal.jsx';
import CustomSelect from '@/Component/Utils/CustomSelect.jsx';          // ⬅️ NEW import
import {SAVE_URL} from '@/config.js';

/* ------------------------------------------------------------------ */
/* 🔧  CONFIGURATIONS – ONLY IEX DATASETS                              */
/* ------------------------------------------------------------------ */
const CONFIGS = {
    price: {
        label: 'IEX Price (₹/MWh)',
        endpoint: 'price/bulk-add',
        columns: ['Actual', 'Pred'],
        defaultRow: {TimeStamp: '', Actual: '', Pred: ''},
        csvMapper: (r) => ({
            TimeStamp: r.TimeStamp
                ? dayjs(r.TimeStamp).subtract(5.5, 'hour').format('YYYY-MM-DDTHH:mm')
                : '',
            Actual: r.Actual ?? '',
            Pred: r.Pred ?? '',
        }),
    },

    quantity: {
        label: 'IEX Quantity & Pred. Price',
        endpoint: 'quantity/bulk-add',
        columns: ['Qty_Pred', 'Pred_Price'],
        defaultRow: {TimeStamp: '', Qty_Pred: '', Pred_Price: ''},
        csvMapper: (r) => ({
            TimeStamp: r.TimeStamp
                ? dayjs(r.TimeStamp).subtract(5.5, 'hour').format('YYYY-MM-DDTHH:mm')
                : '',
            Qty_Pred: r.Qty_Pred ?? '',
            Pred_Price: r.Pred_Price ?? '',
        }),
    },
};

/* 🔗 mapping helper for the custom dropdown ------------------------- */
const labelToKey = {
    'IEX Price (₹/MWh)': 'price',
    'IEX Quantity & Pred. Price': 'quantity',
};
const keyToLabel = {
    price: 'IEX Price (₹/MWh)',
    quantity: 'IEX Quantity & Pred. Price',
};

/* ------------------------------------------------------------------ */
/* 🌟  MAIN COMPONENT                                                  */
/* ------------------------------------------------------------------ */
export default function IexDataInputPanel() {
    /* ---------- dataset selector ---------- */
    const [dataset, setDataset] = useState('price');
    const cfg = useMemo(() => CONFIGS[dataset], [dataset]);

    /* ---------- rows & modal state ---------- */
    const [rows, setRows] = useState([cfg.defaultRow]);
    const [modalData, setModalData] = useState({
        open: false,
        message: '',
        errorCode: null,
        isError: false,
    });

    /* reset rows when dataset changes */
    useEffect(() => setRows([CONFIGS[dataset].defaultRow]), [dataset]);

    /* ---------- file upload ---------- */
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: ({data}) => setRows(data.map(CONFIGS[dataset].csvMapper)),
        });
    };

    /* ---------- row helpers ---------- */
    const handleRowChange = (i, key, val) =>
        setRows((prev) => {
            const next = [...prev];
            next[i][key] = val;
            return next;
        });
    const addRow = () => setRows((prev) => [...prev, {...cfg.defaultRow}]);
    const deleteRow = (i) =>
        rows.length > 1 && setRows((prev) => prev.filter((_, idx) => idx !== i));

    /* ---------- submit ---------- */
    const handleSubmit = async () => {
        try {
            const payload = rows.map((r) => ({
                ...r,
                TimeStamp: r.TimeStamp
                    ? dayjs(r.TimeStamp).subtract(5.5, 'hour').toISOString()
                    : '',
            }));

            const res = await fetch(`${SAVE_URL}iex/${cfg.endpoint}`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payload),
            });
            const out = await res.json();

            setModalData({
                open: true,
                message: out.message || 'Data submitted successfully!',
                errorCode: !res.ok ? out.code || 'SUBMIT_FAIL' : null,
                isError: !res.ok,
            });

            if (res.ok) setRows([cfg.defaultRow]);
        } catch (err) {
            console.error(err);
            setModalData({
                open: true,
                message: 'Network or server error occurred.',
                errorCode: 'NETWORK_ERROR',
                isError: true,
            });
        }
    };

    /* ------------------------------------------------------------------ */
    /* 🖥️  RENDER                                                         */
    /* ------------------------------------------------------------------ */
    return (
        <div className="p-6 max-w-6xl mx-auto bg-white border rounded-lg shadow space-y-6">
            {/* 🗂️  Dataset picker, upload & submit */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <CustomSelect
                    options={Object.values(keyToLabel)}
                    value={keyToLabel[dataset]}
                    onChange={(label) => setDataset(labelToKey[label])}
                    className="w-64"
                />

                <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="file:mr-4 file:py-2 file:px-4 file:border file:rounded file:bg-blue-100 text-sm"
                />

                <button
                    onClick={handleSubmit}
                    className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
                >
                    Submit
                </button>
            </div>

            {/* 📋  Table */}
            <table className="w-full table-auto border mt-4 text-sm">
                <thead className="bg-gray-100">
                <tr>
                    <th className="border px-3 py-2">TimeStamp</th>
                    {cfg.columns.map((c) => (
                        <th key={c} className="border px-3 py-2">
                            {c}
                        </th>
                    ))}
                    <th className="border px-3 py-2">Action</th>
                </tr>
                </thead>

                <tbody>
                {rows.map((row, idx) => (
                    <tr key={idx}>
                        {/* TimeStamp picker */}
                        <td className="border px-2 py-1">
                            <BasicDateTimePicker
                                value={row.TimeStamp}
                                onChange={(v) => handleRowChange(idx, 'TimeStamp', v)}
                                textFieldProps={{size: 'small'}}
                            />
                        </td>

                        {/* Dynamic numeric columns */}
                        {cfg.columns.map((col) => (
                            <td key={col} className="border px-2 py-1">
                                <input
                                    type="number"
                                    value={row[col]}
                                    onChange={(e) =>
                                        handleRowChange(idx, col, e.target.value)
                                    }
                                    className="w-full p-1 border rounded"
                                />
                            </td>
                        ))}

                        {/* Delete */}
                        <td className="border px-2 py-1 text-center">
                            <button
                                onClick={() => deleteRow(idx)}
                                className="text-red-600 hover:text-red-800"
                                title="Delete Row"
                            >
                                🗑️
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            {/* ➕  Add Row */}
            <button
                onClick={addRow}
                className="text-blue-600 hover:underline text-sm mt-2"
            >
                + Add Row
            </button>

            {/* 🔔  Modal */}
            {modalData.open && (
                <StatusModal
                    message={modalData.message}
                    errorCode={modalData.errorCode}
                    onClose={() => setModalData((m) => ({...m, open: false}))}
                    isError={modalData.isError}
                />
            )}
        </div>
    );
}