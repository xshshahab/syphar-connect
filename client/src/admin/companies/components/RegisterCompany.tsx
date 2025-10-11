"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setSingleCompany } from "@/redux/slice/companySlice";
import { COMPANY_API_ENDPOINT } from "@/utils/constant";
import axios from "axios";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { toast } from "sonner";

const RegisterCompany: React.FC = () => {
  const [companyName, setCompanyName] = useState<string>("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const registerNewCompany = async () => {
    try {
      if (!companyName.trim()) {
        toast.error("Please enter a company name.");
        return;
      }

      const website = `https://${companyName
        .toLowerCase()
        .replace(/\s+/g, "")}.com`;

      const res = await axios.post(
        `${COMPANY_API_ENDPOINT}/register-company`,
        { companyName, website: website },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (res?.data?.success) {
        dispatch(setSingleCompany(res.data.company));
        toast.success(res.data.message);
        const companyId = res?.data?.company?._id || "";
        navigate(`/admin/companies/${companyId}`);
      }
    } catch (error) {
      console.error("ERROR! Registering Company:", error);
    }
  };

  return (
    <div className="mt-10 h-screen w-full   px-6">
      <div className="">
        <h1 className="text-2xl font-semibold">Register Your Company</h1>
        <p className="mt-2 text-sm text-gray-500">
          Enter your company’s official name. You can update it later if needed.
        </p>

        <section className="mt-6 space-y-2">
          <Label htmlFor="company-name" className="text-sm font-medium">
            Company Name
          </Label>
          <Input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            id="company-name"
            name="company-name"
            type="text"
            placeholder="Enter your company name (e.g., Syphar Connect LLP)"
          />
        </section>

        <div className="mt-6 flex items-center gap-2">
          <Button onClick={() => navigate(-1)} variant="outline">
            Cancel
          </Button>
          <Button onClick={registerNewCompany}>Continue</Button>
        </div>
      </div>
    </div>
  );
};

export default RegisterCompany;
