import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useVideoCompression } from "@/hooks/useVideoCompression";
import { Film, Loader2, X, Link as LinkIcon, Zap, Upload as UploadIcon, Sparkles } from "lucide-react";
import { toast } from "sonner";
import * as tus from "tus-js-client";

const GENRES = ["Drama", "Comedy", "Horror", "Documentary", "Sci-Fi", "Animation", "Thriller", "Romance", "Action", "Experimental"];

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const TUS_CHUNK_SIZE = 6 * 1024 * 1024;

function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
}

function isMaxSizeExceededError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes("Maximum size exceeded") || message.includes("response code: 413");
}

function isValidVideoUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

type UploadMode = "file" | "url";

interface FilmUploadFormProps {
  profileId: string;
  onUploaded: () => void;
  onCancel: () => void;
}

const FilmUploadForm = ({ profileId, onUploaded, onCancel }: FilmUploadFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("");
  const [uploadMode, setUploadMode] = useState<UploadMode>("file");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [isVertical, setIsVertical] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const tusUploadRef = useRef<tus.Upload | null>(null);

  const compression = useVideoCompression();
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [compressionResult, setCompressionResult] = useState<{ originalSize: number; compressedSize: number } | null>(null);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiTags, setAiTags] = useState<string[]>([]);

  const handleVideoSelect = (file: File | null) => {
    setVideoFile(file);
    setCompressedFile(null);
    setCompressionResult(null);
    compression.reset();
  };

  const handleCompress = async () => {
    if (!videoFile) return;
    const result = await compression.compress(videoFile);
    if (result) {
      setCompressedFile(result.file);
      setCompressionResult({ originalSize: result.originalSize, compressedSize: result.compressedSize });
      if (result.compressedSize > MAX_FILE_SIZE) {
        toast.warning(`Compressed to ${formatFileSize(result.compressedSize)} — still over ${formatFileSize(MAX_FILE_SIZE)} limit. Consider using "Paste URL" mode.`);
      } else {
        toast.success(`Compressed: ${formatFileSize(result.originalSize)} → ${formatFileSize(result.compressedSize)}`);
      }
    }
  };

  const handleCancelCompression = () => {
    compression.cancel();
    setCompressedFile(null);
    setCompressionResult(null);
  };

  const handleCancelUpload = () => {
    if (tusUploadRef.current) {
      tusUploadRef.current.abort();
      tusUploadRef.current = null;
    }
    setUploading(false);
    setProgress(0);
    toast.info("Upload cancelled");
  };

  const fileToUpload = compressedFile || videoFile;
  const fileTooLarge = fileToUpload ? fileToUpload.size > MAX_FILE_SIZE : false;

  const handleGenerateAI = async () => {
    if (!title) { toast.error("Enter a title first"); return; }
    setGeneratingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-film-metadata", {
        body: { title, description, genre },
      });
      if (error) throw error;
      if (data?.description) setDescription(data.description);
      if (data?.tags) setAiTags(data.tags);
      toast.success("AI metadata generated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to generate metadata");
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (uploadMode === "file" && !fileToUpload) return;
    if (uploadMode === "url" && !videoUrl) return;

    if (uploadMode === "file" && fileTooLarge) {
      toast.error(`File is ${formatFileSize(fileToUpload!.size)}. Compress further or use "Paste URL" mode.`);
      return;
    }

    if (uploadMode === "url" && !isValidVideoUrl(videoUrl)) {
      toast.error("Please enter a valid video URL (https://...)");
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      let finalVideoUrl: string;

      if (uploadMode === "url") {
        finalVideoUrl = videoUrl;
      } else {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;
        if (!token) throw new Error("Not authenticated");

        const uploadFile = fileToUpload!;
        const videoExt = uploadFile.name.split(".").pop();
        const videoPath = `${profileId}/${Date.now()}.${videoExt}`;
        const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;

        await new Promise<void>((resolve, reject) => {
          const upload = new tus.Upload(uploadFile, {
            endpoint: `https://${projectId}.storage.supabase.co/storage/v1/upload/resumable`,
            retryDelays: [0, 3000, 5000, 10000, 20000],
            chunkSize: TUS_CHUNK_SIZE,
            headers: {
              authorization: `Bearer ${token}`,
              "x-upsert": "false",
            },
            uploadDataDuringCreation: false,
            removeFingerprintOnSuccess: true,
            metadata: {
              bucketName: "films",
              objectName: videoPath,
              contentType: uploadFile.type,
              cacheControl: "3600",
            },
            onError: (error) => {
              tusUploadRef.current = null;
              reject(error);
            },
            onProgress: (bytesUploaded, bytesTotal) => {
              setProgress(Math.round((bytesUploaded / bytesTotal) * 100));
            },
            onSuccess: () => {
              tusUploadRef.current = null;
              resolve();
            },
          });

          tusUploadRef.current = upload;
          upload.findPreviousUploads().then((previousUploads) => {
            if (previousUploads.length) {
              upload.resumeFromPreviousUpload(previousUploads[0]);
            }
            upload.start();
          });
        });

        const { data: videoUrlData } = supabase.storage.from("films").getPublicUrl(videoPath);
        finalVideoUrl = videoUrlData.publicUrl;
      }

      let thumbnailUrl = null;
      if (thumbnailFile) {
        const thumbExt = thumbnailFile.name.split(".").pop();
        const thumbPath = `${profileId}/thumb_${Date.now()}.${thumbExt}`;
        const { error: thumbError } = await supabase.storage
          .from("films")
          .upload(thumbPath, thumbnailFile, { upsert: false });

        if (!thumbError) {
          const { data: thumbUrlData } = supabase.storage.from("films").getPublicUrl(thumbPath);
          thumbnailUrl = thumbUrlData.publicUrl;
        }
      }

      const { error: insertError } = await supabase.from("films").insert({
        filmmaker_id: profileId,
        title,
        description,
        genre: genre || null,
        thumbnail_url: thumbnailUrl,
        video_url: finalVideoUrl,
        tags: aiTags.length > 0 ? aiTags : [],
        is_vertical: isVertical,
      } as any);

      if (insertError) throw insertError;

      toast.success("Film uploaded! It will be visible once approved by an admin.");
      onUploaded();
    } catch (err: unknown) {
      if (isMaxSizeExceededError(err) && fileToUpload) {
        toast.error(
          `Upload rejected by storage limit. File: ${formatFileSize(fileToUpload.size)}. Try compressing or using "Paste URL" mode.`
        );
      } else {
        const message = err instanceof Error ? err.message : "Upload failed";
        toast.error(message);
      }
    } finally {
      setUploading(false);
    }
  };

  const hasVideo = uploadMode === "file" ? !!fileToUpload : !!videoUrl;
  const isCompressing = compression.state === "loading" || compression.state === "compressing";

  return (
    <div className="border border-border p-8 mb-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold">Upload Film</h2>
        <button onClick={onCancel} className="text-muted-foreground hover:text-foreground transition-colors">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <input
          type="text"
          placeholder="Film Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="input-minimal font-body text-xl"
        />

        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="input-minimal font-body resize-none"
        />

        {/* AI Metadata Generator */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleGenerateAI}
            disabled={generatingAI || !title}
            className="flex items-center gap-2 text-sm px-4 py-2 border border-primary bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-body disabled:opacity-50"
          >
            {generatingAI ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {generatingAI ? "Generating..." : "AI Generate Description & Tags"}
          </button>
        </div>

        {/* AI Tags */}
        {aiTags.length > 0 && (
          <div>
            <label className="text-sm text-muted-foreground mb-2 block font-body">AI Tags</label>
            <div className="flex flex-wrap gap-1.5">
              {aiTags.map((tag, i) => (
                <span key={i} className="text-xs px-2 py-1 bg-accent text-accent-foreground border border-border font-body">
                  {tag}
                  <button
                    type="button"
                    onClick={() => setAiTags(prev => prev.filter((_, idx) => idx !== i))}
                    className="ml-1 text-muted-foreground hover:text-foreground"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="text-sm text-muted-foreground mb-3 block font-body">Genre</label>
          <div className="flex flex-wrap gap-2">
            {GENRES.map((g) => (
              <button
                type="button"
                key={g}
                onClick={() => setGenre(genre === g ? "" : g)}
                className={`text-sm px-3 py-1.5 border transition-all font-body ${
                  genre === g
                    ? "border-foreground bg-foreground text-background"
                    : "border-border hover:border-foreground"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Orientation toggle */}
        <div>
          <label className="text-sm text-muted-foreground mb-3 block font-body">Orientation</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsVertical(false)}
              className={`flex items-center gap-2 text-sm px-4 py-2 border transition-all font-body ${
                !isVertical
                  ? "border-foreground bg-foreground text-background"
                  : "border-border hover:border-foreground"
              }`}
            >
              <svg width="16" height="12" viewBox="0 0 16 12" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="1" width="14" height="10" rx="1" /></svg>
              Horizontal
            </button>
            <button
              type="button"
              onClick={() => setIsVertical(true)}
              className={`flex items-center gap-2 text-sm px-4 py-2 border transition-all font-body ${
                isVertical
                  ? "border-foreground bg-foreground text-background"
                  : "border-border hover:border-foreground"
              }`}
            >
              <svg width="12" height="16" viewBox="0 0 12 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="1" width="10" height="14" rx="1" /></svg>
              Vertical (Reel)
            </button>
          </div>
        </div>

        {/* Upload mode toggle */}
        <div>
          <label className="text-sm text-muted-foreground mb-3 block font-body">Video Source</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setUploadMode("file"); setVideoUrl(""); }}
              className={`flex items-center gap-2 text-sm px-4 py-2 border transition-all font-body ${
                uploadMode === "file"
                  ? "border-foreground bg-foreground text-background"
                  : "border-border hover:border-foreground"
              }`}
            >
              <Film size={16} />
              Upload File
            </button>
            <button
              type="button"
              onClick={() => { setUploadMode("url"); setVideoFile(null); setCompressedFile(null); setCompressionResult(null); compression.reset(); }}
              className={`flex items-center gap-2 text-sm px-4 py-2 border transition-all font-body ${
                uploadMode === "url"
                  ? "border-foreground bg-foreground text-background"
                  : "border-border hover:border-foreground"
              }`}
            >
              <LinkIcon size={16} />
              Paste URL
            </button>
          </div>
        </div>

        {uploadMode === "file" ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-3 block font-body">
                Video File * <span className="text-xs">(max {formatFileSize(MAX_FILE_SIZE)} after compression)</span>
              </label>
              <label className="border-2 border-dashed border-border hover:border-foreground transition-colors p-10 flex flex-col items-center cursor-pointer">
                <Film size={32} className="text-muted-foreground mb-3" />
                <span className="text-sm text-muted-foreground font-body">
                  {videoFile
                    ? `${videoFile.name} — ${formatFileSize(videoFile.size)}`
                    : "Click to select video"}
                </span>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleVideoSelect(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
            </div>

            {videoFile && (
              <div className="border border-border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-body font-medium flex items-center gap-2">
                    <Zap size={14} />
                    Compression (H.264, 1080p max)
                  </span>
                  {!isCompressing && compression.state !== "done" && (
                    <button
                      type="button"
                      onClick={handleCompress}
                      className="text-sm px-3 py-1 border border-foreground bg-foreground text-background hover:opacity-90 transition-opacity font-body"
                    >
                      Compress
                    </button>
                  )}
                  {isCompressing && (
                    <button
                      type="button"
                      onClick={handleCancelCompression}
                      className="text-sm text-destructive hover:text-destructive/80 flex items-center gap-1 font-body"
                    >
                      <X size={14} />
                      Cancel
                    </button>
                  )}
                </div>

                {isCompressing && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground font-body">
                      <span>{compression.state === "loading" ? "Loading compressor…" : `Compressing… ${compression.progress}%`}</span>
                    </div>
                    <div className="w-full bg-muted h-1">
                      <div
                        className="bg-foreground h-1 transition-all duration-300"
                        style={{ width: `${compression.state === "loading" ? 0 : compression.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground font-body truncate">{compression.log}</p>
                  </div>
                )}

                {compressionResult && (
                  <div className="text-sm font-body space-y-1">
                    <p>
                      {formatFileSize(compressionResult.originalSize)} → <strong>{formatFileSize(compressionResult.compressedSize)}</strong>
                      <span className="text-muted-foreground ml-2">
                        ({Math.round((1 - compressionResult.compressedSize / compressionResult.originalSize) * 100)}% smaller)
                      </span>
                    </p>
                    {fileTooLarge && (
                      <p className="text-destructive text-xs">
                        Still over {formatFileSize(MAX_FILE_SIZE)} limit. Use "Paste URL" mode instead.
                      </p>
                    )}
                    {!fileTooLarge && (
                      <p className="text-xs text-muted-foreground">✓ Ready to upload</p>
                    )}
                  </div>
                )}

                {videoFile.size <= MAX_FILE_SIZE && !compressionResult && compression.state === "idle" && (
                  <p className="text-xs text-muted-foreground font-body">
                    File is already under {formatFileSize(MAX_FILE_SIZE)} — compression is optional.
                  </p>
                )}

                {compression.state === "error" && (
                  <p className="text-xs text-destructive font-body">{compression.log}</p>
                )}
              </div>
            )}
          </div>
        ) : (
          <div>
            <label className="text-sm text-muted-foreground mb-3 block font-body">
              Video URL *
            </label>
            <input
              type="url"
              placeholder="https://example.com/video.mp4"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="input-minimal font-body"
              required={uploadMode === "url"}
            />
            {videoUrl && isValidVideoUrl(videoUrl) && (
              <p className="text-xs text-muted-foreground mt-2 font-body">
                ✓ Valid URL — this will be used directly as the video source
              </p>
            )}
          </div>
        )}

        {/* Thumbnail */}
        <div>
          <label className="text-sm text-muted-foreground mb-3 block font-body">
            Thumbnail (optional)
          </label>
          <label className="border-2 border-dashed border-border hover:border-foreground transition-colors p-6 flex flex-col items-center cursor-pointer">
            <UploadIcon size={24} className="text-muted-foreground mb-2" />
            <span className="text-sm text-muted-foreground font-body">
              {thumbnailFile ? thumbnailFile.name : "Click to select image"}
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
              className="hidden"
            />
          </label>
        </div>

        {uploading && uploadMode === "file" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm font-body">
              <span className="text-muted-foreground">Uploading… {progress}%</span>
              <button
                type="button"
                onClick={handleCancelUpload}
                className="text-destructive hover:text-destructive/80 flex items-center gap-1"
              >
                <X size={14} />
                Cancel
              </button>
            </div>
            <div className="w-full bg-muted h-1">
              <div
                className="bg-foreground h-1 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={uploading || !hasVideo || isCompressing || fileTooLarge}
          className="btn-outline-dark w-full flex items-center justify-center gap-2 font-body"
        >
          {uploading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              {uploadMode === "url" ? "Saving..." : "Uploading..."}
            </>
          ) : (
            "Upload Film"
          )}
        </button>
      </form>
    </div>
  );
};

export default FilmUploadForm;
