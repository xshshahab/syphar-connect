import React, { useState } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { clearFilters, toggleFilter } from "@/redux/slice/jobSlice";
import type { RootState } from "@/redux/store";
import {
  FILTER_GROUPS,
  countActiveFilters,
  emptyFilters,
} from "@/utils/jobFilters";

const FilterPage: React.FC = () => {
  const dispatch = useDispatch();
  const filters =
    useSelector((state: RootState) => state.job.filters) ?? emptyFilters;
  // collapsed by default on small screens, always open on desktop
  const [open, setOpen] = useState<boolean>(false);

  const active = countActiveFilters(filters);

  return (
    <Card className="gap-0 p-0">
      <div className="flex items-center justify-between gap-2 p-4">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          className="flex cursor-pointer items-center gap-2 text-left lg:pointer-events-none"
        >
          <SlidersHorizontal className="size-4" />
          <h2 className="text-base font-semibold">Filters</h2>
          {active > 0 && (
            <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
              {active}
            </span>
          )}
          <ChevronDown
            className={cn(
              "size-4 transition-transform lg:hidden",
              open && "rotate-180"
            )}
          />
        </button>
        {active > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer text-muted-foreground"
            onClick={() => dispatch(clearFilters())}
          >
            Clear all
          </Button>
        )}
      </div>

      <div
        className={cn(
          "space-y-6 border-t p-4",
          open ? "block" : "hidden",
          "lg:block"
        )}
      >
        {FILTER_GROUPS.map((group) => (
          <fieldset key={group.key} className="space-y-3">
            <legend className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {group.label}
            </legend>
            <div className="space-y-2.5">
              {group.options.map((option) => {
                const id = `filter-${group.key}-${option.value}`;
                return (
                  <div key={option.value} className="flex items-center gap-2.5">
                    <Checkbox
                      id={id}
                      checked={filters[group.key].includes(option.value)}
                      onCheckedChange={() =>
                        dispatch(
                          toggleFilter({
                            group: group.key,
                            value: option.value,
                          })
                        )
                      }
                    />
                    <Label
                      htmlFor={id}
                      className="flex-1 cursor-pointer text-sm font-normal"
                    >
                      {option.label}
                    </Label>
                  </div>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>
    </Card>
  );
};

export default FilterPage;
