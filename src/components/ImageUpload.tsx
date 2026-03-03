import React from "react";
import { siteConfig } from "../siteConfig";
import Image from "next/image";
import { toBase64 } from "../lib/toBase64";
import { Loading } from "./Loading";
import { env } from "../env/client.mjs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const ImageUpload = ({
  onUploadSuccess,
  children,
  id,
  setUploading,
}: {
  onUploadSuccess: (publicId: string) => void;
  children: React.ReactNode;
  id: string;
  setUploading: (uploading: boolean) => void;
}) => {
  const [file, setFile] = React.useState<File | null>(null);
  const [previewImage, setPreviewImage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<"idle" | "uploading">("idle");
  const [publicId, setPublicId] = React.useState<string | null>(null);
  const formRef = React.useRef<HTMLFormElement>(null);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const nextFile = e.target.files?.[0];
    if (nextFile) {
      setFile(nextFile);
      const base64Image = await toBase64(nextFile);
      setPreviewImage(base64Image);
    }
  };

  const handleUpload = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError(null);
    setStatus("uploading");
    setUploading(true);
    try {
      if (!file) {
        setStatus("idle");
        setUploading(false);
        setError("You must select a photo to upload");
        return;
      }
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "upload_preset",
        env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
      );
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${siteConfig.cloudinaryCloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await res.json();
      formRef.current?.reset();
      setStatus("idle");
      setUploading(false);
      setPublicId(data.public_id);
      onUploadSuccess(data.public_id);
      setPreviewImage(null);
    } catch (err) {
      console.error(err);
      setStatus("idle");
      setUploading(false);
      setError("Something went wrong. Try again later.");
    }
  };

  const handleClear = () => {
    setFile(null);
    setPreviewImage(null);
    setError(null);
    setStatus("idle");
    setUploading(false);
    formRef.current?.reset();
  };

  const isUploading = status === "uploading";
  const isUploaded = Boolean(publicId);

  return (
    <>
      {isUploading || isUploaded ? (
        <div className="relative grid place-items-start">
          {previewImage && (
            <Image
              src={previewImage}
              width={300}
              height={300}
              style={{ objectFit: "cover" }}
              alt="wing image"
            />
          )}
          {isUploading && (
            <div className="absolute inset-0 grid place-items-center bg-background/40">
              <Loading />
            </div>
          )}
        </div>
      ) : (
        <form ref={formRef} onSubmit={handleUpload} className="grid gap-2">
          <label htmlFor={id}>{children}</label>
          <input
            id={id}
            type="file"
            accept="image/*"
            name="fileInput"
            multiple={false}
            onChange={onFileChange}
            hidden
          />
        </form>
      )}

      <Dialog
        open={Boolean(previewImage)}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            handleClear();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Preview</DialogTitle>
          </DialogHeader>
          <div className="grid justify-center">
            {previewImage && (
              <Image
                src={previewImage}
                width={300}
                height={300}
                style={{ objectFit: "cover" }}
                alt="wing image"
              />
            )}
            {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter className="sm:justify-center">
            <Button onClick={handleClear} type="button" variant="outline">
              Try Again
            </Button>
            <Button type="button" onClick={handleUpload}>
              Looks Good!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
