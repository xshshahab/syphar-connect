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
  applications: string[];
  createdAt: string;
}

export interface AllAppliedJobs {
  _id: string;
  applicant: string;
  createdAt: string;
  job: Job;
  status: string;
}

export interface JobState {
  loading: boolean;
  allJobs: Job[];
  singleJob: Job | null;
  adminAllJobs: Job[];
  error?: string;
  allAppliedJobs: AllAppliedJobs[];
  searchQuery: string;
}
