import React from "react";
import { Link } from "react-router";
import { BriefcaseBusiness, FileCheck2, Search, Users } from "lucide-react";
import Logo from "@/shared/Logo";
import logoMark from "@/assets/logo-mark.png";

interface AuthLayoutProps {
  variant: "login" | "signup";
  formWidth?: string;
  children: React.ReactNode;
}

const content = {
  login: {
    heading: "Welcome back to your career hub",
    description:
      "Pick up where you left off — track your applications or manage your openings.",
  },
  signup: {
    heading: "Connecting talent with opportunity",
    description:
      "Join SypharConnect to find your next role or discover your next great hire.",
  },
};

const points = [
  {
    icon: Search,
    title: "Find the right job",
    text: "Browse and filter openings by location, industry and salary.",
  },
  {
    icon: FileCheck2,
    title: "Apply in a click",
    text: "Apply directly and follow your application status in real time.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Post and manage jobs",
    text: "Recruiters can register a company and publish openings in minutes.",
  },
  {
    icon: Users,
    title: "Hire top talent",
    text: "Review applicants and update their status from one dashboard.",
  },
];

const AuthLayout: React.FC<AuthLayoutProps> = ({
  variant,
  formWidth = "max-w-xs",
  children,
}) => {
  const { heading, description } = content[variant];

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden border-r bg-background text-foreground lg:flex lg:flex-col lg:justify-between p-12">
        {/* decorative background */}
        <div className="pointer-events-none absolute -top-32 -left-32 size-96 rounded-full bg-red-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -right-24 size-96 rounded-full bg-foreground/5 blur-3xl" />
        <img
          src={logoMark}
          alt=""
          aria-hidden
          className="pointer-events-none absolute -right-10 top-1/2 h-[28rem] w-auto -translate-y-1/2 opacity-[0.04] invert dark:invert-0"
        />

        <Link to="/" className="relative z-10 w-fit">
          <Logo />
        </Link>

        <div className="relative z-10 max-w-md space-y-10">
          <div className="space-y-4">
            <h2 className="text-4xl font-semibold leading-tight">{heading}</h2>
            <p className="text-muted-foreground">{description}</p>
          </div>

          <ul className="space-y-6">
            {points.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-muted/40">
                  <Icon className="size-5" aria-hidden />
                </span>
                <div>
                  <p className="font-medium">{title}</p>
                  <p className="text-sm text-muted-foreground">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-sm text-muted-foreground">
          © {new Date().getFullYear()} SypharConnect. All rights reserved.
        </p>
      </aside>

      <div className="flex flex-col gap-4 p-6 md:p-10">
        {/* brand shown here only when the left panel is hidden */}
        <div className="flex justify-center md:justify-start lg:hidden">
          <Link to="/">
            <Logo />
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className={`w-full ${formWidth}`}>{children}</div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
