import React from "react";

export default function CustomSelect({
  options,
  value,
  onChange,
  placeholder,
}) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="w-full p-2 border rounded">
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((option, index) => (
        <option key={index} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}
