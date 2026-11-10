import { setAdminAllJobs } from "@/redux/slice/jobSlice";
import { JOB_API_ENDPOINT } from "@/utils/constant";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/redux/store";

export const useGetAdminJobs = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  const fetchAllJobs = async () => {
    if (user?.role !== "recruiter") return;
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
  }, [user?._id, user?.role]);
};
