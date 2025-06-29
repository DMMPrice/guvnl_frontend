import React, {useState} from 'react';
import Papa from 'papaparse';
import dayjs from 'dayjs';
import BasicDateTimePicker from '@/Component/Utils/DateTimeBlock.jsx';
import {SAVE_URL} from '@/config.js';
import StatusModal from '@/Component/Utils/ErrorModal.jsx';

const defaultRow = {
    TimeStamp: '',
    'Demand(Actual)': '',
    'Demand(Pred)': '',
};

export default function DataInputPanel() {
    const [rows, setRows] = useState([defaultRow]);

    const [modalData, setModalData] = useState({
        open: false,
        message: '',
        errorCode: null,
        isError: false,
    });

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (result) => {
                const parsed = result.data.map((row) => ({
                    TimeStamp: row.TimeStamp
                        ? dayjs(row.TimeStamp).subtract(5.5, 'hour').format('YYYY-MM-DDTHH:mm')
                        : '',
                    'Demand(Actual)': row['Demand(Actual)'] || '',
                    'Demand(Pred)': row['Demand(Pred)'] || '',
                }));
                setRows(parsed);
            },
        });
    };

    const handleRowChange = (index, key, value) => {
        const updated = [...rows];
        updated[index][key] = value;
        setRows(updated);
    };

    const addRow = () => {
        setRows([...rows, {...defaultRow}]);
    };

    const deleteRow = (index) => {
        if (rows.length === 1) return;
        const updated = [...rows];
        updated.splice(index, 1);
        setRows(updated);
    };

    const handleSubmit = async () => {
        try {
            const formattedRows = rows.map((row) => ({
                ...row,
                TimeStamp: row.TimeStamp
                    ? dayjs(row.TimeStamp).subtract(5.5, 'hour').toISOString()
                    : '',
            }));

            const response = await fetch(`${SAVE_URL}demand/bulk-add`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(formattedRows),
            });

            const result = await response.json();

            setModalData({
                open: true,
                message: result.message || 'Data submitted successfully!',
                errorCode: !response.ok ? result.code || 'SUBMIT_FAIL' : null,
                isError: !response.ok,
            });

            if (response.ok) setRows([defaultRow]);
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

    return (
        <div className="p-6 max-w-6xl mx-auto bg-white border rounded-lg shadow space-y-6">
            {/* Upload & Submit Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
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

            {/* Table */}
            <table className="w-full table-auto border mt-4 text-sm">
                <thead className="bg-gray-100">
                <tr>
                    <th className="border px-3 py-2">TimeStamp</th>
                    <th className="border px-3 py-2">Demand(Actual)</th>
                    <th className="border px-3 py-2">Demand(Pred)</th>
                    <th className="border px-3 py-2">Action</th>
                </tr>
                </thead>
                <tbody>
                {rows.map((row, idx) => (
                    <tr key={idx}>
                        <td className="border px-2 py-1">
                            <BasicDateTimePicker
                                value={row.TimeStamp}
                                onChange={(val) => handleRowChange(idx, 'TimeStamp', val)}
                                textFieldProps={{size: 'small'}}
                            />
                        </td>
                        {['Demand(Actual)', 'Demand(Pred)'].map((col) => (
                            <td key={col} className="border px-2 py-1">
                                <input
                                    type="number"
                                    value={row[col]}
                                    onChange={(e) => handleRowChange(idx, col, e.target.value)}
                                    className="w-full p-1 border rounded"
                                />
                            </td>
                        ))}
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

            {/* Add Row Button */}
            <button
                onClick={addRow}
                className="text-blue-600 hover:underline text-sm mt-2"
            >
                + Add Row
            </button>

            {/* Modal */}
            {modalData.open && (
                <StatusModal
                    message={modalData.message}
                    errorCode={modalData.errorCode}
                    onClose={() => setModalData({...modalData, open: false})}
                    isError={modalData.isError}
                />
            )}
        </div>
    );
}