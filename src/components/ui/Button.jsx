/**
 * Button component with Figma-consistent styles.
 * @param {object} props
 * @param {"default"|"brand"|"outline"|"ghost"} [props.variant]
 * @param {"sm"|"md"|"lg"} [props.size]
 * @param {string} [props.className]
 */
export default function Button({
  variant = "default",
  size = "md",
  className = "",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  const variants = {
    default: "bg-black text-white hover:bg-gray-900 focus:ring-black",
    brand: "bg-brand-600 text-white hover:bg-brand-700 focus:ring-brand-600",
    outline: "border border-gray-300 text-gray-900 hover:bg-gray-50",
    ghost: "text-gray-900 hover:bg-gray-100",
  };
  const sizes = {
    sm: "h-9 px-3 text-sm",
    md: "h-11 px-4",
    lg: "h-12 px-5 text-lg",
  };
  const cls = [
    base,
    variants[variant] || variants.default,
    sizes[size] || sizes.md,
    className,
  ]
    .join(" ")
    .trim();
  return <button className={cls} {...props} />;
}
