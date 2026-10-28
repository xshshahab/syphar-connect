import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import UpdateProfile from "./components/UpdateProfile";
import SavedJobs from "./components/SavedJobs";
import ProfileHero from "./components/ProfileHero";

const StudentProfile: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <div className="mx-auto my-6 flex w-full max-w-5xl flex-col gap-6 px-4">
      <ProfileHero onEdit={() => setOpen(true)} />

      <Card className="p-5 sm:p-6">
        <SavedJobs />
      </Card>

      {open && <UpdateProfile open={open} onClose={setOpen} />}
    </div>
  );
};

export default StudentProfile;
