"use client";
import { useEffect, useState } from "react";

function parseToInputValue(value) {
  if (!value) return "";

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    console.warn("Invalid date passed to DateTimePicker:", value);
    return "";
  }

  // Convert UTC → local so datetime-local shows the right wall-clock time
  const tzOffsetMinutes = d.getTimezoneOffset();
  const localMs = d.getTime() - tzOffsetMinutes * 60 * 1000;
  const local = new Date(localMs);

  // datetime-local expects "YYYY-MM-DDTHH:mm"
  return local.toISOString().slice(0, 16);
}

export const DateTimePicker = ({ label, value, onChange, helperText }) => {
  const [dateValue, setDateValue] = useState(parseToInputValue(value));

  // sync when parent updates value
  useEffect(() => {
    setDateValue(parseToInputValue(value));
  }, [value]);

  const handleDateChange = (e) => {
    const inputValue = e.target.value; // "YYYY-MM-DDTHH:mm" (local)
    setDateValue(inputValue);

    if (!inputValue) {
      onChange?.(null);
      return;
    }

    const localDate = new Date(inputValue); // interpreted as local time
    if (Number.isNaN(localDate.getTime())) {
      console.warn("User picked invalid date:", inputValue);
      onChange?.(null);
      return;
    }

    // Convert to UTC ISO string and keep seconds (no ms)
    const iso = localDate.toISOString(); // "YYYY-MM-DDTHH:mm:ss.sssZ"
    const isoWithoutMs = iso.split(".")[0] + "Z"; // "YYYY-MM-DDTHH:mm:ssZ"

    // Backend expects ISO 8601 → this is valid: 2025-12-31T23:59:59Z
    onChange?.(isoWithoutMs);
  };

  return (
    <div className="flex flex-col space-y-1">
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      <input
        type="datetime-local"
        value={dateValue}
        onChange={handleDateChange}
        className="w-full rounded-lg border border-gray-300 p-2 text-sm shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
      />
      {helperText && (
        <p className="text-xs text-gray-500 mt-1">{helperText}</p>
      )}
    </div>
  );
};
