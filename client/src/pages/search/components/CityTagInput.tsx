import React, { useState } from "react";
import { MapPin, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface CityTagInputProps {
  id?: string;
  value: string[];
  onChange: (value: string[]) => void;
  suggestions: string[];
  placeholder?: string;
}

// Pick several cities from suggestions, or type any other city and press Enter
const CityTagInput: React.FC<CityTagInputProps> = ({
  id,
  value,
  onChange,
  suggestions,
  placeholder,
}) => {
  const [text, setText] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const [active, setActive] = useState<number>(-1);

  const typed = text.trim().toLowerCase();
  const has = (city: string) =>
    value.some((item) => item.toLowerCase() === city.toLowerCase());
  const matches = suggestions.filter(
    (item) => !has(item) && (!typed || item.toLowerCase().includes(typed))
  );

  const add = (raw: string) => {
    const name = raw.trim().replace(/\s+/g, " ");
    if (!name) return;
    // use the canonical spelling when it matches a suggestion
    const canonical =
      suggestions.find((item) => item.toLowerCase() === name.toLowerCase()) ??
      name;
    if (!has(canonical)) onChange([...value, canonical]);
    setText("");
    setActive(-1);
  };

  const remove = (city: string) => onChange(value.filter((item) => item !== city));

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      if (!text.trim()) return; // empty Enter submits the search form
      e.preventDefault();
      add(active >= 0 && matches[active] ? matches[active] : text);
    } else if (e.key === "Backspace" && !text && value.length) {
      remove(value[value.length - 1]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((prev) => (prev + 1) % Math.max(matches.length, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((prev) => (prev <= 0 ? matches.length - 1 : prev - 1));
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const showList = open && (matches.length > 0 || (typed && !has(text)));

  return (
    <div className="relative">
      <div className="flex min-h-9 flex-wrap items-center gap-1.5 rounded-md border bg-transparent px-2.5 py-1 shadow-xs focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 dark:bg-input/30">
        <MapPin className="size-4 shrink-0 text-muted-foreground" />
        {value.map((city) => (
          <span
            key={city}
            className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-sm"
          >
            {city}
            <button
              type="button"
              aria-label={`Remove ${city}`}
              onClick={() => remove(city)}
              className="cursor-pointer rounded-full hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          </span>
        ))}
        <input
          id={id}
          role="combobox"
          aria-expanded={Boolean(showList)}
          aria-autocomplete="list"
          autoComplete="off"
          value={text}
          placeholder={value.length ? "" : placeholder}
          onChange={(e) => {
            setText(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            setOpen(false);
            add(text); // do not lose a half-typed city
          }}
          onKeyDown={onKeyDown}
          className="min-w-24 flex-1 bg-transparent py-1 text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      {showList && (
        <ul
          role="listbox"
          className="absolute z-30 mt-1 max-h-60 w-full overflow-y-auto rounded-md border bg-popover p-1 shadow-md"
        >
          {matches.map((item, index) => (
            <li
              key={item}
              role="option"
              aria-selected={false}
              onMouseDown={(e) => {
                e.preventDefault();
                add(item);
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
          {typed && !has(text) && !suggestions.some((s) => s.toLowerCase() === typed) && (
            <li
              role="option"
              aria-selected={false}
              onMouseDown={(e) => {
                e.preventDefault();
                add(text);
              }}
              className="cursor-pointer rounded-sm px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              Add “{text.trim()}”
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

export default CityTagInput;
