import { setAdminAllJobs } from "@/redux/slice/jobSlice";
import { JOB_API_ENDPOINT } from "@/utils/constant";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export const useGetAdminJobs = () => {
  const dispatch = useDispatch();

  const fetchAllJobs = async () => {
    try {
      const res = await axios.get(`${JOB_API_ENDPOINT}/admin-job`, {
        withCredentials: true,
      });
      if (res.data.success) {
        dispatch(setAdminAllJobs(res.data.jobs));
      }
    } catch (error) {
      console.error("ERROR! fetching admin all jobs: ", error);
    }
  };

  useEffect(() => {
    fetchAllJobs();
  }, []);
};
