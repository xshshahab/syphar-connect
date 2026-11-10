import React from "react";
import { useSelector } from "react-redux";
import {
  ExternalLink,
  FileText,
  Mail,
  PencilLine,
  Phone,
  Plus,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { RootState } from "@/redux/store";
import logoMark from "@/assets/logo-mark.png";

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
    {children}
  </h2>
);

interface ProfileHeroProps {
  onEdit: () => void;
}

// One card with everything about the user: identity, contact, resume, skills
const ProfileHero: React.FC<ProfileHeroProps> = ({ onEdit }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const isStudent = user?.role !== "recruiter";
  const skills = (user?.profile?.skills ?? []).filter(Boolean);
  const resume = user?.profile?.resume;

  return (
    <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      {/* cover */}
      <div className="relative h-28 overflow-hidden bg-gradient-to-r from-red-500/30 via-rose-500/10 to-transparent sm:h-36">
        <div className="absolute -left-10 -top-16 size-56 rounded-full bg-red-500/20 blur-3xl" />
        <img
          src={logoMark}
          alt=""
          aria-hidden
          className="absolute -right-6 -top-6 h-52 w-auto opacity-[0.06] invert dark:invert-0"
        />
      </div>

      <div className="px-5 pb-6 sm:px-8">
        {/* avatar + actions */}
        <div className="-mt-12 flex items-end justify-between gap-3 sm:-mt-16">
          <Avatar className="size-24 ring-4 ring-card sm:size-32">
            <AvatarImage src={user?.profile?.profilePhoto} />
            <AvatarFallback className="text-2xl">
              {user?.fullName?.slice(0, 2).toUpperCase() || "N/A"}
            </AvatarFallback>
          </Avatar>
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={onEdit}
          >
            <PencilLine className="size-4" /> Edit profile
          </Button>
        </div>

        {/* identity */}
        <div className="mt-4 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold sm:text-3xl">
              {user?.fullName || ""}
            </h1>
            <Badge variant="secondary" className="capitalize">
              {user?.role}
            </Badge>
          </div>
          <p className="max-w-2xl text-muted-foreground">
            {user?.profile?.bio || (
              <button
                type="button"
                onClick={onEdit}
                className="cursor-pointer underline-offset-4 hover:underline"
              >
                Add a short bio so people know who you are
              </button>
            )}
          </p>
        </div>

        {/* details */}
        <div className="mt-6 grid gap-6 border-t pt-6 md:grid-cols-2">
          <div className="space-y-3">
            <Label>Contact</Label>
            <ul className="space-y-2.5">
              <li className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Mail className="size-4 text-muted-foreground" />
                </span>
                <span className="min-w-0 break-all">{user?.email || "—"}</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Phone className="size-4 text-muted-foreground" />
                </span>
                <span>{user?.phoneNumber || "—"}</span>
              </li>
            </ul>
          </div>

          {isStudent && (
            <div className="space-y-3">
              <Label>Resume</Label>
              {resume ? (
                <a
                  href={resume}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-500/10">
                    <FileText className="size-4 text-red-500" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">
                      {user?.profile?.resumeOriginalName || "Resume"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Click to open
                    </span>
                  </span>
                  <ExternalLink className="size-4 text-muted-foreground" />
                </a>
              ) : (
                <button
                  type="button"
                  onClick={onEdit}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-lg border border-dashed p-3 text-left transition-colors hover:bg-accent"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Plus className="size-4 text-muted-foreground" />
                  </span>
                  <span>
                    <span className="block font-medium">Add your resume</span>
                    <span className="text-xs text-muted-foreground">
                      Upload a PDF so recruiters can review it
                    </span>
                  </span>
                </button>
              )}
            </div>
          )}

          {isStudent && (
            <div className="space-y-3 md:col-span-2">
              <Label>Skills</Label>
              {skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="outline"
                      className="rounded-full px-3 py-1 text-sm font-normal"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onEdit}
                  className="cursor-pointer text-sm text-muted-foreground underline-offset-4 hover:underline"
                >
                  No skills added yet — add your skills
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProfileHero;
