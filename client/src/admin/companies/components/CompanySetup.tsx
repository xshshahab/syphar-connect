"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";

import { COMPANY_API_ENDPOINT } from "@/utils/constant";
import axios from "axios";
import { ArrowLeft, Upload, X } from "lucide-react";
import React, {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";

interface CompanyType {
  name: string;
  website: string;
  description: string;
  location: string;
  file: string | File | null;
  previewUrl: string | null;
}

const CompanySetup: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  // true while the company is being loaded into the form
  const [fetching, setFetching] = useState<boolean>(true);

  const params = useParams();
  const navigate = useNavigate();

  const [input, setInput] = useState<CompanyType>({
    name: "",
    website: "",
    description: "",
    location: "",
    file: null,
    previewUrl: null,
  });

  // Load this company straight from the server. Reading it from a list kept in
  // memory left the form empty for a company that was just registered.
  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        setFetching(true);
        const res = await axios.get(
          `${COMPANY_API_ENDPOINT}/company/${params.companyId}`,
          { withCredentials: true, signal: controller.signal }
        );
        if (res.data.success) {
          const company = res.data.company;
          setInput({
            name: company.name || "",
            website: company.website || "",
            description: company.description || "",
            location: company.location || "",
            file: company.logo || "",
            previewUrl: company.logo || "",
          });
        }
        setFetching(false);
      } catch (error) {
        if (axios.isCancel(error)) return;
        console.error("ERROR! loading company: ", error);
        toast.error("Could not load this company.");
        navigate("/admin/companies", { replace: true });
      }
    })();

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.companyId]);

  const inputChangeEventHandler = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const changeFileHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const preview = URL.createObjectURL(file);
      setInput({ ...input, file, previewUrl: preview });
    }
  };

  const removeFile = () => {
    setInput({ ...input, file: null, previewUrl: null });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (!input.name || !input.file) {
        toast.error("Please fill all required fields and upload a logo.");
        return;
      }

      const formData = new FormData();
      formData.append("name", input.name);
      formData.append("website", input.website);
      formData.append("description", input.description);
      formData.append("location", input.location);
      if (input.file) {
        formData.append("file", input.file);
      }

      const res = await axios.put(
        `${COMPANY_API_ENDPOINT}/company/update-company/${params.companyId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        toast.success(res.data.message);
        navigate("/admin/companies");
      }
    } catch (error: unknown) {
      console.error("ERROR! Setup Company: ", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else if (
        typeof error === "object" &&
        error !== null &&
        "response" in error
      ) {
        // @ts-ignore
        toast.error(error.response.data.message);
      } else {
        toast.error("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-6 md:px-10 md:py-10">
      {/* Header */}
      <div className="flex items-center  gap-3 mb-8">
        <Button onClick={() => navigate(-1)} variant="outline" size="sm">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <h1 className="text-2xl font-semibold ">Company Setup</h1>
      </div>

      {/* Form Section */}
      <section className="max-w-5xl mx-auto">
        {fetching ? (
          <div className="flex justify-center py-20">
            <Spinner className="size-6" />
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Grid layout */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Left side - Logo upload */}
            <div className="flex flex-col space-y-3">
              <Label>Company Logo</Label>

              <div className="w-40 h-40 border-2 border-dashed rounded-xl flex items-center justify-center relative hover:border-primary transition">
                {input.previewUrl ? (
                  <div className="relative w-full h-full">
                    <img
                      src={input.previewUrl}
                      alt="Company Logo"
                      className="object-cover w-full h-full rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={removeFile}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="companyLogo"
                    className="flex flex-col items-center justify-center cursor-pointer text-gray-500"
                  >
                    <Upload className="w-6 h-6 mb-1" />
                    <span className="text-sm">Upload Logo</span>
                    <Input
                      id="companyLogo"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={changeFileHandler}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Right side - Company name */}
            <div className="flex flex-col space-y-2">
              <Label htmlFor="name">Company Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., SypharConnect"
                value={input.name}
                onChange={inputChangeEventHandler}
              />
            </div>
          </div>

          {/* Website & Location grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="website">Website URL</Label>
              <Input
                id="website"
                name="website"
                type="url"
                placeholder="https://www.sypharconnect.com"
                value={input.website}
                onChange={inputChangeEventHandler}
              />
            </div>
            <div className="flex flex-col space-y-2">
              <Label htmlFor="location">Company Location</Label>
              <Input
                id="location"
                name="location"
                placeholder="e.g., Mumbai, India"
                value={input.location}
                onChange={inputChangeEventHandler}
              />
            </div>
          </div>
          {/* Description */}
          <div className="flex flex-col space-y-2">
            <Label htmlFor="description">Company Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe your company (industry, focus, etc.)"
              className="h-24"
              value={input.description}
              onChange={inputChangeEventHandler}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit">
              {loading ? (
                <div className="flex items-center gap-2">
                  <Spinner />
                  <span>Updating...</span>
                </div>
              ) : (
                "Update Company"
              )}
            </Button>
          </div>
        </form>
        )}
      </section>
    </div>
  );
};

export default CompanySetup;
