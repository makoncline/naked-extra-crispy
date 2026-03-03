import React from "react";
import Image from "next/image";
import ReactCrop, {
  type PercentCrop,
  type PixelCrop,
  centerCrop,
  makeAspectCrop,
} from "react-image-crop";
import { siteConfig } from "../siteConfig";
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

type ImageUploadStatus = "idle" | "uploading";
type ButtonProps = React.ComponentProps<typeof Button>;

type ImageUploadRootProps = {
  children: React.ReactNode;
  id: string;
  onUploadSuccess: (publicId: string) => void;
  setUploading: (uploading: boolean) => void;
};

type ImageUploadButtonProps = Omit<ButtonProps, "type"> & {
  children?: React.ReactNode;
};

type ImageUploadContextValue = {
  id: string;
  crop: PercentCrop | undefined;
  error: string | null;
  sourceImage: string | null;
  uploadedPreviewImage: string | null;
  isUploaded: boolean;
  isUploading: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  imageRef: React.RefObject<HTMLImageElement | null>;
  setCrop: (nextCrop: PercentCrop) => void;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onImageLoad: (event: React.SyntheticEvent<HTMLImageElement>) => void;
  clear: () => void;
  upload: () => Promise<void>;
};

const ImageUploadContext = React.createContext<ImageUploadContextValue | null>(
  null
);

const useImageUploadContext = () => {
  const context = React.useContext(ImageUploadContext);
  if (!context) {
    throw new Error("ImageUpload compound components must be inside ImageUpload");
  }
  return context;
};

const toPixelCrop = (
  crop: PercentCrop,
  image: HTMLImageElement
): PixelCrop => ({
  unit: "px",
  x: (crop.x / 100) * image.width,
  y: (crop.y / 100) * image.height,
  width: (crop.width / 100) * image.width,
  height: (crop.height / 100) * image.height,
});

const getInitialCrop = (
  naturalWidth: number,
  naturalHeight: number
): PercentCrop =>
  centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      1,
      naturalWidth,
      naturalHeight
    ),
    naturalWidth,
    naturalHeight
  );

const getCroppedBlob = async (
  image: HTMLImageElement,
  crop: PercentCrop,
  mimeType: string
): Promise<Blob> => {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Missing 2D context");
  }

  const pixelCrop = toPixelCrop(crop, image);
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  canvas.width = Math.floor(pixelCrop.width * scaleX);
  canvas.height = Math.floor(pixelCrop.height * scaleY);

  context.drawImage(
    image,
    pixelCrop.x * scaleX,
    pixelCrop.y * scaleY,
    pixelCrop.width * scaleX,
    pixelCrop.height * scaleY,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Canvas output is empty"));
          return;
        }
        resolve(blob);
      },
      mimeType,
      1
    );
  });
};

const ImageUploadRoot = ({
  children,
  id,
  onUploadSuccess,
  setUploading,
}: ImageUploadRootProps) => {
  const [status, setStatus] = React.useState<ImageUploadStatus>("idle");
  const [error, setError] = React.useState<string | null>(null);
  const [file, setFile] = React.useState<File | null>(null);
  const [sourceImage, setSourceImage] = React.useState<string | null>(null);
  const [uploadedPreviewImage, setUploadedPreviewImage] = React.useState<
    string | null
  >(null);
  const [publicId, setPublicId] = React.useState<string | null>(null);
  const [crop, setCrop] = React.useState<PercentCrop>();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const imageRef = React.useRef<HTMLImageElement>(null);

  const isUploading = status === "uploading";
  const isUploaded = Boolean(publicId);

  const clear = React.useCallback(() => {
    setFile(null);
    setSourceImage(null);
    setCrop(undefined);
    setError(null);
    setStatus("idle");
    setUploading(false);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, [setUploading]);

  const onFileChange = React.useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      setError(null);
      const nextFile = event.target.files?.[0];
      if (!nextFile) {
        return;
      }

      setPublicId(null);
      setUploadedPreviewImage(null);
      setFile(nextFile);
      setCrop(undefined);
      setSourceImage(await toBase64(nextFile));
    },
    []
  );

  const onImageLoad = React.useCallback(
    (event: React.SyntheticEvent<HTMLImageElement>) => {
      const { naturalWidth, naturalHeight } = event.currentTarget;
      setCrop(getInitialCrop(naturalWidth, naturalHeight));
    },
    []
  );

  const upload = React.useCallback(async () => {
    if (status === "uploading") {
      return;
    }

    setError(null);
    setStatus("uploading");
    setUploading(true);

    try {
      if (!file) {
        throw new Error("You must select a photo to upload");
      }

      let fileToUpload = file;
      if (imageRef.current && crop) {
        const croppedBlob = await getCroppedBlob(
          imageRef.current,
          crop,
          file.type || "image/jpeg"
        );

        fileToUpload = new File([croppedBlob], file.name || "upload.jpg", {
          type: croppedBlob.type || file.type || "image/jpeg",
        });
      }

      const formData = new FormData();
      formData.append("file", fileToUpload);
      formData.append(
        "upload_preset",
        env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
      );
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${siteConfig.cloudinaryCloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Cloudinary upload failed");
      }

      const data = (await response.json()) as { public_id?: string };
      if (!data.public_id) {
        throw new Error("Upload response missing public ID");
      }

      setUploadedPreviewImage(await toBase64(fileToUpload));
      setPublicId(data.public_id);
      setSourceImage(null);
      setFile(null);
      setCrop(undefined);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      onUploadSuccess(data.public_id);
    } catch (error) {
      console.error(error);
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Try again later."
      );
    } finally {
      setStatus("idle");
      setUploading(false);
    }
  }, [crop, file, onUploadSuccess, setUploading, status]);

  const context = React.useMemo<ImageUploadContextValue>(
    () => ({
      id,
      crop,
      error,
      sourceImage,
      uploadedPreviewImage,
      isUploaded,
      isUploading,
      inputRef,
      imageRef,
      setCrop,
      onFileChange,
      onImageLoad,
      clear,
      upload,
    }),
    [
      clear,
      crop,
      error,
      id,
      isUploaded,
      isUploading,
      onFileChange,
      onImageLoad,
      sourceImage,
      upload,
      uploadedPreviewImage,
    ]
  );

  return (
    <ImageUploadContext.Provider value={context}>
      {children}
    </ImageUploadContext.Provider>
  );
};

const ImageUploadIdle = ({ children }: { children: React.ReactNode }) => {
  const { sourceImage, isUploading, isUploaded } = useImageUploadContext();
  if (sourceImage || isUploading || isUploaded) {
    return null;
  }
  return <>{children}</>;
};

const ImageUploadInput = () => {
  const { id, inputRef, onFileChange } = useImageUploadContext();
  return (
    <input
      ref={inputRef}
      id={id}
      type="file"
      accept="image/*"
      name="fileInput"
      multiple={false}
      onChange={(event) => void onFileChange(event)}
      hidden
    />
  );
};

const ImageUploadTrigger = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const { id } = useImageUploadContext();
  return (
    <label htmlFor={id} className={className}>
      {children}
    </label>
  );
};

const ImageUploadPreview = () => {
  const { sourceImage, uploadedPreviewImage, isUploading, isUploaded } =
    useImageUploadContext();
  const previewImage = isUploading ? sourceImage : uploadedPreviewImage;

  if (!previewImage || (!isUploading && !isUploaded)) {
    return null;
  }

  return (
    <div className="relative grid place-items-start">
      <Image
        src={previewImage}
        width={300}
        height={300}
        style={{ objectFit: "cover" }}
        alt="wing image"
      />
      {isUploading && (
        <div className="absolute inset-0 grid place-items-center bg-background/40">
          <Loading />
        </div>
      )}
    </div>
  );
};

const ImageUploadDialog = ({
  children,
  title = "Upload Preview",
}: {
  children: React.ReactNode;
  title?: string;
}) => {
  const { sourceImage, clear } = useImageUploadContext();
  return (
    <Dialog
      open={Boolean(sourceImage)}
      onOpenChange={(open) => {
        if (!open) {
          clear();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
};

const ImageUploadCrop = () => {
  const { sourceImage, crop, setCrop, onImageLoad, imageRef, isUploading } =
    useImageUploadContext();

  if (!sourceImage) {
    return null;
  }

  return (
    <div className="grid justify-center">
      <ReactCrop
        crop={crop}
        onChange={(_, nextCrop) => {
          if (!isUploading) {
            setCrop(nextCrop);
          }
        }}
        aspect={1}
        keepSelection
        minWidth={40}
        minHeight={40}
        className={isUploading ? "pointer-events-none opacity-60" : ""}
      >
        <Image
          ref={imageRef}
          src={sourceImage}
          alt="Crop preview"
          onLoad={onImageLoad}
          className="block max-h-[70vh] w-full object-contain"
          width={1920}
          height={1080}
          unoptimized
        />
      </ReactCrop>
    </div>
  );
};

const ImageUploadError = () => {
  const { error } = useImageUploadContext();
  if (!error) {
    return null;
  }
  return <p className="mt-2 text-sm text-destructive">{error}</p>;
};

const ImageUploadClearButton = ({
  children = "Try Again",
  onClick,
  disabled,
  ...props
}: ImageUploadButtonProps) => {
  const { clear, isUploading } = useImageUploadContext();
  return (
    <Button
      {...props}
      type="button"
      variant="outline"
      disabled={isUploading || disabled}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          clear();
        }
      }}
    >
      {children}
    </Button>
  );
};

const ImageUploadSaveButton = ({
  children = "Looks Good!",
  onClick,
  disabled,
  ...props
}: ImageUploadButtonProps) => {
  const { upload, isUploading } = useImageUploadContext();
  return (
    <Button
      {...props}
      type="button"
      disabled={isUploading || disabled}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          void upload();
        }
      }}
    >
      {children}
    </Button>
  );
};

const ImageUploadActions = ({
  clearLabel = "Try Again",
  saveLabel = "Looks Good!",
}: {
  clearLabel?: string;
  saveLabel?: string;
}) => {
  return (
    <DialogFooter className="sm:justify-center">
      <ImageUploadClearButton>{clearLabel}</ImageUploadClearButton>
      <ImageUploadSaveButton>{saveLabel}</ImageUploadSaveButton>
    </DialogFooter>
  );
};

export const ImageUpload = Object.assign(ImageUploadRoot, {
  Root: ImageUploadRoot,
  Idle: ImageUploadIdle,
  Input: ImageUploadInput,
  Trigger: ImageUploadTrigger,
  Preview: ImageUploadPreview,
  Dialog: ImageUploadDialog,
  Crop: ImageUploadCrop,
  Error: ImageUploadError,
  ClearButton: ImageUploadClearButton,
  SaveButton: ImageUploadSaveButton,
  Actions: ImageUploadActions,
});
