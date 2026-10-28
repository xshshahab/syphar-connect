import type { Area } from "react-easy-crop";

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not load the image"));
    image.src = src;
  });

// Renders the selected square area (after rotation) to a JPEG file.
export const getCroppedImage = async (
  src: string,
  area: Area,
  rotation = 0,
  maxSize = 512
): Promise<File> => {
  const image = await loadImage(src);

  // draw the rotated image onto a canvas big enough to hold it
  const rad = (rotation * Math.PI) / 180;
  const sin = Math.abs(Math.sin(rad));
  const cos = Math.abs(Math.cos(rad));
  const rotated = document.createElement("canvas");
  rotated.width = image.width * cos + image.height * sin;
  rotated.height = image.width * sin + image.height * cos;
  const rotatedCtx = rotated.getContext("2d")!;
  rotatedCtx.translate(rotated.width / 2, rotated.height / 2);
  rotatedCtx.rotate(rad);
  rotatedCtx.drawImage(image, -image.width / 2, -image.height / 2);

  // copy the chosen area into the final square canvas
  const size = Math.min(maxSize, Math.round(area.width));
  const output = document.createElement("canvas");
  output.width = size;
  output.height = size;
  const ctx = output.getContext("2d")!;
  ctx.fillStyle = "#ffffff"; // JPEG has no transparency
  ctx.fillRect(0, 0, size, size);
  ctx.drawImage(
    rotated,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    size,
    size
  );

  const blob = await new Promise<Blob | null>((resolve) =>
    output.toBlob(resolve, "image/jpeg", 0.92)
  );
  if (!blob) throw new Error("Could not export the cropped image");
  return new File([blob], "profile-photo.jpg", { type: "image/jpeg" });
};
