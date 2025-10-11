import { setAllJobs } from "@/redux/slice/jobSlice";
import type { RootState } from "@/redux/store";
import { JOB_API_ENDPOINT } from "@/utils/constant";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export const useGetAllJobs = () => {
  const dispatch = useDispatch();
  const query = useSelector((state: RootState) => state.job.searchQuery);

  const fetchAllJobs = async () => {
    try {
      const url = query
        ? `${JOB_API_ENDPOINT}/all-job?keyword=${encodeURIComponent(query)}`
        : `${JOB_API_ENDPOINT}/all-job`;

      const res = await axios.get(url, {
        withCredentials: true,
      });

      if (res.data.success) {
        dispatch(setAllJobs(res.data.jobs));
      }
    } catch (error) {
      console.error("ERROR! fetch all jobs: ", error);
    }
  };

  useEffect(() => {
    fetchAllJobs();
  }, [query]);
};
