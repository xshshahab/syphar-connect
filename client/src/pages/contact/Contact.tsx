import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useState } from "react";

const Contact: React.FC = () => {
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  const submitFormHandler = (e: any) => {
    e.preventDefault();
  };

  return (
    <div className="my-2 p-4 w-full border rounded-lg flex">
      <div className="w-1/2"></div>
      <form
        onSubmit={submitFormHandler}
        className="w-1/2 grid grid-cols-2 gap-2"
      >
        <div className="flex gap-2 w-full flex-col">
          <Label htmlFor="fullName">FullName</Label>
          <Input
            type="text"
            id="fullName"
            name="fullName"
            required
            placeholder="Enter you fullname"
            className=""
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full flex-col">
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            id="email"
            name="email"
            required
            placeholder="Enter you email"
            className=""
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full flex-col">
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            id="email"
            name="email"
            required
            placeholder="Enter you email"
            className=""
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </form>
    </div>
  );
};

export default Contact;
