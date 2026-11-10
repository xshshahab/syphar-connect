import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import RichTextEditor from "@/shared/RichTextEditor";
import { useGetAllCompany } from "@/hooks/useGetAllCompany";
import type { RootState } from "@/redux/store";
import { JOB_API_ENDPOINT, JOB_TYPES } from "@/utils/constant";
import { htmlToText } from "@/utils/richText";
import axios from "axios";
import { ArrowLeft, Loader, X } from "lucide-react";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";

type FormState = {
  title: string;
  companyId: string;
  jobType: string;
  location: string;
  experience: string;
  salary: string;
  position: string;
  description: string;
  requirements: string[];
};

const initialState: FormState = {
  title: "",
  companyId: "",
  jobType: "",
  location: "",
  experience: "",
  salary: "",
  position: "1",
  description: "",
  requirements: [],
};

const Field: React.FC<{
  label: string;
  htmlFor: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}> = ({ label, htmlFor, hint, className, children }) => (
  <div className={`space-y-2 ${className ?? ""}`}>
    <Label htmlFor={htmlFor} className="text-sm font-medium">
      {label}
      <span className="text-red-500">*</span>
    </Label>
    {children}
    {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
  </div>
);

const Section: React.FC<{
  title: string;
  description: string;
  children: React.ReactNode;
}> = ({ title, description, children }) => (
  <section className="rounded-xl border p-5 md:p-6">
    <div className="mb-5">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
    {children}
  </section>
);

const PostNewJob: React.FC = () => {
  useGetAllCompany();

  const [form, setForm] = useState<FormState>(initialState);
  const [requirementInput, setRequirementInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const { allCompany } = useSelector((state: RootState) => state.company);
  const hasCompanies = Array.isArray(allCompany) && allCompany.length > 0;

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const addRequirements = (raw: string) => {
    const items = raw
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    if (items.length === 0) return;
    setForm((prev) => ({
      ...prev,
      requirements: [
        ...prev.requirements,
        ...items.filter(
          (item) =>
            !prev.requirements.some((r) => r.toLowerCase() === item.toLowerCase())
        ),
      ],
    }));
    setRequirementInput("");
  };

  const removeRequirement = (item: string) =>
    setField(
      "requirements",
      form.requirements.filter((r) => r !== item)
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.companyId) return toast.error("Please select a company.");
    if (!form.jobType) return toast.error("Please select a job type.");
    if (!htmlToText(form.description))
      return toast.error("Please add a job description.");

    // include a requirement that was typed but not yet added
    const requirements = [...form.requirements];
    const pending = requirementInput.trim();
    if (pending && !requirements.includes(pending)) requirements.push(pending);
    if (requirements.length === 0)
      return toast.error("Please add at least one requirement.");

    try {
      setLoading(true);
      const res = await axios.post(
        `${JOB_API_ENDPOINT}/create-job`,
        {
          title: form.title.trim(),
          companyId: form.companyId,
          jobType: form.jobType,
          location: form.location.trim(),
          experience: Number(form.experience),
          salary: Number(form.salary),
          position: Number(form.position),
          description: form.description,
          requirements,
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        toast.success(res?.data?.message);
        navigate("/admin/ad-jobs");
      }
    } catch (error: unknown) {
      console.error("ERROR! while submitting the new job: ", error);
      toast.error(
        axios.isAxiosError(error)
          ? error.response?.data?.message || "An unknown error occurred!"
          : "An unknown error occurred!"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto my-6 w-full max-w-4xl px-4">
      <Button asChild variant="ghost" size="sm" className="mb-3 -ml-2">
        <Link to="/admin/ad-jobs">
          <ArrowLeft className="mr-1 size-4" /> Back to jobs
        </Link>
      </Button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold md:text-3xl">Post a New Job</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a clear, detailed opening to attract the right candidates.
        </p>
      </div>

      {!hasCompanies && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          <span>Register a company before posting a job.</span>
          <Button asChild size="sm" variant="outline">
            <Link to="/admin/companies/register-company">Register company</Link>
          </Button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Section
          title="Basic information"
          description="What is the role and who is hiring?"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Job Title" htmlFor="title">
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setField("title", e.target.value)}
                placeholder="e.g., Senior Frontend Developer"
                required
              />
            </Field>

            <Field label="Company" htmlFor="company">
              <Select
                value={form.companyId}
                onValueChange={(value) => setField("companyId", value)}
                disabled={!hasCompanies}
              >
                <SelectTrigger id="company" className="w-full">
                  <SelectValue
                    placeholder={
                      hasCompanies ? "Select a company" : "No companies yet"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {allCompany?.map((company) => (
                    <SelectItem key={company._id} value={company._id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Job Type" htmlFor="jobType">
              <Select
                value={form.jobType}
                onValueChange={(value) => setField("jobType", value)}
              >
                <SelectTrigger id="jobType" className="w-full">
                  <SelectValue placeholder="Select job type" />
                </SelectTrigger>
                <SelectContent>
                  {JOB_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Location" htmlFor="location">
              <Input
                id="location"
                value={form.location}
                onChange={(e) => setField("location", e.target.value)}
                placeholder="e.g., Bangalore or Remote"
                required
              />
            </Field>
          </div>
        </Section>

        <Section
          title="Compensation & openings"
          description="Set the expected experience, pay and number of vacancies."
        >
          <div className="grid gap-5 md:grid-cols-3">
            <Field
              label="Experience (years)"
              htmlFor="experience"
              hint="Use 0 for freshers"
            >
              <Input
                id="experience"
                type="number"
                min="0"
                step="1"
                value={form.experience}
                onChange={(e) => setField("experience", e.target.value)}
                placeholder="e.g., 3"
                required
              />
            </Field>

            <Field
              label="Salary (LPA)"
              htmlFor="salary"
              hint="Lakhs per annum, e.g. 12 or 8.5"
            >
              <Input
                id="salary"
                type="number"
                min="0"
                step="0.5"
                value={form.salary}
                onChange={(e) => setField("salary", e.target.value)}
                placeholder="e.g., 12"
                required
              />
            </Field>

            <Field label="Open Positions" htmlFor="position">
              <Input
                id="position"
                type="number"
                min="1"
                step="1"
                value={form.position}
                onChange={(e) => setField("position", e.target.value)}
                required
              />
            </Field>
          </div>
        </Section>

        <Section
          title="Job description"
          description="Describe the role, responsibilities and what makes your team great."
        >
          <RichTextEditor
            id="description"
            value={form.description}
            onChange={(html) => setField("description", html)}
            placeholder="Write about the role, key responsibilities, benefits and your team..."
          />
        </Section>

        <Section
          title="Requirements"
          description="Add skills and qualifications. Press Enter or comma after each one."
        >
          <div className="space-y-3">
            <Input
              id="requirements"
              value={requirementInput}
              onChange={(e) => setRequirementInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  addRequirements(requirementInput);
                }
              }}
              onBlur={() => addRequirements(requirementInput)}
              placeholder="e.g., React, TypeScript, REST APIs"
            />
            {form.requirements.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.requirements.map((item) => (
                  <Badge key={item} variant="secondary" className="gap-1 pr-1">
                    {item}
                    <button
                      type="button"
                      aria-label={`Remove ${item}`}
                      onClick={() => removeRequirement(item)}
                      className="cursor-pointer rounded-full p-0.5 hover:bg-foreground/10"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </Section>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/admin/ad-jobs")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading || !hasCompanies}>
            {loading ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                Publishing...
              </>
            ) : (
              "Publish Job"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PostNewJob;
