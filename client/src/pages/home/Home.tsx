import React, { useEffect } from "react";
import CategoryCarousel from "./components/CategoryCarousel";
import HeroSection from "./components/hero-section";
import LatestJobs from "./components/LatestJobs";
import { useGetAllJobs } from "@/hooks/useGetAllJobs";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { useNavigate } from "react-router";
import Features from "@/components/features-3";
import CommunitySection from "@/components/content-6";
import { useGetAllUsers } from "@/hooks/useGetAllUsers";
import StatsSection from "@/components/stats-4";

const Home: React.FC = () => {
  useGetAllJobs();
  useGetAllUsers();
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === "recruiter") {
      navigate("/admin/companies");
    }
  }, []);

  return (
    <>
      <HeroSection />
      <CategoryCarousel />
      <LatestJobs />
      <Features />
      <StatsSection />
      <CommunitySection />
    </>
  );
};

export default Home;
