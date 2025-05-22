// src/Component/Utils/MultiCustomSelect.jsx
import React, {useState, useRef, useEffect} from "react";

export default function CustomSelect({
                                         options = [],
                                         value = [],
                                         onChange,
                                         placeholder = "Select an option",
                                         className = "",
                                         multi = false,
                                     }) {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef(null);

    // flatten options
    const flatOptions = options.map((opt) =>
        typeof opt === "string" ? {label: opt, value: opt} : opt
    );

    // ensure `selected` is always an array in multi mode
    const selected = multi
        ? Array.isArray(value)
            ? value
            : []
        : value != null
            ? [value]
            : [];

    // close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (selectRef.current && !selectRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const toggleValue = (val) => {
        if (multi) {
            const next = selected.includes(val)
                ? selected.filter((x) => x !== val)
                : [...selected, val];
            onChange(next);
        } else {
            onChange(val);
            setIsOpen(false);
        }
    };

    return (
        <div
            className={`relative ${className}`}
            ref={selectRef}
            style={{minHeight: 40}}
        >
            <div
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white shadow-sm cursor-pointer hover:shadow-md flex items-center"
                onClick={() => setIsOpen((o) => !o)}
            >
                {selected.length > 0 ? (
                    selected
                        .map((val) => flatOptions.find((o) => o.value === val)?.label || val)
                        .join(", ")
                ) : (
                    <span className="text-gray-400">{placeholder}</span>
                )}
            </div>

            {isOpen && (
                <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {flatOptions.length > 0 ? (
                        flatOptions.map((opt, i) => (
                            <li
                                key={i}
                                className={`px-4 py-2 cursor-pointer hover:bg-gray-100 flex items-center ${
                                    selected.includes(opt.value) ? "bg-gray-200" : ""
                                }`}
                                onClick={() => toggleValue(opt.value)}
                            >
                                {multi && (
                                    <input
                                        type="checkbox"
                                        readOnly
                                        checked={selected.includes(opt.value)}
                                        className="mr-2"
                                    />
                                )}
                                {opt.label}
                            </li>
                        ))
                    ) : (
                        <li className="px-4 py-2 text-gray-500 text-center">
                            No options available
                        </li>
                    )}
                </ul>
            )}
        </div>
    );
}