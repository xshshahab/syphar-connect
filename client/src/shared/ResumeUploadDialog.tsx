import React, { useRef, useState } from "react";
import axios from "axios";
import { FileText, Loader, Upload } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { setUser } from "@/redux/slice/authSlice";
import type { RootState } from "@/redux/store";
import { USER_API_ENDPOINT } from "@/utils/constant";

interface ResumeUploadDialogProps {
  open: boolean;
  onClose: () => void;
  // called once the resume is saved, e.g. to continue applying
  onUploaded: () => void;
}

const MAX_SIZE = 5 * 1024 * 1024;

// Shown when someone tries to apply without a resume on their profile
const ResumeUploadDialog: React.FC<ResumeUploadDialogProps> = ({
  open,
  onClose,
  onUploaded,
}) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  const pick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0] ?? null;
    e.target.value = "";
    if (!picked) return;
    if (picked.type !== "application/pdf") {
      toast.error("Please choose a PDF file.");
      return;
    }
    if (picked.size > MAX_SIZE) {
      toast.error("The file is too large. Maximum size is 5 MB.");
      return;
    }
    setFile(picked);
  };

  const submit = async () => {
    if (!file || !user?._id) return;
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("file", file);
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
        toast.success("Resume uploaded");
        setFile(null);
        onUploaded();
      }
    } catch (error) {
      console.error("ERROR! uploading resume: ", error);
      toast.error(
        axios.isAxiosError(error)
          ? error.response?.data?.message || "Could not upload the resume"
          : "Could not upload the resume"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !saving) {
          setFile(null);
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add your resume to apply</DialogTitle>
          <DialogDescription>
            Recruiters review your resume with your application. Upload it once
            and it is saved to your profile for every job.
          </DialogDescription>
        </DialogHeader>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed p-8 text-center transition-colors hover:border-primary hover:bg-accent/40"
        >
          {file ? (
            <>
              <FileText className="size-8 text-red-500" />
              <span className="max-w-full truncate font-medium">{file.name}</span>
              <span className="text-xs text-muted-foreground">
                Click to choose a different file
              </span>
            </>
          ) : (
            <>
              <Upload className="size-8 text-muted-foreground" />
              <span className="font-medium">Choose your resume</span>
              <span className="text-xs text-muted-foreground">
                PDF only, up to 5 MB
              </span>
            </>
          )}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={pick}
        />

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={saving}
            onClick={() => {
              setFile(null);
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button type="button" disabled={!file || saving} onClick={submit}>
            {saving ? (
              <>
                <Loader className="size-4 animate-spin" /> Uploading...
              </>
            ) : (
              "Upload & apply"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ResumeUploadDialog;
