import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/context/ThemeProvider";
import { cn } from "@/lib/utils";

const options = [
  { value: "light", label: "Light mode", icon: Sun },
  { value: "dark", label: "Dark mode", icon: Moon },
] as const;

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div
      role="group"
      aria-label="Theme"
      className="inline-flex items-center gap-0.5 rounded-full border bg-muted/60 p-0.5 dark:bg-zinc-900"
    >
      {options.map(({ value, label, icon: Icon }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            type="button"
            aria-label={label}
            aria-pressed={active}
            onClick={() => setTheme(value)}
            className={cn(
              "flex size-7 cursor-pointer items-center justify-center rounded-full transition-colors",
              active
                ? "bg-red-600 text-white"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="size-4" />
          </button>
        );
      })}
    </div>
  );
}
