import React, { useState, type ChangeEvent } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { toast } from "sonner";
import axios from "axios";
import { USER_API_ENDPOINT } from "@/utils/constant";
import { setUser } from "@/redux/slice/authSlice";

interface UpdateProfileProps {
  open: boolean;
  onClose: (open: boolean) => void;
}

const UpdateProfile: React.FC<UpdateProfileProps> = ({ open, onClose }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  const [inputValue, setInputValue] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    bio: user?.profile?.bio || "",
    skills: user?.profile?.skills || ([] as string[]),
    file: null as File | null,
  });

  const [loading, setLoading] = useState(false);

  // handle text inputs
  const changeEventHandler = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setInputValue((prev) => ({ ...prev, [name]: value }));
  };

  // handle file input

  const fileChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setInputValue((prev) => ({ ...prev, file }));
  };

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?._id) {
      toast.error("User not found. Please log in again.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("fullName", inputValue.fullName);
    formData.append("email", inputValue.email);
    formData.append("phoneNumber", inputValue.phoneNumber);
    formData.append("bio", inputValue.bio);
    formData.append("skills", inputValue.skills.join(","));
    if (inputValue.file) {
      formData.append("file", inputValue.file);
    }

    try {
      const res = await axios.put(
        `${USER_API_ENDPOINT}/profile/update-profile/${user._id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        dispatch(setUser(res.data.user));
        toast.success(res?.data?.message || "Profile updated successfully.");
        onClose(false);
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Something went wrong!");
      } else {
        toast.error("Unexpected error occurred.");
      }
      console.error("ERROR! UPDATE PROFILE: ", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Update Profile
          </DialogTitle>
          <DialogDescription>
            Keep your profile up-to-date so employers can find you easily.
          </DialogDescription>
        </DialogHeader>

        {/* FORM */}
        <form onSubmit={submitHandler} className="space-y-5 py-4">
          <div className="grid gap-3">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              value={inputValue.fullName}
              onChange={changeEventHandler}
              id="fullName"
              name="fullName"
              type="text"
            />
          </div>

          <div className="grid gap-3">
            <Label htmlFor="email">Email</Label>
            <Input
              value={inputValue.email}
              onChange={changeEventHandler}
              id="email"
              name="email"
              type="email"
            />
          </div>

          <div className="grid gap-3">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              value={inputValue.phoneNumber}
              onChange={changeEventHandler}
              id="phoneNumber"
              name="phoneNumber"
              type="text"
            />
          </div>

          <div className="grid gap-3">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              value={inputValue.bio}
              onChange={changeEventHandler}
              id="bio"
              name="bio"
              rows={3}
            />
          </div>

          <div className="grid gap-3">
            <Label htmlFor="skills">Skills (comma separated)</Label>
            <Input
              value={inputValue.skills.join(", ")}
              onChange={(e) =>
                setInputValue((prev) => ({
                  ...prev,
                  skills: e.target.value.split(",").map((s) => s.trim()),
                }))
              }
              id="skills"
              name="skills"
              type="text"
              placeholder="e.g. React, Node.js, Python"
            />
          </div>

          <div className="grid gap-3">
            <Label htmlFor="file">Resume</Label>
            <Input
              onChange={fileChangeHandler}
              id="file"
              name="file"
              type="file"
              accept="application/pdf"
            />
          </div>

          {/* Footer buttons */}
          <DialogFooter className="mt-6 flex justify-end gap-3">
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader className="h-5 w-5 animate-spin" />
                  <span>Updating...</span>
                </div>
              ) : (
                <span>Update</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateProfile;
