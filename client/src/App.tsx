import React from "react";
import Layout from "./layout/Layout";
import Login from "./auth/login/Login";
import SignUp from "./auth/signup/SignUp";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
import Home from "./pages/home/Home";
import Jobs from "./pages/jobs/Jobs";
import SearchPage from "./pages/search/SearchPage";
import Profile from "./pages/profile/Profile";
import AppliedJobs from "./pages/profile/AppliedJobs";
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
import About from "./pages/about/About";
import Contact from "./pages/contact/Contact";
import Privacy from "./pages/legal/Privacy";
import Terms from "./pages/legal/Terms";
import Onboarding from "./pages/onboarding/Onboarding";
import { RequireAuth } from "./routes/RequireAuth";
import AdminApplicants from "./admin/job/AdminApplicants";

const App: React.FC = () => {
  const appRouter = createBrowserRouter([
    {
      path: "/welcome",
      element: <Onboarding />,
    },
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
          element: (
            <RequireAuth>
              <Home />
            </RequireAuth>
          ),
        },
        {
          path: "/about",
          element: <About />,
        },
        {
          path: "/contact",
          element: <Contact />,
        },
        {
          path: "/privacy",
          element: <Privacy />,
        },
        {
          path: "/terms",
          element: <Terms />,
        },
        {
          path: "/jobs",
          element: (
            <RequireAuth>
              <Jobs />
            </RequireAuth>
          ),
        },
        {
          path: "/description/:id",
          element: (
            <RequireAuth>
              <JobDescription />
            </RequireAuth>
          ),
        },
        {
          path: "/search",
          element: (
            <RequireAuth>
              <SearchPage />
            </RequireAuth>
          ),
        },
        {
          // old Browse links keep working
          path: "/browse",
          element: <Navigate to="/search" replace />,
        },
        {
          path: "/profile",
          element: (
            <RequireAuth>
              <Profile />
            </RequireAuth>
          ),
        },
        {
          path: "/applied-jobs",
          element: (
            <RequireAuth>
              <AppliedJobs />
            </RequireAuth>
          ),
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
          path: "/admin/applicants",
          element: (
            <ProtectedRoutes>
              <AdminApplicants />
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
