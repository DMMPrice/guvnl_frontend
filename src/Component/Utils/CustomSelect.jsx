import React, { useState, useRef, useEffect } from "react";

function CustomSelect({
  options = [],
  value = "",
  onChange,
  placeholder = "Select an option",
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  const handleClickOutside = (event) => {
    if (selectRef.current && !selectRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      {/* Select Trigger */}
      <div
        className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white shadow-sm cursor-pointer hover:shadow-md"
        onClick={() => setIsOpen((prev) => !prev)}>
        {value || placeholder}
      </div>

      {/* Dropdown Options */}
      {isOpen && (
        <ul className="absolute z-10 mt-2 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {options.length > 0 ? (
            options.map((option, index) => (
              <li
                key={index}
                className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                onClick={() => {
                  onChange(option);
                  setIsOpen(false); // Close dropdown after selection
                }}>
                {option}
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

export default CustomSelect;
