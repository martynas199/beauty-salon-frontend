/**
 * Input component for forms.
 * @param {object} props
 * @param {string} [props.className]
 */
export function Input({ className = "", ...props }) {
  return (
    <input
      className={[
        "border rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-brand-600",
        className,
      ]
        .join(" ")
        .trim()}
      {...props}
    />
  );
}

/**
 * Textarea component for forms.
 * @param {object} props
 * @param {string} [props.className]
 */
export function Textarea({ className = "", ...props }) {
  return (
    <textarea
      className={[
        "border rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-brand-600",
        className,
      ]
        .join(" ")
        .trim()}
      {...props}
    />
  );
}
