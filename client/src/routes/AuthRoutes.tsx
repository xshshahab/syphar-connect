import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import type { RootState } from "@/redux/store";

interface AuthRoutesProps {
  children: React.ReactNode;
}

export const AuthRoutes: React.FC<AuthRoutesProps> = ({ children }) => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  return <>{children}</>;
};
