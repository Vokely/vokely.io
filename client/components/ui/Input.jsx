import React from "react";
import clsx from "clsx";

/**
 * A modern, reusable input component with focus styling and error handling.
 * Supports standard input types and integrates well with Tailwind forms.
 *
 * Example:
 * <Input label="Email" placeholder="Enter email" value={email} onChange={...} />
 */

export const Input = React.forwardRef(
  (
    {
      label,
      type = "text",
      className = "",
      error,
      helperText,
      disabled = false,
      ...props
    },
    ref
  ) => {
    return (
      <div className="flex flex-col w-full">
        {label && (
          <label
            className="mb-1 text-sm font-medium text-gray-700"
            htmlFor={props.id || props.name}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          disabled={disabled}
          className={clsx(
            "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400",
            "focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-150",
            disabled && "opacity-50 cursor-not-allowed bg-gray-100",
            error && "border-red-500 focus:ring-red-100",
            className
          )}
          {...props}
        />
        {helperText && !error && (
          <p className="mt-1 text-xs text-gray-500">{helperText}</p>
        )}
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";