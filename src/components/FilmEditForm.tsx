import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Upload, X, Image, Link as LinkIcon } from "lucide-react";

const GENRES = ["Drama", "Comedy", "Horror", "Documentary", "Sci-Fi", "Animation", "Thriller", "Romance", "Action", "Experimental"];

interface FilmEditFormProps {
  filmId: string;
  profileId: string;
  initialTitle: string;
  initialDescription: string;
  initialGenre: string;
  initialThumbnailUrl: string | null;
  initialVideoUrl: string | null;
  onSaved: () => void;
  onCancel: () => void;
}

const FilmEditForm = ({
  filmId,
  profileId,
  initialTitle,
  initialDescription,
  initialGenre,
  initialThumbnailUrl,
  initialVideoUrl,
  onSaved,
  onCancel,
}: FilmEditFormProps) => {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [genre, setGenre] = useState(initialGenre);
  const [thumbnailUrl, setThumbnailUrl] = useState(initialThumbnailUrl);
  const [videoUrl, setVideoUrl] = useState(initialVideoUrl || "");
  const [newThumbnailFile, setNewThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleThumbnailSelect = (file: File | null) => {
    setNewThumbnailFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setThumbnailPreview(url);
    } else {
      setThumbnailPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let finalThumbnailUrl = thumbnailUrl;

      // Upload new thumbnail if selected
      if (newThumbnailFile) {
        const ext = newThumbnailFile.name.split(".").pop();
        const path = `${profileId}/thumb_${Date.now()}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("films")
          .upload(path, newThumbnailFile, { upsert: false });

        if (uploadErr) throw uploadErr;

        const { data: urlData } = supabase.storage.from("films").getPublicUrl(path);
        finalThumbnailUrl = urlData.publicUrl;
      }

      const updateData: Record<string, any> = {
        title,
        description,
        genre: genre || null,
        thumbnail_url: finalThumbnailUrl,
      };

      // Only update video_url if it changed
      if (videoUrl !== (initialVideoUrl || "")) {
        updateData.video_url = videoUrl || null;
      }

      const { error } = await supabase
        .from("films")
        .update(updateData)
        .eq("id", filmId);
      if (error) throw error;
      toast.success("Film updated");
      onSaved();
    } catch (err: any) {
      toast.error(err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const displayThumb = thumbnailPreview || thumbnailUrl;

  return (
    <form onSubmit={handleSubmit} className="border border-border p-6 space-y-5 mb-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold">Edit Film</h3>
        <button type="button" onClick={onCancel} className="text-muted-foreground hover:text-foreground transition-colors">
          <X size={18} />
        </button>
      </div>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        required
        className="input-minimal font-body"
      />

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        rows={2}
        className="input-minimal font-body resize-none"
      />

      <div className="flex flex-wrap gap-2">
        {GENRES.map((g) => (
          <button
            type="button"
            key={g}
            onClick={() => setGenre(genre === g ? "" : g)}
            className={`text-xs px-2 py-1 border transition-all font-body ${
              genre === g
                ? "border-foreground bg-foreground text-background"
                : "border-border hover:border-foreground"
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Poster / Thumbnail */}
      <div>
        <label className="text-sm text-muted-foreground mb-2 block font-body flex items-center gap-1.5">
          <Image size={14} />
          Poster / Thumbnail
        </label>
        {displayThumb && (
          <div className="relative mb-3 w-48">
            <img
              src={displayThumb}
              alt="Thumbnail preview"
              className="w-full aspect-video object-cover border border-border"
            />
            <button
              type="button"
              onClick={() => {
                setThumbnailUrl(null);
                setNewThumbnailFile(null);
                setThumbnailPreview(null);
              }}
              className="absolute top-1 right-1 bg-background/80 backdrop-blur border border-border p-1 hover:bg-destructive hover:text-destructive-foreground transition-colors"
              title="Remove thumbnail"
            >
              <X size={12} />
            </button>
          </div>
        )}
        <label className="border-2 border-dashed border-border hover:border-foreground transition-colors p-4 flex items-center gap-3 cursor-pointer">
          <Upload size={18} className="text-muted-foreground shrink-0" />
          <span className="text-sm text-muted-foreground font-body">
            {newThumbnailFile ? newThumbnailFile.name : "Click to upload new poster image"}
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleThumbnailSelect(e.target.files?.[0] || null)}
            className="hidden"
          />
        </label>
      </div>

      {/* Video URL */}
      <div>
        <label className="text-sm text-muted-foreground mb-2 block font-body flex items-center gap-1.5">
          <LinkIcon size={14} />
          Video URL
        </label>
        <input
          type="url"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="https://example.com/video.mp4"
          className="input-minimal font-body"
        />
        {videoUrl && (
          <p className="text-xs text-muted-foreground mt-1 font-body">
            Change the URL to update the video source, or leave as-is to keep current video.
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="btn-outline-dark text-sm font-body flex items-center gap-2">
          {saving ? <Loader2 size={14} className="animate-spin" /> : null}
          Save
        </button>
        <button type="button" onClick={onCancel} className="text-sm text-muted-foreground hover:text-foreground font-body">
          Cancel
        </button>
      </div>
    </form>
  );
};

export default FilmEditForm;
