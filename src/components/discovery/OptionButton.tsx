import { CheckIcon } from "@/components/ui/icons";

interface OptionButtonProps {
  label: string;
  isSelected: boolean;
  onClick: () => void;
}

/** Toggleable option used inside the filter panel (multi- and single-select). */
export function OptionButton({ label, isSelected, onClick }: OptionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isSelected}
      className={`flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-colors ${
        isSelected
          ? "border-primary bg-primary-light text-primary"
          : "border-border bg-white text-graphite hover:border-muted/50 hover:text-ink"
      }`}
    >
      {isSelected && <CheckIcon className="size-3.5" />}
      {label}
    </button>
  );
}
