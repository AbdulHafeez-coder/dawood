import { useState, useRef } from "react";
import {
  UploadCloud,
  ImageIcon,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Star,
  Film,
  RotateCcw,
  Check,
  Plus,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  uploadProductImage,
  uploadProductVideo,
  ACCEPTED_IMAGE_TYPES,
  ACCEPTED_VIDEO_TYPES,
  MAX_IMAGE_BYTES,
  MAX_VIDEO_BYTES,
} from "@/lib/storage";
import { PRODUCT_IMAGE_CHOICES } from "@/lib/shop";

interface ProductMediaManagerProps {
  images: string[];
  onChangeImages: (images: string[]) => void;
  primaryImage: string;
  onSetPrimaryImage: (img: string) => void;
  video?: string | null;
  onChangeVideo: (video: string | null) => void;
  maxImages?: number;
}

export function ProductMediaManager({
  images,
  onChangeImages,
  primaryImage,
  onSetPrimaryImage,
  video,
  onChangeVideo,
  maxImages = 15,
}: ProductMediaManagerProps) {
  const [imageDragging, setImageDragging] = useState(false);
  const [videoDragging, setVideoDragging] = useState(false);
  const [uploadingImagesCount, setUploadingImagesCount] = useState(0);
  const [videoUploading, setVideoUploading] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoUrlInput, setVideoUrlInput] = useState("");
  const [showVideoUrlInput, setShowVideoUrlInput] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Normalize list to ensure primary is at index 0 if not empty
  const currentImages = images.filter(Boolean);

  // Handle uploading multiple image files
  async function handleImageFiles(files: FileList | File[] | null | undefined) {
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    const availableSlots = maxImages - currentImages.length;

    if (availableSlots <= 0) {
      toast.error(`Maximum image limit (${maxImages}) reached`, {
        description: "Remove some images before uploading new ones.",
      });
      return;
    }

    const filesToUpload = fileList.slice(0, availableSlots);
    if (fileList.length > availableSlots) {
      toast.info(`Uploading first ${availableSlots} images (maximum is ${maxImages})`);
    }

    // Validate files
    const validFiles: File[] = [];
    for (const file of filesToUpload) {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        toast.error(`"${file.name}" has unsupported format`, {
          description: "Use PNG, JPG, WEBP, GIF, SVG or AVIF.",
        });
        continue;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        toast.error(`"${file.name}" is too large`, {
          description: `Max ${(MAX_IMAGE_BYTES / 1024 / 1024).toFixed(0)} MB. Yours is ${(file.size / 1024 / 1024).toFixed(1)} MB.`,
        });
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setUploadingImagesCount((prev) => prev + validFiles.length);

    const newlyUploaded: string[] = [];
    for (const file of validFiles) {
      try {
        const url = await uploadProductImage(file);
        newlyUploaded.push(url);
        // Progressively append image as it finishes so user sees immediate results
        onChangeImages([...currentImages, ...newlyUploaded]);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Upload failed";
        toast.error(`Could not upload ${file.name}`, { description: msg });
      } finally {
        setUploadingImagesCount((prev) => Math.max(0, prev - 1));
      }
    }

    if (newlyUploaded.length > 0) {
      toast.success(
        `Added ${newlyUploaded.length} image${newlyUploaded.length > 1 ? "s" : ""} to product`,
      );
    }
  }

  // Remove single image
  function removeImage(index: number) {
    const target = currentImages[index];
    const next = currentImages.filter((_, i) => i !== index);
    onChangeImages(next);
    if (target === primaryImage && next.length > 0) {
      onSetPrimaryImage(next[0]);
    }
    toast.info("Image removed");
  }

  // Set image as cover (moves it to index 0)
  function makePrimary(index: number) {
    if (index === 0) return;
    const target = currentImages[index];
    const rest = currentImages.filter((_, i) => i !== index);
    const reordered = [target, ...rest];
    onChangeImages(reordered);
    onSetPrimaryImage(target);
    toast.success("Cover image updated");
  }

  // Move image left/up
  function moveLeft(index: number) {
    if (index <= 0) return;
    const reordered = [...currentImages];
    const temp = reordered[index - 1];
    reordered[index - 1] = reordered[index];
    reordered[index] = temp;
    onChangeImages(reordered);
    if (index - 1 === 0) {
      onSetPrimaryImage(reordered[0]);
    }
  }

  // Move image right/down
  function moveRight(index: number) {
    if (index >= currentImages.length - 1) return;
    const reordered = [...currentImages];
    const temp = reordered[index + 1];
    reordered[index + 1] = reordered[index];
    reordered[index] = temp;
    onChangeImages(reordered);
    if (index === 0) {
      onSetPrimaryImage(reordered[0]);
    }
  }

  // Add preset image to collection
  function addPreset(url: string) {
    if (currentImages.includes(url)) {
      toast.info("This preset is already in the gallery");
      return;
    }
    if (currentImages.length >= maxImages) {
      toast.error(`Maximum image limit (${maxImages}) reached`);
      return;
    }
    const next = [...currentImages, url];
    onChangeImages(next);
    toast.success("Preset added to gallery");
  }

  // Handle video upload
  async function handleVideoFile(file: File | undefined | null) {
    if (!file) return;

    if (!ACCEPTED_VIDEO_TYPES.includes(file.type)) {
      toast.error("Unsupported video format", {
        description: "Please upload an MP4, WebM, MOV, or OGG video file.",
      });
      return;
    }

    if (file.size > MAX_VIDEO_BYTES) {
      toast.error("Video file is too large", {
        description: `Maximum size is ${(MAX_VIDEO_BYTES / 1024 / 1024).toFixed(0)} MB. Your file is ${(file.size / 1024 / 1024).toFixed(1)} MB.`,
      });
      return;
    }

    setVideoUploading(true);
    setVideoProgress(0);

    try {
      const url = await uploadProductVideo(file, (frac) => {
        setVideoProgress(Math.round(frac * 100));
      });
      onChangeVideo(url);
      toast.success("Product video uploaded successfully!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Video upload failed";
      toast.error("Could not upload video", { description: msg });
    } finally {
      setVideoUploading(false);
      setVideoProgress(0);
    }
  }

  return (
    <div className="space-y-6">
      {/* -------------------- IMAGES SECTION -------------------- */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[12px] font-semibold text-black uppercase tracking-wider flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-black/70" />
              <span>Product Image Gallery</span>
            </div>
            <p className="text-[11px] text-black/55 mt-0.5">
              Upload multiple images (at least 10 supported). The first image is the primary store
              cover.
            </p>
          </div>
          <div className="text-[11px] font-medium px-2.5 py-1 bg-black/5 border border-black/10 rounded-full tabular-nums">
            {currentImages.length} / {maxImages} images
          </div>
        </div>

        {/* Dropzone & Multi-file picker */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setImageDragging(true);
          }}
          onDragLeave={() => setImageDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setImageDragging(false);
            handleImageFiles(e.dataTransfer.files);
          }}
          onClick={() => imageInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              imageInputRef.current?.click();
            }
          }}
          className={`rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition ${
            imageDragging
              ? "border-black bg-black/[0.04]"
              : "border-black/20 hover:border-black/50 hover:bg-black/[0.02]"
          }`}
        >
          <div className="flex flex-col items-center gap-2 text-black/70">
            {uploadingImagesCount > 0 ? (
              <div className="flex flex-col items-center gap-2 py-2">
                <Loader2 className="w-6 h-6 animate-spin text-black" />
                <div className="text-sm font-medium text-black">
                  Uploading {uploadingImagesCount} image{uploadingImagesCount > 1 ? "s" : ""}…
                </div>
                <div className="text-[11px] text-black/50">Adding directly to your gallery</div>
              </div>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-black/80">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div className="text-sm">
                  <span className="font-semibold text-black">Click to select images</span> or drag &
                  drop
                </div>
                <div className="text-[11px] text-black/50">
                  Select multiple files simultaneously • PNG, JPG, WEBP, GIF, SVG, AVIF • Up to 5 MB
                  each
                </div>
              </>
            )}
          </div>
          <input
            ref={imageInputRef}
            type="file"
            multiple
            accept={ACCEPTED_IMAGE_TYPES.join(",")}
            className="hidden"
            onChange={(e) => {
              handleImageFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>

        {/* Gallery Thumbnails Grid */}
        {currentImages.length > 0 && (
          <div className="space-y-2 pt-1">
            <div className="text-[10px] uppercase tracking-[0.16em] text-black/50 font-medium">
              Gallery Images ({currentImages.length}) — Click arrows to reorder, star to set as
              cover
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {currentImages.map((url, idx) => {
                const isPrimary = idx === 0 || url === primaryImage;
                return (
                  <div
                    key={`${url}-${idx}`}
                    className={`relative group rounded-xl overflow-hidden border-2 bg-black/[0.02] flex flex-col transition shadow-xs ${
                      isPrimary ? "border-black ring-2 ring-black/20" : "border-black/15"
                    }`}
                  >
                    {/* Image Preview */}
                    <div className="relative aspect-square w-full bg-[#f4f3ef] overflow-hidden">
                      <img
                        src={url}
                        alt={`Product image ${idx + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />

                      {/* Primary / Cover Badge */}
                      {isPrimary && (
                        <div className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-black text-white text-[9px] font-bold tracking-wider uppercase rounded shadow flex items-center gap-1 z-10">
                          <Star className="w-2.5 h-2.5 fill-white text-white" />
                          <span>Cover</span>
                        </div>
                      )}

                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(idx);
                        }}
                        className="absolute top-1.5 right-1.5 p-1 rounded-md bg-white/90 text-red-600 hover:bg-red-600 hover:text-white transition shadow opacity-90 hover:opacity-100 z-10 cursor-pointer"
                        title="Remove image"
                        aria-label={`Remove image ${idx + 1}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Hover overlay on desktop */}
                      {!isPrimary && (
                        <button
                          type="button"
                          onClick={() => makePrimary(idx)}
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-[10px] font-medium tracking-wide uppercase cursor-pointer"
                        >
                          <Star className="w-3 h-3 mr-1 fill-white" /> Set as Cover
                        </button>
                      )}
                    </div>

                    {/* Controls Footer */}
                    <div className="p-1.5 bg-white border-t border-black/10 flex items-center justify-between text-[11px]">
                      <span className="text-[10px] font-mono text-black/60 pl-1">#{idx + 1}</span>

                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveLeft(idx)}
                          className="p-1 rounded hover:bg-black/10 text-black/70 disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
                          title="Move earlier"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === currentImages.length - 1}
                          onClick={() => moveRight(idx)}
                          className="p-1 rounded hover:bg-black/10 text-black/70 disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
                          title="Move later"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Preset quick picks */}
        <div className="pt-2">
          <div className="text-[10px] uppercase tracking-[0.16em] text-black/45 mb-2 font-medium">
            Quick Preset Additions
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {PRODUCT_IMAGE_CHOICES.map((choice) => {
              const alreadyAdded = currentImages.includes(choice.url);
              return (
                <button
                  type="button"
                  key={choice.id}
                  onClick={() => addPreset(choice.url)}
                  className={`relative aspect-square rounded-lg overflow-hidden border transition group cursor-pointer ${
                    alreadyAdded
                      ? "border-black/40 opacity-70"
                      : "border-black/15 hover:border-black hover:opacity-100"
                  }`}
                  title={alreadyAdded ? "Already in gallery" : `Add ${choice.label} to gallery`}
                >
                  <img src={choice.url} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition flex items-center justify-center">
                    {alreadyAdded ? (
                      <span className="p-1 bg-black text-white rounded-full">
                        <Check className="w-3 h-3" />
                      </span>
                    ) : (
                      <span className="p-1 bg-white/90 text-black rounded-full opacity-0 group-hover:opacity-100 transition shadow">
                        <Plus className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* -------------------- VIDEO SECTION -------------------- */}
      <div className="pt-4 border-t border-black/10 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[12px] font-semibold text-black uppercase tracking-wider flex items-center gap-2">
              <Film className="w-4 h-4 text-black/70" />
              <span>Product Video (Optional)</span>
            </div>
            <p className="text-[11px] text-black/55 mt-0.5">
              Upload a product video from your device or paste a video link.
            </p>
          </div>
          {video && (
            <span className="text-[10px] font-medium uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              Video Attached
            </span>
          )}
        </div>

        {video ? (
          /* Video Preview & Controls */
          <div className="rounded-xl border border-black/15 bg-black/[0.02] p-4 space-y-3">
            <div className="relative aspect-video w-full max-h-72 bg-black rounded-lg overflow-hidden flex items-center justify-center">
              <video
                src={video}
                controls
                playsInline
                preload="metadata"
                className="w-full h-full object-contain"
              >
                Your browser does not support the video tag.
              </video>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="text-[11px] text-black/60 truncate max-w-sm">
                <span className="font-medium text-black">Source:</span>{" "}
                <span className="font-mono text-[10px]">{video}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg border border-black/20 text-[11px] font-medium text-black hover:bg-black/5 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" /> Replace Video
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onChangeVideo(null);
                    toast.info("Product video removed");
                  }}
                  className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition text-[11px] font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" /> Remove Video
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Video Upload Dropzone */
          <div className="space-y-3">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setVideoDragging(true);
              }}
              onDragLeave={() => setVideoDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setVideoDragging(false);
                handleVideoFile(e.dataTransfer.files?.[0]);
              }}
              onClick={() => videoInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  videoInputRef.current?.click();
                }
              }}
              className={`rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition ${
                videoDragging
                  ? "border-black bg-black/[0.04]"
                  : "border-black/20 hover:border-black/50 hover:bg-black/[0.02]"
              }`}
            >
              <div className="flex flex-col items-center gap-2 text-black/70">
                {videoUploading ? (
                  <div className="flex flex-col items-center gap-2 py-3 w-full max-w-xs">
                    <Loader2 className="w-6 h-6 animate-spin text-black" />
                    <div className="text-sm font-semibold text-black">
                      Uploading video… {videoProgress}%
                    </div>
                    <div className="w-full bg-black/10 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-black h-full transition-all duration-300"
                        style={{ width: `${videoProgress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-black/80">
                      <Film className="w-5 h-5" />
                    </div>
                    <div className="text-sm">
                      <span className="font-semibold text-black">Click to upload video</span> or
                      drag & drop
                    </div>
                    <div className="text-[11px] text-black/50">
                      MP4, WebM, MOV, OGG, MKV • Up to 50 MB
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Direct URL Accordion / Button */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setShowVideoUrlInput((v) => !v)}
                className="text-[11px] text-black/60 hover:text-black underline underline-offset-2 flex items-center gap-1 cursor-pointer"
              >
                {showVideoUrlInput ? "Hide video URL input" : "Or enter video URL directly"}
              </button>
            </div>

            {showVideoUrlInput && (
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="url"
                  placeholder="https://example.com/video.mp4"
                  value={videoUrlInput}
                  onChange={(e) => setVideoUrlInput(e.target.value)}
                  className="mt-input flex-1 text-sm font-mono"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!videoUrlInput.trim()) return;
                    onChangeVideo(videoUrlInput.trim());
                    setVideoUrlInput("");
                    setShowVideoUrlInput(false);
                    toast.success("Video URL set");
                  }}
                  className="px-4 py-2 rounded-lg bg-black text-white text-[11px] uppercase tracking-wider hover:bg-black/85 transition cursor-pointer"
                >
                  Set URL
                </button>
              </div>
            )}
          </div>
        )}

        <input
          ref={videoInputRef}
          type="file"
          accept={ACCEPTED_VIDEO_TYPES.join(",")}
          className="hidden"
          onChange={(e) => {
            handleVideoFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
