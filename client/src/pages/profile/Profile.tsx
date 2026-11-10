import React from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import StudentProfile from "./StudentProfile";
import RecruiterProfile from "./RecruiterProfile";

const Profile: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  return user?.role === "recruiter" ? <RecruiterProfile /> : <StudentProfile />;
};

export default Profile;
