import React, { useCallback, useEffect, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Loader, RotateCw, ZoomIn, ZoomOut } from "lucide-react";
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
import { getCroppedImage } from "@/utils/cropImage";

interface ImageCropDialogProps {
  // the picked image; the dialog is open while this is set
  file: File | null;
  onCancel: () => void;
  onCropped: (file: File) => void;
}

// LinkedIn / Udemy style photo editor: drag to position, zoom and straighten,
// inside a circular guide. Saves a square image.
const ImageCropDialog: React.FC<ImageCropDialogProps> = ({
  file,
  onCancel,
  onCropped,
}) => {
  const [src, setSrc] = useState<string>("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [area, setArea] = useState<Area | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  // turn the picked file into a URL, and reset the editor for each new image
  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setSrc(url);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setArea(null);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setArea(pixels);
  }, []);

  const save = async () => {
    if (!area || !src) return;
    try {
      setSaving(true);
      onCropped(await getCroppedImage(src, area, rotation));
    } catch (error) {
      console.error("ERROR! cropping image: ", error);
      toast.error("Could not crop this image. Please try another one.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={Boolean(file)} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-lg gap-0 p-0">
        <DialogHeader className="p-5 pb-3">
          <DialogTitle>Edit your photo</DialogTitle>
          <DialogDescription>
            Drag to reposition. Use the sliders to zoom and straighten.
          </DialogDescription>
        </DialogHeader>

        <div className="relative h-72 w-full bg-black sm:h-80">
          {src && (
            <Cropper
              image={src}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
              onCropComplete={onCropComplete}
            />
          )}
        </div>

        <div className="space-y-4 px-5 py-4">
          <div className="flex items-center gap-3">
            <ZoomOut className="size-4 shrink-0 text-muted-foreground" />
            <input
              type="range"
              aria-label="Zoom"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="h-1.5 w-full cursor-pointer accent-red-500"
            />
            <ZoomIn className="size-4 shrink-0 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-3">
            <RotateCw className="size-4 shrink-0 text-muted-foreground" />
            <input
              type="range"
              aria-label="Straighten"
              min={-45}
              max={45}
              step={1}
              value={rotation}
              onChange={(e) => setRotation(Number(e.target.value))}
              className="h-1.5 w-full cursor-pointer accent-red-500"
            />
            <span className="w-10 shrink-0 text-right text-xs text-muted-foreground">
              {rotation}°
            </span>
          </div>
        </div>

        <DialogFooter className="border-t p-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" onClick={save} disabled={!area || saving}>
            {saving ? (
              <>
                <Loader className="size-4 animate-spin" /> Saving...
              </>
            ) : (
              "Save photo"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImageCropDialog;
