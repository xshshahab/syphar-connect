import React from "react";
import Layout from "./layout/Layout";
import Login from "./auth/login/Login";
import SignUp from "./auth/signup/SignUp";
import { createBrowserRouter, RouterProvider } from "react-router";
import Home from "./pages/home/Home";
import Jobs from "./pages/jobs/Jobs";
import BrowsePage from "./pages/browse/BrowsePage";
import Profile from "./pages/profile/Profile";
import JobDescription from "./pages/jobs/pages/JobDescription";
import AdminCompanies from "./admin/companies/AdminCompanies";
import AdminJob from "./admin/job/AdminJob";
import RegisterCompany from "./admin/companies/components/RegisterCompany";
import CompanySetup from "./admin/companies/components/CompanySetup";
import PostNewJob from "./admin/job/components/PostNewJob";
import JobApplicants from "./admin/job/components/JobApplicants";
import { ErrorPage } from "./shared/ErrorPage";
import { ProtectedRoutes } from "./routes/ProtectedRoutes";
import { AuthRoutes } from "./routes/AuthRoutes";

const App: React.FC = () => {
  const appRouter = createBrowserRouter([
    {
      path: "/auth/login",
      element: (
        <AuthRoutes>
          <Login />
        </AuthRoutes>
      ),
    },
    {
      path: "/auth/signup",
      element: (
        <AuthRoutes>
          <SignUp />
        </AuthRoutes>
      ),
    },
    {
      path: "/",
      element: <Layout />,
      errorElement: <ErrorPage />,
      children: [
        {
          path: "",
          element: <Home />,
        },
        {
          path: "/jobs",
          element: <Jobs />,
        },
        {
          path: "/description/:id",
          element: <JobDescription />,
        },
        {
          path: "/browse",
          element: <BrowsePage />,
        },
        {
          path: "/profile",
          element: <Profile />,
        },
        {
          path: "/admin/companies",
          element: (
            <ProtectedRoutes>
              <AdminCompanies />
            </ProtectedRoutes>
          ),
        },
        {
          path: "/admin/companies/register-company",
          element: (
            <ProtectedRoutes>
              <RegisterCompany />
            </ProtectedRoutes>
          ),
        },
        {
          path: "/admin/companies/:companyId",
          element: (
            <ProtectedRoutes>
              <CompanySetup />
            </ProtectedRoutes>
          ),
        },
        {
          path: "/admin/ad-jobs",
          element: (
            <ProtectedRoutes>
              <AdminJob />
            </ProtectedRoutes>
          ),
        },
        {
          path: "/admin/ad-jobs/post-job",
          element: (
            <ProtectedRoutes>
              <PostNewJob />
            </ProtectedRoutes>
          ),
        },
        {
          path: "/admin/ad-jobs/:id/applicants",
          element: (
            <ProtectedRoutes>
              <JobApplicants />
            </ProtectedRoutes>
          ),
        },
      ],
    },
  ]);

  return (
    <>
      <RouterProvider router={appRouter} />
    </>
  );
};

export default App;
