import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Contact, Edit3, Mail } from "lucide-react";
import { AppliedJobTable } from "./components/AppliedJobTable";
import UpdateProfile from "./components/UpdateProfile";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { useGetAppliedJobs } from "@/hooks/useGetAppliedJobs";

const Profile: React.FC = () => {
  useGetAppliedJobs();
  const [open, setOpen] = useState<boolean>(false);
  const { user } = useSelector((state: RootState) => state.auth);
  const isResume: boolean = true;

  return (
    <div className="my-5 flex flex-col gap-3">
      <Card className="p-4">
        <div
          className="flex p-3 justify-between gap-4 w-full
         max-w-5xl mx-auto border shadow rounded-xl"
        >
          <div className="flex items-center gap-4">
            <Avatar className="size-28">
              <AvatarImage src={user?.profile.profilePhoto} />
              <AvatarFallback>
                {user?.fullName.slice(0, 2).toUpperCase() || "N/A"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl mb-2 font-semibold">
                {user?.fullName || ""}
              </h1>
              <div>
                <p className="text-base text-zinc-500">
                  {user?.profile?.bio || ""}
                </p>
              </div>
            </div>
          </div>
          <Button
            onClick={() => setOpen(!open)}
            size={"icon"}
            variant={"outline"}
          >
            <Edit3 />
          </Button>
        </div>
        <div className="mx-auto max-w-5xl w-full">
          <Card>
            <CardContent>
              <div className="flex w-full gap-4">
                <div className="w-1/2">
                  <h1 className="text-lg mb-4 font-semibold">Details</h1>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Mail size={17} className="mt-0.5 text-gray-500" />
                      <h2>{user?.email || ""}</h2>
                    </div>
                    <div className="flex items-center gap-2">
                      <Contact size={17} className="mt-0.5 text-gray-500" />
                      <h2>{user?.phoneNumber || ""}</h2>
                    </div>
                  </div>
                </div>

                <section className="flex flex-col gap-2">
                  <div>
                    <h1 className="text-lg mb-2 font-semibold">Skills</h1>
                    <div>
                      {(user?.profile?.skills ?? []).length === 0 ? (
                        <div>No Skills Found</div>
                      ) : (
                        <div className="flex items-center gap-2">
                          {(user?.profile?.skills ?? []).map((skill) => (
                            <Badge key={skill}>{skill}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h1 className="text-lg mb-1 font-semibold">Resume</h1>
                    <div>
                      {isResume ? (
                        <a
                          className="text-md"
                          href={user?.profile?.resume || ""}
                          target="_blank"
                        >
                          {user?.profile?.resumeOriginalName || "N/A"}
                        </a>
                      ) : (
                        <span>No Resume</span>
                      )}
                    </div>
                  </div>
                </section>
              </div>
            </CardContent>
          </Card>
        </div>
      </Card>

      <Card className="p-4">
        <section className="max-w-5xl mx-auto w-full">
          <h1 className="text-lg font-semibold mb-2">Applied Jobs</h1>
          <AppliedJobTable />
        </section>
      </Card>

      {open && <UpdateProfile open={open} onClose={setOpen} />}
    </div>
  );
};

export default Profile;
