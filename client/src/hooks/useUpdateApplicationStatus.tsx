import axios from "axios";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { updateApplicationStatus } from "@/redux/slice/applicationSlice";
import { setAdminAllJobs } from "@/redux/slice/jobSlice";
import { APPLICATION_API_ENDPOINT, JOB_API_ENDPOINT } from "@/utils/constant";

// Accept / reject an application and reflect it on screen straight away
export const useUpdateApplicationStatus = () => {
  const dispatch = useDispatch();

  return async (id: string, status: "ACCEPTED" | "REJECTED" | "PENDING") => {
    try {
      const res = await axios.post(
        `${APPLICATION_API_ENDPOINT}/update-status/${id}`,
        { status },
        { withCredentials: true }
      );
      if (res.data.success) {
        dispatch(updateApplicationStatus({ id, status }));

        // refresh pending counts (navbar badge); a failure here is not critical
        axios
          .get(`${JOB_API_ENDPOINT}/admin-job`, { withCredentials: true })
          .then((jobsRes) => {
            if (jobsRes.data.success) {
              dispatch(setAdminAllJobs(jobsRes.data.jobs));
            }
          })
          .catch((error) => console.error("ERROR! refreshing jobs: ", error));
        toast.success(
          status === "ACCEPTED"
            ? "Applicant accepted"
            : status === "REJECTED"
            ? "Applicant rejected"
            : "Status reset to pending"
        );
        return true;
      }
    } catch (error) {
      console.error("ERROR! status handling: ", error);
      toast.error(
        axios.isAxiosError(error)
          ? error.response?.data?.message || "Could not update the status"
          : "Could not update the status"
      );
    }
    return false;
  };
};
