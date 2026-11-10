import { setAllAppliedJobs } from "@/redux/slice/jobSlice";
import { APPLICATION_API_ENDPOINT } from "@/utils/constant";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/redux/store";

export const useGetAppliedJobs = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    if (user?.role !== "student") return;
    (async () => {
      try {
        const res = await axios.get(`${APPLICATION_API_ENDPOINT}/applied-job`, {
          withCredentials: true,
        });
        if (res.data.success) {
          dispatch(setAllAppliedJobs(res.data.application));
        }
      } catch (error) {
        console.error("ERROR! fetching applied jobs: ", error);
      }
    })();
  }, [user?._id, user?.role, dispatch]);
};
