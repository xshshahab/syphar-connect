export interface Company {
  _id: string;
  name: string;
  description: string;
  website: string;
  location: string;
  logo: string;
  userId: string;
}

export interface Job {
  _id: string;
  title: string;
  description: string;
  requirements: string[];
  salary: number;
  location: string;
  jobType: string;
  position: number;
  experienceLevel: number;
  company: Company;
  created_by: string;
  // ids, or application records once the job has been populated
  applications: (string | { _id?: string; applicant?: string })[];
  createdAt: string;
  // only sent for a recruiter's own jobs: applications not yet accepted/rejected
  pendingApplications?: number;
}

export interface AllAppliedJobs {
  _id: string;
  applicant: string;
  createdAt: string;
  job: Job;
  status: string;
}

import type { JobFilters } from "@/utils/jobFilters";

export interface JobState {
  loading: boolean;
  allJobs: Job[];
  singleJob: Job | null;
  adminAllJobs: Job[];
  error?: string;
  allAppliedJobs: AllAppliedJobs[];
  savedJobs: Job[];
  searchQuery: string;
  filters: JobFilters;
}
