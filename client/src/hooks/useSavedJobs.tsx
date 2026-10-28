import axios from "axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { setSavedJobs } from "@/redux/slice/jobSlice";
import type { RootState } from "@/redux/store";
import type { Job } from "@/redux/types/jobTypes";
import { JOB_API_ENDPOINT } from "@/utils/constant";

const fetchSavedJobs = async (): Promise<Job[] | null> => {
  try {
    const res = await axios.get(`${JOB_API_ENDPOINT}/saved`, {
      withCredentials: true,
    });
    return res.data.success ? res.data.jobs : null;
  } catch (error) {
    console.error("ERROR! fetch saved jobs: ", error);
    return null;
  }
};

// Loads the student's bookmarks once after login so every card knows its state
export const useLoadSavedJobs = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const isStudent = user?.role === "student";

  useEffect(() => {
    if (!isStudent) return;
    fetchSavedJobs().then((jobs) => jobs && dispatch(setSavedJobs(jobs)));
  }, [isStudent, user?._id, dispatch]);
};

export const useSavedJobs = () => {
  const dispatch = useDispatch();
  const savedJobs = useSelector(
    (state: RootState) => state.job.savedJobs ?? []
  );

  const isSaved = (jobId: string) => savedJobs.some((job) => job._id === jobId);

  const toggleSave = async (job: Job) => {
    const wasSaved = isSaved(job._id);

    // optimistic update, rolled back if the request fails
    dispatch(
      setSavedJobs(
        wasSaved
          ? savedJobs.filter((saved) => saved._id !== job._id)
          : [job, ...savedJobs]
      )
    );

    try {
      const url = `${JOB_API_ENDPOINT}/save/${job._id}`;
      const res = wasSaved
        ? await axios.delete(url, { withCredentials: true })
        : await axios.post(url, {}, { withCredentials: true });
      toast.success(res.data.message);

      // refetch so the saved entry always carries full company details
      const fresh = await fetchSavedJobs();
      if (fresh) dispatch(setSavedJobs(fresh));
    } catch (error) {
      dispatch(setSavedJobs(savedJobs));
      toast.error(
        axios.isAxiosError(error)
          ? error.response?.data?.message || "Could not update saved jobs"
          : "Could not update saved jobs"
      );
    }
  };

  return { savedJobs, isSaved, toggleSave };
};
