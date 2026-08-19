import { cn } from "@/lib/utils";

type SpinnerSize = "xs" | "sm" | "md" | "lg" | "xl";
type SpinnerVariant = "bare" | "page" | "banner";

interface SpinnerProps {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  label?: string;
  className?: string;
}

const sizeMap: Record<SpinnerSize, string> = {
  xs: "h-3 w-3",
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
  xl: "h-8 w-8",
};

function SpinnerIcon({ size = "sm", className }: { size?: SpinnerSize; className?: string }) {
  return (
    <svg
      className={cn("animate-spin", sizeMap[size], className)}
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v8H4z"
      />
    </svg>
  );
}

export default function Spinner({
  size = "sm",
  variant = "bare",
  label,
  className,
}: SpinnerProps) {
  if (variant === "banner") {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-xl bg-blue-50 p-4 text-sm text-blue-700 dark:bg-blue-900/20 dark:text-blue-300",
          className,
        )}
      >
        <SpinnerIcon size={size} />
        {label && <span>{label}</span>}
      </div>
    );
  }

  if (variant === "page") {
    return (
      <div
        className={cn(
          "flex items-center justify-center gap-3 py-12 text-sm",
          className,
        )}
      >
        <SpinnerIcon size={size} className="text-muted-foreground" />
        {label && <p className="text-muted-foreground">{label}</p>}
      </div>
    );
  }

  // bare — just the icon, optionally with inline label
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <SpinnerIcon size={size} />
      {label && <span>{label}</span>}
    </span>
  );
}
