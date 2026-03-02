import clsx from "clsx";

/**
 * A lightweight, reusable Card component with Tailwind styling.
 * Use <Card>, <CardHeader>, <CardTitle>, and <CardContent> for flexible layout.
 */

export function Card({ className = "", children, ...props }) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-200",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = "", children, ...props }) {
  return (
    <div className={clsx("px-5 pt-4 pb-2 border-b border-gray-100", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className = "", children, ...props }) {
  return (
    <h3 className={clsx("text-lg font-semibold text-gray-800", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({ className = "", children, ...props }) {
  return (
    <div className={clsx("px-5 py-4", className)} {...props}>
      {children}
    </div>
  );
}
