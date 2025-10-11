import React from "react";

import Navbar from "@/components/navbar/Navbar";
import { Outlet } from "react-router";
import Footer from "@/components/footer/Footer";
import ScrollToTop from "@/shared/ScrollToTop";

const Layout: React.FC = () => {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main className="mx-auto max-w-7xl">
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default Layout;
