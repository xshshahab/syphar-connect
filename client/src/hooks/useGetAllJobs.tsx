import { setAllJobs } from "@/redux/slice/jobSlice";
import type { RootState } from "@/redux/store";
import { JOB_API_ENDPOINT } from "@/utils/constant";
import { emptyFilters } from "@/utils/jobFilters";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export const useGetAllJobs = () => {
  const dispatch = useDispatch();
  const query = useSelector((state: RootState) => state.job.searchQuery);
  const filters = useSelector((state: RootState) => state.job.filters) ?? emptyFilters;
  const user = useSelector((state: RootState) => state.auth.user);

  // stable key so the effect re-runs only when the selection really changes
  const filterKey = JSON.stringify(filters);

  useEffect(() => {
    // the jobs API requires a logged-in user
    if (!user) return;

    // ignore a slow response that was overtaken by a newer selection
    const controller = new AbortController();

    const params = new URLSearchParams();
    if (query) params.set("keyword", query);
    Object.entries(filters).forEach(([group, values]) =>
      values.forEach((value) => params.append(group, value))
    );
    const qs = params.toString();

    (async () => {
      try {
        const res = await axios.get(
          `${JOB_API_ENDPOINT}/all-job${qs ? `?${qs}` : ""}`,
          { withCredentials: true, signal: controller.signal }
        );
        if (res.data.success) {
          dispatch(setAllJobs(res.data.jobs));
        }
      } catch (error) {
        if (!axios.isCancel(error)) {
          console.error("ERROR! fetch all jobs: ", error);
        }
      }
    })();

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, filterKey, user?._id]);
};
