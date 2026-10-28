import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface Profile {
  profilePhoto: string;
  skills: string[];
  bio: string;
  resume: string;
  resumeOriginalName: string;
}

export interface Applicant {
  _id: string;
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  profile: Profile;
}

export interface Application {
  _id: string;
  job: string;
  applicant: Applicant;
  status: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
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
  company: string;
  created_by: string;
  applications: Application[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ApplicantsState {
  applicants: Job | null;
}

const initialState: ApplicantsState = {
  applicants: null,
};

export const applicationSlice = createSlice({
  name: "application",
  initialState,
  reducers: {
    setAllApplicants: (state, action: PayloadAction<Job>) => {
      state.applicants = action.payload;
    },
    updateApplicationStatus: (
      state,
      action: PayloadAction<{ id: string; status: string }>
    ) => {
      const application = state.applicants?.applications.find(
        (item) => item._id === action.payload.id
      );
      if (application) application.status = action.payload.status;
    },
  },
});

export const { setAllApplicants, updateApplicationStatus } =
  applicationSlice.actions;
export const applicationReducer = applicationSlice.reducer;
