/**
 * Input component with elegant focus animation
 * @param {object} props
 * @param {string} [props.className]
 */
export function Input({ className = "", ...props }) {
  return (
    <input
      className={[
        "border border-gray-300 rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all duration-250 hover:border-gray-400",
        className,
      ]
        .join(" ")
        .trim()}
      {...props}
    />
  );
}

/**
 * Textarea component with elegant focus animation
 * @param {object} props
 * @param {string} [props.className]
 */
export function Textarea({ className = "", ...props }) {
  return (
    <textarea
      className={[
        "border border-gray-300 rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all duration-250 hover:border-gray-400 resize-vertical",
        className,
      ]
        .join(" ")
        .trim()}
      {...props}
    />
  );
}

// Default export for backward compatibility
export default Input;
