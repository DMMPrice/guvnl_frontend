// src/Component/Utils/MultiCustomSelect.jsx
import React, {useState, useRef, useEffect} from "react";

export default function CustomSelect({
                                         options = [],
                                         value = [],
                                         onChange,
                                         placeholder = "Select an option",
                                         className = "",
                                         multi = false,
                                         maxSelected,                 // <-- NEW: cap on selections (number)
                                     }) {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef(null);

    const flatOptions = options.map((opt) =>
        typeof opt === "string" ? {label: opt, value: opt} : opt
    );

    const selected = multi
        ? Array.isArray(value) ? value : []
        : value != null ? [value] : [];

    useEffect(() => {
        const handler = (e) => {
            if (selectRef.current && !selectRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const atCap =
        multi && typeof maxSelected === "number" && selected.length >= maxSelected;

    const isDisabled = (val) =>
        multi &&
        typeof maxSelected === "number" &&
        selected.length >= maxSelected &&
        !selected.includes(val); // allow unselecting already-chosen ones

    const toggleValue = (val) => {
        if (multi) {
            const already = selected.includes(val);

            // block adding if at cap
            if (!already && atCap) {
                // optionally show a toast/snackbar here
                return;
            }

            const next = already ? selected.filter((x) => x !== val) : [...selected, val];
            onChange(next);
        } else {
            onChange(val);
            setIsOpen(false);
        }
    };

    return (
        <div className={`relative ${className}`} ref={selectRef} style={{minHeight: 40}}>
            <div
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white shadow-sm cursor-pointer hover:shadow-md flex items-center"
                onClick={() => setIsOpen((o) => !o)}
                title={
                    multi && typeof maxSelected === "number"
                        ? `${selected.length}/${maxSelected} selected`
                        : undefined
                }
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
                        flatOptions.map((opt, i) => {
                            const active = selected.includes(opt.value);
                            const disabled = isDisabled(opt.value);
                            return (
                                <li
                                    key={i}
                                    className={[
                                        "px-4 py-2 cursor-pointer hover:bg-gray-100 flex items-center",
                                        active ? "bg-gray-200" : "",
                                        disabled ? "opacity-50 cursor-not-allowed" : "",
                                    ].join(" ")}
                                    onClick={() => !disabled && toggleValue(opt.value)}
                                    title={disabled ? `Maximum ${maxSelected} selected` : undefined}
                                >
                                    {multi && (
                                        <input
                                            type="checkbox"
                                            readOnly
                                            checked={active}
                                            className="mr-2"
                                            tabIndex={-1}
                                        />
                                    )}
                                    {opt.label}
                                </li>
                            );
                        })
                    ) : (
                        <li className="px-4 py-2 text-gray-500 text-center">No options available</li>
                    )}
                </ul>
            )}

            {multi && typeof maxSelected === "number" && (
                <p className="mt-1 text-xs text-gray-500">
                    {selected.length}/{maxSelected} selected
                </p>
            )}
        </div>
    );
}