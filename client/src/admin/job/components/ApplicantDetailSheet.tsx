import React from "react";
import {
  CalendarDays,
  Check,
  ExternalLink,
  FileText,
  Mail,
  Phone,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Application } from "@/redux/slice/applicationSlice";
import StatusBadge from "@/shared/StatusBadge";
import { useUpdateApplicationStatus } from "@/hooks/useUpdateApplicationStatus";

interface ApplicantDetailSheetProps {
  application: Application | null;
  jobTitle?: string;
  onClose: () => void;
}

const Heading: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
    {children}
  </h3>
);

// Everything about one applicant, with Accept / Reject at the bottom
const ApplicantDetailSheet: React.FC<ApplicantDetailSheetProps> = ({
  application,
  jobTitle,
  onClose,
}) => {
  const updateStatus = useUpdateApplicationStatus();
  const [saving, setSaving] = React.useState<boolean>(false);

  const applicant = application?.applicant;
  const skills = (applicant?.profile?.skills ?? []).filter(Boolean);
  const resume = applicant?.profile?.resume;

  const change = async (status: "ACCEPTED" | "REJECTED") => {
    if (!application) return;
    setSaving(true);
    await updateStatus(application._id, status);
    setSaving(false);
  };

  return (
    <Sheet open={Boolean(application)} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
        {application && applicant && (
          <>
            <SheetHeader className="border-b p-6 pr-12">
              <div className="flex items-center gap-4">
                <Avatar className="size-16">
                  <AvatarImage src={applicant.profile?.profilePhoto} />
                  <AvatarFallback className="text-lg">
                    {applicant.fullName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <SheetTitle className="truncate text-xl">
                    {applicant.fullName}
                  </SheetTitle>
                  <SheetDescription className="mt-1 flex flex-wrap items-center gap-2">
                    <StatusBadge status={application.status} />
                    {jobTitle && <span>Applied for {jobTitle}</span>}
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <div className="flex-1 space-y-6 overflow-y-auto p-6">
              <section className="space-y-3">
                <Heading>Contact</Heading>
                <a
                  href={`mailto:${applicant.email}`}
                  className="flex items-center gap-3 hover:underline"
                >
                  <Mail className="size-4 text-muted-foreground" />
                  <span className="break-all">{applicant.email}</span>
                </a>
                <a
                  href={`tel:${applicant.phoneNumber}`}
                  className="flex items-center gap-3 hover:underline"
                >
                  <Phone className="size-4 text-muted-foreground" />
                  {applicant.phoneNumber}
                </a>
                <p className="flex items-center gap-3 text-sm text-muted-foreground">
                  <CalendarDays className="size-4" />
                  Applied on {application.createdAt.split("T")[0]}
                </p>
              </section>

              <section className="space-y-2">
                <Heading>About</Heading>
                <p className="text-sm leading-relaxed">
                  {applicant.profile?.bio || (
                    <span className="text-muted-foreground">
                      This applicant has not added a bio.
                    </span>
                  )}
                </p>
              </section>

              <section className="space-y-2">
                <Heading>Skills</Heading>
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
                  <p className="text-sm text-muted-foreground">
                    No skills listed.
                  </p>
                )}
              </section>

              <section className="space-y-2">
                <Heading>Resume</Heading>
                {resume ? (
                  <a
                    href={resume}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-500/10">
                      <FileText className="size-4 text-red-500" />
                    </span>
                    <span className="min-w-0 flex-1 truncate font-medium">
                      {applicant.profile?.resumeOriginalName || "Resume"}
                    </span>
                    <ExternalLink className="size-4 text-muted-foreground" />
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No resume uploaded.
                  </p>
                )}
              </section>
            </div>

            <div className="flex gap-3 border-t p-4">
              <Button
                variant="outline"
                className="flex-1 cursor-pointer border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900 dark:hover:bg-red-950"
                disabled={saving || application.status === "REJECTED"}
                onClick={() => change("REJECTED")}
              >
                <X className="size-4" />
                {application.status === "REJECTED" ? "Rejected" : "Reject"}
              </Button>
              <Button
                className="flex-1 cursor-pointer bg-emerald-600 text-white hover:bg-emerald-700"
                disabled={saving || application.status === "ACCEPTED"}
                onClick={() => change("ACCEPTED")}
              >
                <Check className="size-4" />
                {application.status === "ACCEPTED" ? "Accepted" : "Accept"}
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default ApplicantDetailSheet;
