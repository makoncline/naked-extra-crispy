import React from "react";
import { siteConfig } from "../siteConfig";
import { Error } from "../styles/text";
import { Spinner } from "./Spiner";
import Image from "next/image";
import { center, col, row } from "../styles/utils";
import { toBase64 } from "../lib/toBase64";
import { Loading } from "./Loading";

export const ImageUpload = ({
  onUploadSuccess,
  children,
}: {
  onUploadSuccess: (publicId: string) => void;
  children: React.ReactNode;
}) => {
  const [file, setFile] = React.useState<File | null>(null);
  const [previewImage, setPreviewImage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<"idle" | "uploading">("idle");
  const [publicId, setPublicId] = React.useState<string | null>(null);
  const formRef = React.useRef<HTMLFormElement>(null);
  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      const base64Image = await toBase64(file);
      setPreviewImage(base64Image);
    } else {
    }
  };
  const handleUpload = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError(null);
    setStatus("uploading");
    try {
      if (!file) {
        setStatus("idle");
        setError("You must select a photo to upload");
        return;
      }
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", siteConfig.cloudinaryImageUploadPreset);
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
      setPublicId(data.public_id);
      onUploadSuccess(data.public_id);
    } catch (err) {
      console.error(err);
      setStatus("idle");
      setError("Something went wrong. Try again later.");
    }
  };
  const handleClear = () => {
    setFile(null);
    setPreviewImage(null);
    setError(null);
    setStatus("idle");
    formRef.current?.reset();
  };
  const isUploading = status === "uploading";
  return (
    <>
      {publicId ? (
        <div>
          <Image
            src={publicId}
            width={300}
            height={300}
            objectFit="cover"
            alt="wing image"
          />
        </div>
      ) : (
        <form
          ref={formRef}
          onSubmit={handleUpload}
          css={`
            ${col}
            align-items: flex-start;
          `}
        >
          {!file && (
            <label
              htmlFor="file"
              css={`
                width: 100%;
              `}
            >
              {children}
            </label>
          )}
          <input
            id="file"
            type="file"
            accept="image/*"
            name="fileInput"
            multiple={false}
            onChange={onFileChange}
            hidden
          />
          {previewImage && (
            <div
              css={`
                display: grid;
                place-items: center;
                & > * {
                  grid-area: 1/1;
                }
              `}
            >
              <div
                css={`
                  ${isUploading && `filter: grayscale(80%);`}
                `}
              >
                <Image
                  src={previewImage}
                  width={300}
                  height={300}
                  objectFit="cover"
                  alt="wing image"
                />
              </div>
              {isUploading && <Loading />}
            </div>
          )}
          {error && <Error>{error}</Error>}
          <div
            css={`
              ${row}
            `}
          >
            {previewImage && (
              <button
                onClick={handleClear}
                type="button"
                disabled={isUploading}
              >
                Try Again
              </button>
            )}
            {file && (
              <button type="submit" disabled={isUploading}>
                {isUploading ? <Spinner scale={0.3} /> : "Looks Good!"}
              </button>
            )}
          </div>
        </form>
      )}
    </>
  );
};
