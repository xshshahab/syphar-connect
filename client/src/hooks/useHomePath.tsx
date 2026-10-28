import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";

// Where "home" is for the current user: recruiters work from their companies page
export const useHomePath = (): string => {
  const role = useSelector((state: RootState) => state.auth.user?.role);
  return role === "recruiter" ? "/admin/companies" : "/";
};
