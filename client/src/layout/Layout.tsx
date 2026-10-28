import React, { useEffect } from "react";

import Navbar from "@/components/navbar/Navbar";
import { Outlet } from "react-router";
import Footer from "@/components/footer/Footer";
import ScrollToTop from "@/shared/ScrollToTop";
import { useLoadSavedJobs } from "@/hooks/useSavedJobs";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { markOnboarded } from "@/utils/onboarding";

const Layout: React.FC = () => {
  useLoadSavedJobs();

  // accounts that existed before onboarding was added are marked on this device
  const { user } = useSelector((state: RootState) => state.auth);
  useEffect(() => {
    if (user) markOnboarded();
  }, [user]);

  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
