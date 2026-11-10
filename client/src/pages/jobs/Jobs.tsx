import React, { useEffect } from "react";
import { X } from "lucide-react";
import FilterPage from "./components/FilterPage";
import JobsListCard from "./components/JobsListCard";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import type { Job } from "@/redux/types/jobTypes";
import EmptyState from "@/shared/EmptyState";
import { useGetAllJobs } from "@/hooks/useGetAllJobs";
import { Button } from "@/components/ui/button";
import {
  clearFilters,
  setSearchQuery,
  toggleFilter,
} from "@/redux/slice/jobSlice";
import {
  countActiveFilters,
  emptyFilters,
  filterLabel,
  type FilterGroupKey,
} from "@/utils/jobFilters";

const Jobs: React.FC = () => {
  useGetAllJobs();
  const dispatch = useDispatch();
  const { allJobs, searchQuery } = useSelector((state: RootState) => state.job);
  const filters =
    useSelector((state: RootState) => state.job.filters) ?? emptyFilters;

  // start and leave with a clean slate so stale filters never hide jobs elsewhere
  useEffect(() => {
    const reset = () => {
      dispatch(clearFilters());
      dispatch(setSearchQuery(""));
    };
    reset();
    return reset;
  }, [dispatch]);

  const selected = (Object.keys(filters) as FilterGroupKey[]).flatMap((group) =>
    filters[group].map((value) => ({ group, value }))
  );
  const hasFilters = countActiveFilters(filters) > 0 || Boolean(searchQuery);

  // Results are filtered server-side, so keep the filter visible while one is
  // active, otherwise the user could not clear a filter that matched nothing.
  const showFilter = allJobs.length > 0 || hasFilters;

  return (
    <main className="px-4 py-6 md:py-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Find your next job</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {hasFilters
              ? "Showing jobs that match your filters."
              : "Browse the latest openings from top companies."}
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{allJobs.length}</span>{" "}
          {allJobs.length === 1 ? "job" : "jobs"} found
        </p>
      </header>

      {selected.length > 0 && (
        <div className="-mt-2 mb-5 flex flex-wrap items-center gap-2">
          {selected.map(({ group, value }) => (
            <button
              key={`${group}-${value}`}
              type="button"
              onClick={() => dispatch(toggleFilter({ group, value }))}
              className="flex cursor-pointer items-center gap-1 rounded-full border bg-muted px-3 py-1 text-sm hover:bg-accent"
              aria-label={`Remove filter ${filterLabel(group, value)}`}
            >
              {filterLabel(group, value)}
              <X className="size-3.5" />
            </button>
          ))}
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer text-muted-foreground"
            onClick={() => dispatch(clearFilters())}
          >
            Clear all
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {showFilter && (
          <aside className="w-full shrink-0 lg:sticky lg:top-20 lg:w-72">
            <FilterPage />
          </aside>
        )}

        <section className="min-w-0 flex-1">
          {allJobs.length <= 0 ? (
            <EmptyState
              title="No Jobs Found"
              description={
                hasFilters
                  ? "No jobs match the selected filters. Try removing one."
                  : "There are no openings right now. Please check back soon."
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {allJobs.map((job: Job) => (
                <JobsListCard key={job._id} job={job} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default Jobs;
