/**
 * Card component for consistent container styling.
 * @param {object} props
 * @param {string} [props.className]
 */
export default function Card({ className = "", ...props }) {
  return (
    <div
      className={["rounded-2xl border bg-white", className].join(" ").trim()}
      {...props}
    />
  );
}
