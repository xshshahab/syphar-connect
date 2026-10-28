export type FilterGroupKey = "location" | "jobType" | "industry" | "salary";

export type JobFilters = Record<FilterGroupKey, string[]>;

export const emptyFilters: JobFilters = {
  location: [],
  jobType: [],
  industry: [],
  salary: [],
};

type FilterOption = { value: string; label: string };

// `value` is what is sent to the API, `label` is what the user sees
export const FILTER_GROUPS: {
  key: FilterGroupKey;
  label: string;
  options: FilterOption[];
}[] = [
  {
    key: "location",
    label: "Location",
    options: [
      { value: "Delhi NCR", label: "Delhi NCR" },
      { value: "Mumbai", label: "Mumbai" },
      { value: "Bengaluru", label: "Bengaluru" },
      { value: "Hyderabad", label: "Hyderabad" },
      { value: "Pune", label: "Pune" },
    ],
  },
  {
    key: "jobType",
    label: "Job type",
    options: [
      { value: "Full-time", label: "Full-time" },
      { value: "Part-time", label: "Part-time" },
      { value: "Contract", label: "Contract" },
      { value: "Internship", label: "Internship" },
      { value: "Freelance", label: "Freelance" },
    ],
  },
  {
    key: "industry",
    label: "Role",
    options: [
      { value: "Frontend Developer", label: "Frontend Developer" },
      { value: "Backend Developer", label: "Backend Developer" },
      { value: "FullStack Developer", label: "FullStack Developer" },
      { value: "Data Science", label: "Data Science" },
    ],
  },
  {
    key: "salary",
    label: "Salary (LPA)",
    options: [
      { value: "0-3", label: "Up to 3 LPA" },
      { value: "3-6", label: "3 – 6 LPA" },
      { value: "6-10", label: "6 – 10 LPA" },
      { value: "10-20", label: "10 – 20 LPA" },
      { value: "20+", label: "20+ LPA" },
    ],
  },
];

export const countActiveFilters = (filters: JobFilters) =>
  Object.values(filters).reduce((sum, values) => sum + values.length, 0);

export const filterLabel = (group: FilterGroupKey, value: string) =>
  FILTER_GROUPS.find((g) => g.key === group)?.options.find(
    (option) => option.value === value
  )?.label ?? value;
