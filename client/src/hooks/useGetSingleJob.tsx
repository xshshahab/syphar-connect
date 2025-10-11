import { setSingleJob } from "@/redux/slice/jobSlice";
import type { RootState } from "@/redux/store";
import { JOB_API_ENDPOINT } from "@/utils/constant";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export const useGetSingleJob = (
  id: string,
  setIsApplied: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const fetchJob = async (id: string) => {
    try {
      const res = await axios.get(`${JOB_API_ENDPOINT}/fetch-by-id/${id}`, {
        withCredentials: true,
      });

      if (res?.data?.success) {
        dispatch(setSingleJob(res.data.job));
        setIsApplied(
          res.data.job.applications.some(
            (application: any) => application.applicant === user?._id
          )
        );
      }
    } catch (error) {
      console.error("ERROR! fetch single jobs: ", error);
    }
  };

  useEffect(() => {
    fetchJob(id);
  }, [id, dispatch, user?._id]);
};
