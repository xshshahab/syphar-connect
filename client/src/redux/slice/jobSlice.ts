import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Job, JobState } from "../types/jobTypes";
import { emptyFilters, type FilterGroupKey } from "@/utils/jobFilters";

const initialState: JobState = {
  loading: false,
  allJobs: [],
  singleJob: null,
  adminAllJobs: [],
  error: undefined,
  allAppliedJobs: [],
  savedJobs: [],
  searchQuery: "",
  filters: emptyFilters,
};

const jobSlice = createSlice({
  name: "job",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setAllJobs: (state, action: PayloadAction<Job[]>) => {
      state.allJobs = action.payload;
    },
    setSingleJob: (state, action: PayloadAction<Job>) => {
      state.singleJob = action.payload;
    },
    setAdminAllJobs: (state, action: PayloadAction<Job[]>) => {
      state.adminAllJobs = action.payload;
    },
    setAllAppliedJobs: (state, action) => {
      state.allAppliedJobs = action.payload;
    },
    setSavedJobs: (state, action: PayloadAction<Job[]>) => {
      state.savedJobs = action.payload;
    },
    // tick / untick one checkbox of a filter group
    toggleFilter: (
      state,
      action: PayloadAction<{ group: FilterGroupKey; value: string }>
    ) => {
      const { group, value } = action.payload;
      // state saved before filters existed has no `filters`
      const filters = state.filters ?? { ...emptyFilters };
      const current = filters[group];
      filters[group] = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
      state.filters = filters;
    },
    clearFilters: (state) => {
      state.filters = { ...emptyFilters };
    },
    setError: (state, action: PayloadAction<string | undefined>) => {
      state.error = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
  },
});

export const {
  setLoading,
  setAllJobs,
  setSingleJob,
  setError,
  setAllAppliedJobs,
  setAdminAllJobs,
  setSearchQuery,
  setSavedJobs,
  toggleFilter,
  clearFilters,
} = jobSlice.actions;
export default jobSlice.reducer;
