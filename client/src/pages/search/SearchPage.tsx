import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import axios from "axios";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import RoleCombobox from "./components/RoleCombobox";
import CityTagInput from "./components/CityTagInput";
import { Spinner } from "@/components/ui/spinner";
import JobsListCard from "@/pages/jobs/components/JobsListCard";
import EmptyState from "@/shared/EmptyState";
import type { Job } from "@/redux/types/jobTypes";
import { JOB_API_ENDPOINT } from "@/utils/constant";

const ROLES = [
  "Frontend Developer",
  "Backend Developer",
  "FullStack Developer",
  "Data Science",
  "DevOps Engineer",
  "Graphic Designer",
];

const CITIES = [
  "Delhi",
  "Noida",
  "Gurugram",
  "Mumbai",
  "Bengaluru",
  "Hyderabad",
  "Pune",
  "Chennai",
  "Kolkata",
  "Ahmedabad",
  "Remote",
];

const SearchPage: React.FC = () => {
  // the URL is the source of truth, so results can be shared and survive back/forward
  const [searchParams, setSearchParams] = useSearchParams();
  const urlRole = searchParams.get("role") ?? "";
  const urlLocations = searchParams.getAll("location");
  const urlExperience = searchParams.get("experience") ?? "";
  const urlKeyword = searchParams.get("keyword") ?? "";
  const urlKey = searchParams.toString();

  const [role, setRole] = useState<string>(urlRole);
  const [locations, setLocations] = useState<string[]>(urlLocations);
  const [experience, setExperience] = useState<string>(urlExperience);

  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const hasCriteria = Boolean(
    urlRole || urlLocations.length || urlExperience || urlKeyword
  );

  // keep the form in step with the URL (back/forward, links from the home page)
  useEffect(() => {
    setRole(urlRole);
    setLocations(urlLocations);
    setExperience(urlExperience);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlKey]);

  // run the search whenever the URL changes
  useEffect(() => {
    if (!hasCriteria) {
      setJobs(null);
      return;
    }

    const controller = new AbortController();
    const params = new URLSearchParams();
    if (urlKeyword) params.set("keyword", urlKeyword);
    if (urlRole) params.set("industry", urlRole);
    urlLocations.forEach((city) => params.append("location", city));
    if (urlExperience) params.set("experience", urlExperience);

    (async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${JOB_API_ENDPOINT}/all-job?${params.toString()}`,
          { withCredentials: true, signal: controller.signal }
        );
        if (res.data.success) setJobs(res.data.jobs);
        setLoading(false);
      } catch (error) {
        if (!axios.isCancel(error)) {
          console.error("ERROR! searching jobs: ", error);
          setLoading(false);
        }
      }
    })();

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlKey]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (urlKeyword) params.set("keyword", urlKeyword);
    if (role.trim()) params.set("role", role.trim());
    locations.forEach((city) => params.append("location", city));
    if (experience.trim() !== "") params.set("experience", experience.trim());
    setSearchParams(params);
  };

  const handleReset = () => {
    setRole("");
    setLocations([]);
    setExperience("");
    setSearchParams({});
  };

  const summary = [
    urlKeyword && `“${urlKeyword}”`,
    urlRole,
    urlLocations.length > 0 && `in ${urlLocations.join(", ")}`,
    urlExperience !== "" &&
      `${urlExperience} ${urlExperience === "1" ? "year" : "years"} experience`,
  ].filter(Boolean);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 md:py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold md:text-3xl">Search jobs</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick a role, where you want to work and your experience to find the
          right openings.
        </p>
      </header>

      <form
        onSubmit={handleSearch}
        className="rounded-2xl border bg-card p-5 shadow-sm md:p-6"
      >
        <div className="grid gap-5 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <RoleCombobox
              id="role"
              value={role}
              onChange={setRole}
              suggestions={ROLES}
              placeholder="Type or choose a role"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <CityTagInput
              id="location"
              value={locations}
              onChange={setLocations}
              suggestions={CITIES}
              placeholder="Type or choose cities"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience">Work experience (years)</Label>
            <Input
              id="experience"
              type="number"
              min="0"
              max="40"
              step="1"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="e.g. 2"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Experience shows jobs that ask for that many years or fewer.
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              className="cursor-pointer"
              onClick={handleReset}
            >
              Reset
            </Button>
            <Button type="submit" className="cursor-pointer">
              <Search className="size-4" /> Search jobs
            </Button>
          </div>
        </div>
      </form>

      <section className="mt-8">
        {!hasCriteria ? (
          <EmptyState
            title="Find your next opportunity"
            description="Choose a role, one or more cities and your experience, then press Search."
          />
        ) : loading && jobs === null ? (
          <div className="flex justify-center py-16">
            <Spinner className="size-6" />
          </div>
        ) : (
          <>
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-semibold">
                {jobs?.length ?? 0} {jobs?.length === 1 ? "job" : "jobs"} found
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  {summary.join(" · ")}
                </span>
              </h2>
              {loading && <Spinner />}
            </div>

            {jobs && jobs.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {jobs.map((job) => (
                  <JobsListCard key={job._id} job={job} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No jobs match your search"
                description="Try another city, remove a filter or raise your experience."
              />
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default SearchPage;
