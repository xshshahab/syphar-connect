import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router";
import { useSelector } from "react-redux";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Bookmark,
  Check,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/shared/Logo";
import { ModeToggle } from "@/shared/ModeToggle";
import { cn } from "@/lib/utils";
import type { RootState } from "@/redux/store";
import { markOnboarded } from "@/utils/onboarding";
import { Backdrop, Orbits } from "./backdrop";
import { CardsLayer } from "./cards";
import {
  APPLY_CARDS,
  DISCOVER_CARDS,
  HIRE_CARDS,
  type CardSpec,
} from "./cardData";
import {
  ApplyPreview,
  DiscoverPreview,
  FloatingNote,
  HirePreview,
} from "./previews";
import "./onboarding.css";

type Slide = {
  label: string; // short name in the step list
  audience: string; // who this step is for
  title: [string, string]; // second part is highlighted in red
  description: string;
  windowTitle: string; // title bar of the preview window
  layout: "center" | "split"; // hero centred above the window, or hero left / window right
  Preview: React.FC<{ active: boolean }>;
  note: { icon: LucideIcon; title: string; text: string; className: string };
  cards: CardSpec[];
};

const slides: Slide[] = [
  {
    label: "Discover",
    audience: "For job seekers",
    title: ["Find the job that", "fits you."],
    description:
      "Search openings, filter by city, role and salary, and save the ones you like for later.",
    windowTitle: "Browse Jobs",
    layout: "center",
    Preview: DiscoverPreview,
    note: {
      icon: Bookmark,
      title: "Saved for later",
      text: "React Engineer · NextInward",
      className: "-bottom-6 left-5",
    },
    cards: DISCOVER_CARDS,
  },
  {
    label: "Apply & track",
    audience: "For job seekers",
    title: ["Apply in one click.", "Track every step."],
    description:
      "Upload your resume once, apply instantly, and see whether each application is pending, accepted or rejected.",
    windowTitle: "My applications",
    layout: "split",
    Preview: ApplyPreview,
    note: {
      icon: Check,
      title: "You're in!",
      text: "Northwind accepted your application",
      className: "-bottom-6 -left-10",
    },
    cards: APPLY_CARDS,
  },
  {
    label: "Hire",
    audience: "For recruiters",
    title: ["Hire the right people,", "faster."],
    description:
      "Register your company, post openings and accept or reject applicants from one simple dashboard.",
    windowTitle: "Recruiter dashboard",
    layout: "split",
    Preview: HirePreview,
    note: {
      icon: Bell,
      title: "New applicant",
      text: "Riya Sharma applied to Frontend Developer",
      className: "-bottom-6 -left-10",
    },
    cards: HIRE_CARDS,
  },
];

/* The app window that shows the product for the current step */
const AppWindow: React.FC<{ slide: Slide; active: boolean }> = ({
  slide,
  active,
}) => {
  const { Preview, note } = slide;
  const split = slide.layout === "split";

  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative w-full max-w-[34rem]",
        split
          ? "lg:w-[30vw] lg:min-w-[400px] lg:max-w-[640px]"
          : "lg:w-[26vw] lg:min-w-[360px] lg:max-w-[540px]",
      )}
    >
      <Orbits />
      <div className="relative z-10 overflow-hidden rounded-[20px] border border-[#FF303B]/40 bg-white/95 shadow-[0_0_60px_-14px_rgba(255,35,50,0.35)] dark:bg-[#151213]/95 dark:shadow-[0_0_70px_-14px_rgba(255,35,50,0.6)]">
        <div className="flex items-center gap-2 border-b border-black/10 px-4 py-3 dark:border-white/10">
          <span className="size-2.5 rounded-full bg-[#FF303B]" />
          <span className="size-2.5 rounded-full bg-[#F5B942]" />
          <span className="size-2.5 rounded-full bg-zinc-300 dark:bg-zinc-600" />
          <span className="ml-3 text-xs text-zinc-600 dark:text-zinc-300">
            {slide.windowTitle}
          </span>
        </div>
        {/* on phones only the top part is shown, so the buttons stay on screen */}
        <div className="max-h-[300px] overflow-hidden p-4 sm:max-h-none sm:p-5">
          <Preview active={active} />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent sm:hidden dark:from-[#151213]" />
      </div>
      <FloatingNote {...note} />
    </div>
  );
};

/* Scales the content down when the window is too small for it, so the page
   never needs to scroll, on any screen size. */
const FitToScreen: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const box = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const outer = box.current;
    const inner = content.current;
    if (!outer || !inner) return;

    const fit = () => {
      const scale = Math.min(
        1,
        outer.clientHeight / inner.offsetHeight,
        outer.clientWidth / inner.offsetWidth,
      );
      inner.style.transform = scale < 1 ? `scale(${Math.max(scale, 0.4)})` : "";
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(outer);
    observer.observe(inner);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={box}
      className="relative z-10 flex min-h-0 flex-1 items-center justify-center"
    >
      <div ref={content} className="w-full">
        {children}
      </div>
    </div>
  );
};

type ScreenState = "before" | "current" | "after";

/* One full screen of the onboarding. All three are built once and stay
   mounted: pressing Next only flips `state`, and CSS fades them (opacity and
   transform only). Nothing is rebuilt, so the switch stays smooth. */
const Screen = React.memo(function Screen({
  index,
  state,
  onGo,
  onFinish,
}: {
  index: number;
  state: ScreenState;
  onGo: (step: number) => void;
  onFinish: (to: "/auth/signup" | "/auth/login") => void;
}) {
  const slide = slides[index];
  const center = slide.layout === "center";
  const isLast = index === slides.length - 1;
  const active = state === "current";

  return (
    <div
      className="oc-scene"
      data-state={state}
      aria-hidden={!active}
      inert={!active}
    >
      <FitToScreen>
        <div
          className={cn(
            "flex w-full flex-col gap-8 px-6 py-2 sm:gap-10",
            center
              ? "items-center justify-center lg:gap-[3.5vh]"
              : "items-center justify-center lg:flex-row lg:justify-between lg:px-0",
          )}
        >
          <div
            className={cn(
              "relative z-10 w-full max-w-xl",
              center
                ? "mx-auto flex max-w-2xl flex-col items-center text-center"
                : "lg:ml-[5.5vw] lg:w-[36vw] lg:max-w-none",
            )}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/[0.03] px-3.5 py-1 text-xs font-medium text-zinc-700 dark:border-white/15 dark:bg-white/[0.03] dark:text-zinc-200">
              <span className="size-1.5 rounded-full bg-[#FF303B]" />
              {slide.audience}
            </span>

            <h1
              className="mt-5 font-semibold leading-[1.08] tracking-tight text-zinc-950 dark:text-white"
              style={{ fontSize: "clamp(1.9rem, 3vw, 3.8rem)" }}
            >
              <span className="block">{slide.title[0]}</span>
              <span className="block text-[#FF303B]">{slide.title[1]}</span>
            </h1>

            <p
              className={cn(
                "mt-4 max-w-md text-base leading-relaxed text-zinc-600 lg:text-[1.05rem] dark:text-zinc-400",
                center && "mx-auto",
              )}
            >
              {slide.description}
            </p>

            {/* the three steps: click any of them to jump */}
            <div
              role="tablist"
              aria-label="Onboarding steps"
              className="mt-7 grid w-full max-w-[28rem] grid-cols-3 gap-4 text-left"
            >
              {slides.map((item, i) => (
                <button
                  key={item.label}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  onClick={() => onGo(i)}
                  className="group cursor-pointer"
                >
                  <span className="block h-0.5 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                    <span
                      className={cn(
                        "block h-full bg-[#FF303B]",
                        i <= index ? "w-full" : "w-0",
                      )}
                    />
                  </span>
                  <span
                    className={cn(
                      "mt-3 block text-xs font-medium transition-colors",
                      i === index
                        ? "text-zinc-950 dark:text-white"
                        : "text-zinc-500 group-hover:text-zinc-950 dark:text-zinc-400 dark:group-hover:text-white",
                    )}
                  >
                    <span className="mr-1.5 tabular-nums text-[#FF303B]">
                      0{i + 1}
                    </span>
                    {item.label}
                  </span>
                </button>
              ))}
            </div>

            <div
              className={cn(
                "mt-7 flex w-full flex-col gap-3",
                center ? "items-center" : "items-start",
              )}
            >
              {isLast ? (
                <>
                  <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                    <Button
                      size="lg"
                      className="h-11 rounded-full bg-[#FF303B] px-7 font-semibold text-white shadow-[0_0_30px_-4px_rgba(255,48,59,0.7)] hover:bg-[#ff4650]"
                      onClick={() => onFinish("/auth/signup")}
                    >
                      Create an account <ArrowRight className="ml-1 size-4" />
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="h-11 rounded-full border-black/15 bg-transparent px-7 text-zinc-900 hover:bg-black/5 hover:text-zinc-950 dark:border-white/15 dark:text-white dark:hover:bg-white/10 dark:hover:text-white"
                      onClick={() => onFinish("/auth/login")}
                    >
                      I already have an account
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    className="h-10 rounded-full px-3 text-zinc-600 hover:bg-black/5 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-white/5 dark:hover:text-white"
                    onClick={() => onGo(index - 1)}
                  >
                    <ArrowLeft className="mr-1 size-4" /> Back
                  </Button>
                </>
              ) : (
                <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                  <Button
                    size="lg"
                    className="h-11 rounded-full bg-zinc-950 px-8 font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-white/90"
                    onClick={() => onGo(index + 1)}
                  >
                    Next <ArrowRight className="ml-1 size-4" />
                  </Button>
                  {index > 0 && (
                    <Button
                      variant="ghost"
                      className="h-11 rounded-full px-4 text-zinc-600 hover:bg-black/5 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-white/5 dark:hover:text-white"
                      onClick={() => onGo(index - 1)}
                    >
                      <ArrowLeft className="mr-1 size-4" /> Back
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div
            className={cn(
              "flex w-full justify-center max-lg:order-first",
              !center && "lg:mr-[23vw] lg:w-auto",
            )}
          >
            <AppWindow slide={slide} active={active} />
          </div>
        </div>
      </FitToScreen>
    </div>
  );
});

const Onboarding: React.FC = () => {
  const [step, setStep] = useState<number>(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);

  // pass along the page the visitor wanted, so login can return them there
  const from = (location.state as { from?: string } | null)?.from;

  const finish = useCallback(
    (to: "/auth/signup" | "/auth/login") => {
      markOnboarded();
      navigate(to, { state: from ? { from } : undefined });
    },
    [from, navigate],
  );

  // the page itself must never scroll (not even by overscroll or keyboard)
  useEffect(() => {
    const { documentElement: html, body } = document;
    const before = [html.style.overflow, body.style.overflow];
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.style.overflow = before[0];
      body.style.overflow = before[1];
    };
  }, []);

  // arrow keys move between the steps
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight")
        setStep((s) => Math.min(s + 1, slides.length - 1));
      if (event.key === "ArrowLeft") setStep((s) => Math.max(s - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (user) return <Navigate to="/" replace />;

  const isLast = step === slides.length - 1;

  return (
    // Exactly the height of the window and never scrolls; the content is scaled to fit
    <div className="relative isolate flex h-dvh flex-col overflow-hidden bg-[#FBF9F9] text-zinc-950 dark:bg-[#080808] dark:text-white">
      <Backdrop />

      <header className="relative z-20 flex shrink-0 items-center justify-between px-6 py-5 lg:px-[3.2vw] lg:py-7">
        <Link to="/" onClick={markOnboarded}>
          <Logo />
        </Link>
        <div className="flex items-center gap-3">
          <ModeToggle />
          {!isLast && (
            <Button
              variant="ghost"
              size="sm"
              className="text-zinc-900 hover:bg-black/5 hover:text-zinc-950 dark:text-white dark:hover:bg-white/10 dark:hover:text-white"
              onClick={() => finish("/auth/signup")}
            >
              Skip
            </Button>
          )}
        </div>
      </header>

      <main className="relative min-h-0 flex-1">
        {/* the floating cards of each step, and the screens themselves, are
            all mounted once; only the active one is shown */}
        {slides.map((item, index) => (
          <CardsLayer
            key={item.label}
            cards={item.cards}
            active={index === step}
          />
        ))}
        {slides.map((item, index) => (
          <Screen
            key={item.label}
            index={index}
            state={
              index === step ? "current" : index < step ? "before" : "after"
            }
            onGo={setStep}
            onFinish={finish}
          />
        ))}
      </main>
    </div>
  );
};

export default Onboarding;
