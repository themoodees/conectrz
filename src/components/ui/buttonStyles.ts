/*
 * Shared button styles. Use with <button>, <Link> or <a>:
 *   <button className={buttonClass()}>Save</button>
 *   <Link className={buttonClass({ variant: "secondary", size: "sm" })} …>
 */

const base =
  "inline-flex items-center justify-center gap-2 rounded-control font-semibold transition-colors disabled:cursor-not-allowed";

const variants = {
  primary: "bg-primary text-white hover:bg-primary-hover disabled:bg-primary/40",
  secondary:
    "border border-border bg-white text-ink hover:border-muted/50 hover:bg-surface disabled:text-muted disabled:hover:bg-white",
  ghost: "text-graphite hover:bg-surface hover:text-ink disabled:text-muted/60",
  /** Destructive actions (ban, cancel). */
  danger: "text-danger hover:bg-danger-light disabled:text-muted/60",
};

const sizes = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
};

export function buttonClass({
  variant = "primary",
  size = "md",
  className = "",
}: {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  className?: string;
} = {}) {
  return `${base} ${variants[variant]} ${sizes[size]} ${className}`;
}
