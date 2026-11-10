import type { RootState } from "@/redux/store";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";

interface ProtectedRoutesProps {
  children: React.ReactNode;
}

export const ProtectedRoutes: React.FC<ProtectedRoutesProps> = ({
  children,
}) => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (user === null || user.role !== "recruiter") {
      navigate("/");
    }
  }, []);

  return <div>{children}</div>;
};
