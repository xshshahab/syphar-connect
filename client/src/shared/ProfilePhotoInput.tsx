import React, { useEffect, useRef, useState } from "react";
import { Camera, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import ImageCropDialog from "@/shared/ImageCropDialog";

interface ProfilePhotoInputProps {
  // the cropped photo chosen in this session (null = unchanged / none)
  value: File | null;
  onChange: (file: File | null) => void;
  // existing photo shown until a new one is picked
  currentUrl?: string;
  fallback?: string;
}

const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const ProfilePhotoInput: React.FC<ProfilePhotoInputProps> = ({
  value,
  onChange,
  currentUrl,
  fallback = "U",
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [picked, setPicked] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");

  // preview of the cropped result
  useEffect(() => {
    if (!value) return setPreview("");
    const url = URL.createObjectURL(value);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  const handlePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow picking the same file again
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      toast.error("Please choose a JPG, PNG, WEBP or GIF image.");
      return;
    }
    setPicked(file);
  };

  return (
    <div className="flex items-center gap-4">
      <Avatar className="size-16">
        <AvatarImage src={preview || currentUrl || ""} />
        <AvatarFallback>{fallback}</AvatarFallback>
      </Avatar>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="cursor-pointer"
          onClick={() => inputRef.current?.click()}
        >
          <Camera className="size-4" />
          {value || currentUrl ? "Change photo" : "Upload photo"}
        </Button>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="cursor-pointer text-muted-foreground"
            onClick={() => onChange(null)}
          >
            <Trash2 className="size-4" /> Remove
          </Button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        className="hidden"
        onChange={handlePick}
      />

      <ImageCropDialog
        file={picked}
        onCancel={() => setPicked(null)}
        onCropped={(file) => {
          onChange(file);
          setPicked(null);
        }}
      />
    </div>
  );
};

export default ProfilePhotoInput;
