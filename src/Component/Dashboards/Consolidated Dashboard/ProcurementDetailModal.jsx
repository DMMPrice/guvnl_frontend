// src/Component/Dashboard/ProcurementDetailModal.jsx
import React from 'react';
import CommonTable from '@/Component/Utils/CommonTable.jsx';

export default function ProcurementDetailModal({
                                                   isOpen,
                                                   onClose,
                                                   data,
                                                   columns,
                                               }) {
    if (!isOpen || !data) return null;

    const MUST_RUN_COLUMNS = [
        {accessor: 'plant_name', header: 'Plant Name'},
        {accessor: 'plant_code', header: 'Code'},
        {accessor: 'Rated_Capacity', header: 'Rated Capacity'},
        {accessor: 'Variable_Cost', header: 'Variable Cost'},
        {accessor: 'generated_energy', header: 'Generated Energy'},
        {accessor: 'net_cost', header: 'Net Cost'},
    ];
    const OTHER_COLUMNS = [
        {accessor: 'plant_name', header: 'Plant Name'},
        {accessor: 'plant_code', header: 'Code'},
        {accessor: 'rated_capacity', header: 'Rated Capacity'},
        {accessor: 'Variable_Cost', header: 'Variable Cost'},
        {accessor: 'generated_energy', header: 'Generated Energy'},
        {accessor: 'net_cost', header: 'Net Cost'},
        {accessor: 'backdown_cost', header: 'Backdown Cost'},
        {accessor: 'backdown_rate', header: 'Backdown Rate'},
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-12">
            {/* backdrop */}
            <div
                className="absolute inset-0 bg-black opacity-30"
                onClick={onClose}
            />

            {/* panel: keep all corners rounded + clip overflow */}
            <div
                className="relative bg-white rounded-lg shadow-lg w-full max-w-6xl flex flex-col max-h-[90vh] overflow-hidden">
                {/* header: sticky with rounded top corners */}
                <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10 rounded-t-lg">
                    <h2 className="text-2xl font-semibold">Procurement Details</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-800 text-2xl leading-none"
                    >
                        &times;
                    </button>
                </div>

                {/* body: scrolls only this area */}
                <div className="flex-auto overflow-y-auto p-6">
                    {/* primitives */}
                    <div className="space-y-3 mb-6">
                        {columns.map(col => (
                            <div
                                key={col.id ?? col.accessor}
                                className="flex items-start"
                            >
                                <div className="w-1/3 font-medium text-gray-700">
                                    {col.header}
                                </div>
                                <div className="w-2/3">
                                    {col.render
                                        ? col.render(data)
                                        : (data[col.accessor] != null
                                            ? data[col.accessor].toString()
                                            : '-')}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* must-run plants */}
                    {Array.isArray(data.must_run) && data.must_run.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-xl font-semibold mb-2">Must-Run Plants</h3>
                            <CommonTable
                                title={null}
                                columns={MUST_RUN_COLUMNS}
                                data={data.must_run}
                                footer={null}
                            />
                        </div>
                    )}

                    {/* other plants */}
                    {Array.isArray(data.remaining_plants) && data.remaining_plants.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-xl font-semibold mb-2">Other Plants</h3>
                            <CommonTable
                                title={null}
                                columns={OTHER_COLUMNS}
                                data={data.remaining_plants}
                                footer={null}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}