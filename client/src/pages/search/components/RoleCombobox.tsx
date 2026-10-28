import React, { useState } from "react";
import { Briefcase, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface RoleComboboxProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder?: string;
}

// Type any role, or pick one of the suggestions that match what you typed
const RoleCombobox: React.FC<RoleComboboxProps> = ({
  id,
  value,
  onChange,
  suggestions,
  placeholder,
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const [active, setActive] = useState<number>(-1);

  const typed = value.trim().toLowerCase();
  const matches = suggestions.filter(
    (item) => !typed || item.toLowerCase().includes(typed)
  );
  const showList = open && matches.length > 0;

  const choose = (item: string) => {
    onChange(item);
    setOpen(false);
    setActive(-1);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((prev) => (prev + 1) % Math.max(matches.length, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((prev) => (prev <= 0 ? matches.length - 1 : prev - 1));
    } else if (e.key === "Enter" && showList && active >= 0) {
      e.preventDefault(); // pick the highlighted suggestion instead of submitting
      choose(matches[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      <Briefcase className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        id={id}
        role="combobox"
        aria-expanded={showList}
        aria-autocomplete="list"
        autoComplete="off"
        value={value}
        placeholder={placeholder}
        className="pl-9 pr-9"
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
      />
      {value && (
        <button
          type="button"
          aria-label="Clear role"
          // keep focus in the input
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onChange("")}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer rounded-full p-0.5 text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      )}

      {showList && (
        <ul
          role="listbox"
          className="absolute z-30 mt-1 max-h-60 w-full overflow-y-auto rounded-md border bg-popover p-1 shadow-md"
        >
          {matches.map((item, index) => (
            <li
              key={item}
              role="option"
              aria-selected={item === value}
              // pick before the input loses focus
              onMouseDown={(e) => {
                e.preventDefault();
                choose(item);
              }}
              onMouseEnter={() => setActive(index)}
              className={cn(
                "cursor-pointer rounded-sm px-2 py-1.5 text-sm",
                index === active && "bg-accent text-accent-foreground"
              )}
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RoleCombobox;
