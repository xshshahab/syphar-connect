import React, { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router";
import { useSelector } from "react-redux";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  FileCheck2,
  Search,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/shared/Logo";
import { ModeToggle } from "@/shared/ModeToggle";
import { cn } from "@/lib/utils";
import type { RootState } from "@/redux/store";
import { markOnboarded } from "@/utils/onboarding";

type Slide = {
  icon: LucideIcon;
  badges: [LucideIcon, LucideIcon];
  title: string;
  description: string;
};

const slides: Slide[] = [
  {
    icon: Search,
    badges: [BriefcaseBusiness, CheckCircle2],
    title: "Discover jobs that fit you",
    description:
      "Browse openings and filter by location, industry and salary to find roles that match your skills.",
  },
  {
    icon: FileCheck2,
    badges: [CheckCircle2, Search],
    title: "Apply in one click",
    description:
      "Create your profile once, apply instantly and follow the status of every application in one place.",
  },
  {
    icon: Users,
    badges: [BriefcaseBusiness, FileCheck2],
    title: "Hire the right people",
    description:
      "Recruiters can register a company, publish openings and manage applicants from a single dashboard.",
  },
];

const Illustration: React.FC<{ slide: Slide }> = ({ slide }) => {
  const Icon = slide.icon;
  const [BadgeA, BadgeB] = slide.badges;

  return (
    <div className="relative mx-auto flex size-56 items-center justify-center sm:size-64">
      <div className="absolute inset-0 rounded-full bg-red-500/10 blur-2xl" />
      <div className="absolute inset-4 rounded-full border border-dashed" />
      <div className="relative flex size-32 items-center justify-center rounded-3xl border bg-card shadow-lg sm:size-36">
        <Icon className="size-14 text-red-500 sm:size-16" strokeWidth={1.5} />
      </div>
      <span className="absolute left-2 top-8 flex size-12 items-center justify-center rounded-2xl border bg-card shadow-md">
        <BadgeA className="size-5 text-muted-foreground" />
      </span>
      <span className="absolute bottom-6 right-2 flex size-12 items-center justify-center rounded-2xl border bg-card shadow-md">
        <BadgeB className="size-5 text-muted-foreground" />
      </span>
    </div>
  );
};

const Onboarding: React.FC = () => {
  const [step, setStep] = useState<number>(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);

  // pass along the page the visitor wanted, so login can return them there
  const from = (location.state as { from?: string } | null)?.from;

  if (user) return <Navigate to="/" replace />;

  const isLast = step === slides.length - 1;
  const slide = slides[step];

  const finish = (to: "/auth/signup" | "/auth/login") => {
    markOnboarded();
    navigate(to, { state: from ? { from } : undefined });
  };

  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex items-center justify-between p-4 md:px-10 md:py-6">
        <Link to="/" onClick={markOnboarded}>
          <Logo />
        </Link>
        <div className="flex items-center gap-3">
          <ModeToggle />
          {!isLast && (
            <Button variant="ghost" size="sm" onClick={() => finish("/auth/signup")}>
              Skip
            </Button>
          )}
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-8">
        <div className="w-full max-w-md text-center">
          {/* key re-mounts the slide so the entrance animation replays */}
          <div
            key={step}
            className="animate-in fade-in slide-in-from-right-4 duration-300"
          >
            <Illustration slide={slide} />
            <h1 className="mt-10 text-3xl font-semibold">{slide.title}</h1>
            <p className="mt-3 text-muted-foreground">{slide.description}</p>
          </div>

          <div
            className="mt-8 flex items-center justify-center gap-2"
            role="tablist"
            aria-label="Onboarding steps"
          >
            {slides.map((_, index) => (
              <button
                key={index}
                type="button"
                role="tab"
                aria-selected={index === step}
                aria-label={`Step ${index + 1}`}
                onClick={() => setStep(index)}
                className={cn(
                  "h-2 cursor-pointer rounded-full transition-all",
                  index === step ? "w-6 bg-red-500" : "w-2 bg-muted-foreground/30"
                )}
              />
            ))}
          </div>

          <div className="mt-8 space-y-3">
            {isLast ? (
              <>
                <Button className="w-full" size="lg" onClick={() => finish("/auth/signup")}>
                  Create an account
                </Button>
                <Button
                  className="w-full"
                  size="lg"
                  variant="outline"
                  onClick={() => finish("/auth/login")}
                >
                  I already have an account
                </Button>
              </>
            ) : (
              <Button className="w-full" size="lg" onClick={() => setStep(step + 1)}>
                Next <ArrowRight className="ml-1 size-4" />
              </Button>
            )}
            {step > 0 && (
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setStep(step - 1)}
              >
                <ArrowLeft className="mr-1 size-4" /> Back
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Onboarding;
