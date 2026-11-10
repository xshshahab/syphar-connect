import Logo from "@/shared/Logo";
import { Link } from "react-router";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { SOCIAL_LINKS } from "@/utils/constant";
import { useHomePath } from "@/hooks/useHomePath";

interface FooterGroup {
  group: string;
  items: { title: string; to: string }[];
}

const exploreLinks: FooterGroup = {
  group: "Explore",
  items: [
    { title: "Home", to: "/" },
    { title: "Jobs", to: "/jobs" },
    { title: "Search", to: "/search" },
  ],
};

const companyLinks: FooterGroup = {
  group: "Company",
  items: [
    { title: "About", to: "/about" },
    { title: "Contact", to: "/contact" },
  ],
};

const legalLinks: FooterGroup = {
  group: "Legal",
  items: [
    { title: "Privacy Policy", to: "/privacy" },
    { title: "Terms of Service", to: "/terms" },
  ],
};

const guestLinks: FooterGroup = {
  group: "Get Started",
  items: [
    { title: "Login", to: "/auth/login" },
    { title: "Sign up", to: "/auth/signup" },
  ],
};

const studentLinks: FooterGroup = {
  group: "Job Seekers",
  items: [
    { title: "My Profile", to: "/profile" },
    { title: "Applied Jobs", to: "/applied-jobs" },
  ],
};

const recruiterLinks: FooterGroup = {
  group: "Recruiters",
  items: [
    { title: "Companies", to: "/admin/companies" },
    { title: "Manage Jobs", to: "/admin/ad-jobs" },
    { title: "Applicants", to: "/admin/applicants" },
    { title: "Post a Job", to: "/admin/ad-jobs/post-job" },
    { title: "My Profile", to: "/profile" },
  ],
};

export default function Footer() {
  const homePath = useHomePath();
  const { user } = useSelector((state: RootState) => state.auth);

  // Only show links the current visitor can actually use
  const audienceLinks = !user
    ? guestLinks
    : user.role === "recruiter"
    ? recruiterLinks
    : studentLinks;
  const links = [exploreLinks, audienceLinks, companyLinks, legalLinks];

  return (
    <footer className="border-b bg-white pt-20 dark:bg-transparent">
      <div className="mb-8 border-b md:mb-12">
        <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-6 px-6 pb-6">
          <Link to={homePath} aria-label="go home" className="block size-fit">
            <Logo />
          </Link>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <a
              href={SOCIAL_LINKS.x}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X/Twitter"
              className="text-muted-foreground hover:text-primary block"
            >
              <svg
                className="size-6"
                xmlns="http://www.w3.org/2000/svg"
                width="1em"
                height="1em"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M10.488 14.651L15.25 21h7l-7.858-10.478L20.93 3h-2.65l-5.117 5.886L8.75 3h-7l7.51 10.015L2.32 21h2.65zM16.25 19L5.75 5h2l10.5 14z"
                ></path>
              </svg>
            </a>
            <a
              href={SOCIAL_LINKS.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="text-muted-foreground hover:text-primary block"
            >
              <svg
                className="size-6"
                xmlns="http://www.w3.org/2000/svg"
                width="1em"
                height="1em"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93zM6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37z"
                ></path>
              </svg>
            </a>
            <a
              href={SOCIAL_LINKS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-muted-foreground hover:text-primary block"
            >
              <svg
                className="size-6"
                xmlns="http://www.w3.org/2000/svg"
                width="1em"
                height="1em"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4zm9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8A1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5a5 5 0 0 1-5 5a5 5 0 0 1-5-5a5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3"
                ></path>
              </svg>
            </a>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {links.map((link) => (
            <div key={link.group} className="space-y-4 text-sm">
              <span className="block font-medium">{link.group}</span>
              {link.items.map((item) => (
                <Link
                  key={item.title}
                  to={item.to}
                  className="text-muted-foreground hover:text-primary block duration-150"
                >
                  <span>{item.title}</span>
                </Link>
              ))}
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap items-end justify-between gap-6 border-t py-6">
          <small className="text-muted-foreground order-last block text-center text-sm md:order-first">
            © {new Date().getFullYear()} SypharConnect, All rights reserved
          </small>
        </div>
      </div>
    </footer>
  );
}
