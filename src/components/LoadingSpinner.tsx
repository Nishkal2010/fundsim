interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  label?: string;
}

const sizeMap = {
  sm: "w-4 h-4 border-2",
  md: "w-8 h-8 border-2",
  lg: "w-12 h-12 border-[3px]",
};

export function LoadingSpinner({
  size = "md",
  label = "Loading…",
}: LoadingSpinnerProps) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3"
      role="status"
      aria-label={label}
    >
      <div
        className={`${sizeMap[size]} rounded-full border-zinc-700 border-t-blue-500 animate-spin`}
        aria-hidden="true"
      />
      {label && <p className="text-sm text-zinc-500 animate-pulse">{label}</p>}
    </div>
  );
}
