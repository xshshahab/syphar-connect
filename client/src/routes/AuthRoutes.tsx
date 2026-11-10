import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router";
import type { RootState } from "@/redux/store";
import { markOnboarded } from "@/utils/onboarding";

interface AuthRoutesProps {
  children: React.ReactNode;
}

export const AuthRoutes: React.FC<AuthRoutesProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/";
  const { user } = useSelector((state: RootState) => state.auth);

  // anyone who reaches login/signup has seen the intro; do not show it again
  useEffect(() => {
    markOnboarded();
  }, []);

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  return <>{children}</>;
};
