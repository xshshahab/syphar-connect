import React, { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  Bookmark,
  Check,
  FileText,
  MapPin,
  Search,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* Every surface here has a light and a dark version (dark: variants). */
const TEXT = "text-zinc-950 dark:text-white";
const MUTED = "text-zinc-500 dark:text-zinc-400";
const ROW =
  "flex items-center gap-3 rounded-2xl border border-black/[0.07] bg-zinc-50 p-3 dark:border-white/[0.08] dark:bg-[#1d1719]/70";

/* ---------- motion helpers ---------- */

const Stagger: React.FC<{
  children: React.ReactNode;
  className?: string;
  active: boolean;
}> = ({ children, className, active }) => {
  // The rows appear one after another each time the screen is shown. Once the
  // screen has faded out they are reset, ready for the next time.
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (active) {
      setShown(true);
      return;
    }
    const timer = setTimeout(() => setShown(false), 700);
    return () => clearTimeout(timer);
  }, [active]);

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate={shown ? "show" : "hidden"}
      variants={{
        show: { transition: { staggerChildren: 0.06, delayChildren: 0.12 } },
      }}
    >
      {children}
    </motion.div>
  );
};

const Item: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: reduce ? 0 : 8, transition: { duration: 0 } },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
        },
      }}
    >
      {children}
    </motion.div>
  );
};

/* A notification that floats over the edge of the window */
export const FloatingNote: React.FC<{
  icon: LucideIcon;
  title: string;
  text: string;
  className?: string;
}> = ({ icon: Icon, title, text, className }) => {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: reduce ? 0 : [0, -6, 0] }}
      transition={{
        opacity: { delay: 0.55, duration: 0.3 },
        scale: { delay: 0.55, duration: 0.3 },
        y: reduce
          ? undefined
          : { delay: 0.9, duration: 4, repeat: Infinity, ease: "easeInOut" },
      }}
      className={cn(
        "absolute z-20 hidden items-center gap-3 rounded-2xl border border-black/10 bg-white py-3 pl-3 pr-5 shadow-[0_18px_40px_-12px_rgba(70,20,28,0.4)] sm:flex dark:border-white/10 dark:bg-[#1d1719] dark:shadow-[0_18px_40px_-12px_rgba(0,0,0,0.9)]",
        className,
      )}
    >
      <span className="flex size-9 items-center justify-center rounded-full bg-[#FF303B]/15 text-[#E11D2A] ring-1 ring-[#FF303B]/30 dark:text-[#FF303B]">
        <Icon className="size-4" />
      </span>
      <span className="leading-tight">
        <span className={cn("block text-sm font-medium", TEXT)}>{title}</span>
        <span className={cn("block text-xs", MUTED)}>{text}</span>
      </span>
    </motion.div>
  );
};

/* ---------- small building blocks ---------- */

type Status = "Pending" | "Accepted" | "Rejected";

const STATUS_STYLE: Record<Status, string> = {
  Pending:
    "bg-amber-500/15 text-amber-700 dark:bg-[#F5B942]/15 dark:text-[#F5B942]",
  Accepted:
    "bg-emerald-500/15 text-emerald-700 dark:bg-[#10B981]/15 dark:text-[#10B981]",
  Rejected:
    "bg-red-500/15 text-red-600 dark:bg-[#EF4444]/15 dark:text-[#EF4444]",
};

const StatusBadge: React.FC<{ status: Status }> = ({ status }) => (
  <span
    className={cn(
      "rounded-full px-2.5 py-1 text-[11px] font-medium",
      STATUS_STYLE[status],
    )}
  >
    {status}
  </span>
);

const Avatar: React.FC<{ letter: string }> = ({ letter }) => (
  <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-black/10 bg-black/[0.04] text-sm font-semibold text-zinc-900 dark:border-white/10 dark:bg-white/5 dark:text-white">
    {letter}
  </span>
);

const Chip: React.FC<{ children: React.ReactNode; active?: boolean }> = ({
  children,
  active,
}) => (
  <span
    className={cn(
      "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs",
      active
        ? "border-[#FF303B]/40 bg-[#FF303B]/10 text-[#E11D2A] dark:text-[#FF5A63]"
        : "border-black/10 text-zinc-600 dark:border-white/10 dark:text-zinc-400",
    )}
  >
    {children}
  </span>
);

/* ---------- 1. Discover: search + filters + job cards ---------- */

type Job = {
  title: string;
  company: string;
  meta: string;
  salary: string;
  saved?: boolean;
};

const JOBS: Job[] = [
  {
    title: "Frontend Developer",
    company: "Acme Labs",
    meta: "Bengaluru · Full-time",
    salary: "₹14 LPA",
  },
  {
    title: "React Engineer",
    company: "NextInward",
    meta: "Bengaluru · Full-time",
    salary: "₹18 LPA",
    saved: true,
  },
  {
    title: "UI Engineer",
    company: "Pixel & Co",
    meta: "Bengaluru · Contract",
    salary: "₹12 LPA",
  },
];

export const DiscoverPreview: React.FC<{ active: boolean }> = ({ active }) => (
  <Stagger active={active} className="space-y-3">
    <Item>
      <div className="flex items-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-2.5 dark:border-white/10 dark:bg-black/40">
        <Search className={cn("size-4", MUTED)} />
        <span className={cn("text-sm", TEXT)}>react developer</span>
        <span className="h-4 w-px animate-pulse bg-[#FF303B]" />
      </div>
    </Item>
    <Item>
      <div className="flex flex-wrap gap-2">
        <Chip active>
          <MapPin className="size-3" /> Bengaluru
        </Chip>
        <Chip>Full-time</Chip>
        <Chip>₹10–20 LPA</Chip>
      </div>
    </Item>
    <Item className="[@media(max-height:800px)]:hidden">
      <p className={cn("pt-1 text-xs", MUTED)}>3,286 matches found</p>
    </Item>
    {JOBS.map((job, index) => (
      <Item
        key={job.title}
        className={index === 2 ? "[@media(max-height:760px)]:hidden" : ""}
      >
        <div className={ROW}>
          <Avatar letter={job.company[0]} />
          <div className="min-w-0 flex-1">
            <p className={cn("truncate text-sm font-medium", TEXT)}>
              {job.title}
            </p>
            <p className={cn("truncate text-xs", MUTED)}>
              {job.company} · {job.meta}
            </p>
          </div>
          <div className="text-right">
            <p className={cn("text-sm font-semibold", TEXT)}>{job.salary}</p>
            <Bookmark
              className={cn(
                "ml-auto mt-1 size-4",
                job.saved
                  ? "fill-[#FF303B] text-[#FF303B]"
                  : "text-zinc-400 dark:text-zinc-500",
              )}
            />
          </div>
        </div>
      </Item>
    ))}
  </Stagger>
);

/* ---------- 2. Apply & track ---------- */

const APPLICATIONS: { title: string; company: string; status: Status }[] = [
  { title: "Frontend Developer", company: "Acme Labs", status: "Pending" },
  { title: "React Engineer", company: "Northwind", status: "Accepted" },
  { title: "UI Engineer", company: "Pixel & Co", status: "Rejected" },
];

export const ApplyPreview: React.FC<{ active: boolean }> = ({ active }) => (
  <Stagger active={active} className="space-y-3">
    <Item>
      <div className="rounded-2xl border border-emerald-600/30 bg-emerald-500/[0.07] p-4 dark:border-[#10B981]/35 dark:bg-[#10B981]/[0.06]">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-700 ring-1 ring-emerald-600/30 dark:bg-[#10B981]/15 dark:text-[#10B981] dark:ring-[#10B981]/30">
            <Check className="size-5" strokeWidth={2.5} />
          </span>
          <div>
            <p className={cn("text-sm font-medium", TEXT)}>
              Applied successfully
            </p>
            <p className={cn("text-xs", MUTED)}>
              Frontend Developer · Acme Labs
            </p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-2 text-xs dark:border-white/10 dark:bg-black/40">
          <FileText className="size-4 text-[#FF303B]" />
          <span className={cn("font-medium", TEXT)}>resume.pdf</span>
          <span className={cn("hidden sm:inline", MUTED)}>
            · sent with your application
          </span>
        </div>
      </div>
    </Item>
    <Item>
      <p className={cn("pt-1 text-xs font-medium", MUTED)}>Your applications</p>
    </Item>
    {APPLICATIONS.map((app) => (
      <Item key={app.title}>
        <div className={ROW}>
          <Avatar letter={app.company[0]} />
          <div className="min-w-0 flex-1">
            <p className={cn("truncate text-sm font-medium", TEXT)}>
              {app.title}
            </p>
            <p className={cn("truncate text-xs", MUTED)}>{app.company}</p>
          </div>
          <StatusBadge status={app.status} />
        </div>
      </Item>
    ))}
  </Stagger>
);

/* ---------- 3. Hire: recruiter dashboard ---------- */

const STATS = [
  { label: "Active jobs", value: "4" },
  { label: "Applicants", value: "28" },
  { label: "Pending", value: "12" },
];

const APPLICANTS = [
  { name: "Riya Sharma", info: "3 yrs · React, TypeScript" },
  { name: "Arjun Mehta", info: "5 yrs · Node, PostgreSQL" },
  { name: "Neha Verma", info: "1 yr · UI, Figma" },
];

export const HirePreview: React.FC<{ active: boolean }> = ({ active }) => {
  // the first applicant gets accepted a moment after the screen appears,
  // to show what a decision looks like; it resets after the screen is hidden
  const [accepted, setAccepted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setAccepted(active), active ? 1600 : 700);
    return () => clearTimeout(timer);
  }, [active]);

  return (
    <Stagger active={active} className="space-y-3">
      <Item>
        <div className="grid grid-cols-3 gap-2">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-black/[0.07] bg-zinc-50 p-3 dark:border-white/[0.08] dark:bg-[#1d1719]/70"
            >
              <p className={cn("text-xl font-semibold tabular-nums", TEXT)}>
                {stat.value}
              </p>
              <p className={cn("text-[11px]", MUTED)}>{stat.label}</p>
            </div>
          ))}
        </div>
      </Item>
      <Item>
        <div className="flex items-center justify-between pt-1">
          <p className={cn("text-sm font-medium", TEXT)}>Frontend Developer</p>
          <p className={cn("text-xs", MUTED)}>12 applicants</p>
        </div>
      </Item>
      {APPLICANTS.map((person, index) => (
        <Item key={person.name}>
          <div className={ROW}>
            <Avatar
              letter={person.name
                .split(" ")
                .map((part) => part[0])
                .join("")}
            />
            <div className="min-w-0 flex-1">
              <p className={cn("truncate text-sm font-medium", TEXT)}>
                {person.name}
              </p>
              <p className={cn("truncate text-xs", MUTED)}>{person.info}</p>
            </div>
            <AnimatePresence mode="wait" initial={false}>
              {index === 0 && accepted ? (
                <motion.span
                  key="accepted"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <StatusBadge status="Accepted" />
                </motion.span>
              ) : (
                <motion.span
                  key="actions"
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex gap-1.5"
                >
                  <span className="flex size-8 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-700 ring-1 ring-emerald-600/30 dark:bg-[#10B981]/15 dark:text-[#10B981] dark:ring-[#10B981]/30">
                    <Check className="size-4" />
                  </span>
                  <span className="flex size-8 items-center justify-center rounded-full bg-red-500/15 text-red-600 ring-1 ring-red-500/30 dark:bg-[#EF4444]/15 dark:text-[#EF4444] dark:ring-[#EF4444]/30">
                    <X className="size-4" />
                  </span>
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </Item>
      ))}
    </Stagger>
  );
};
