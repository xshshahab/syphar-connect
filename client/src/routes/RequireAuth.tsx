import React from "react";
import { Navigate, useLocation } from "react-router";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { hasOnboarded } from "@/utils/onboarding";

interface RequireAuthProps {
  children: React.ReactNode;
}

// Job pages need a logged-in user (the jobs API is protected). Guests are sent
// to onboarding the first time, and to login afterwards, then brought back.
export const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  if (!user) {
    const from = location.pathname + location.search;
    return hasOnboarded() ? (
      <Navigate to="/auth/login" replace state={{ from }} />
    ) : (
      <Navigate to="/welcome" replace state={{ from }} />
    );
  }

  return <>{children}</>;
};
