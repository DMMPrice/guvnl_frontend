// src/Component/Dashboards/Consolidated Dashboard/PowerBIModal.jsx
import React, {useState} from 'react'

const POWERBI_URL = 'https://app.powerbi.com/view?r=eyJrIjoiYzhmMmE0ODItYTRlMy00ZjEzLWE1NjQtMjRhODViMDhiZmMxIiwidCI6IjhlZTQ0MWJkLTBjODQtNDYzNS05YTU2LWVkMWUyNjhkZmU4NSIsImMiOjEwfQ%3D%3D'

export default function PowerBIModal() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg shadow transition"
            >
                Show in PowerBI
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black opacity-30"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Modal panel */}
                    <div
                        className="relative bg-white rounded-lg shadow-lg w-full max-w-9xl h-[95vh] flex flex-col overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b">
                            <h2 className="text-lg font-semibold">PowerBI Report</h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-600 hover:text-gray-800 text-2xl leading-none"
                            >
                                &times;
                            </button>
                        </div>

                        {/* Iframe */}
                        <div className="flex-1">
                            <iframe
                                title="Power BI"
                                src={POWERBI_URL}
                                className="w-full h-full"
                                frameBorder="0"
                                allowFullScreen
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}