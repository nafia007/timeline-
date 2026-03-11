import { useState, useRef, useCallback } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL, fetchFile } from "@ffmpeg/util";

export type CompressionState = "idle" | "loading" | "compressing" | "done" | "error";

interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
}

export function useVideoCompression() {
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const [state, setState] = useState<CompressionState>("idle");
  const [progress, setProgress] = useState(0);
  const [log, setLog] = useState("");
  const abortRef = useRef(false);

  const compress = useCallback(async (inputFile: File): Promise<CompressionResult | null> => {
    abortRef.current = false;
    setState("loading");
    setProgress(0);
    setLog("Loading compressor…");

    try {
      // Initialize FFmpeg
      if (!ffmpegRef.current) {
        const ffmpeg = new FFmpeg();
        ffmpeg.on("progress", ({ progress: p }) => {
          if (abortRef.current) return;
          setProgress(Math.min(Math.round(p * 100), 100));
        });
        ffmpeg.on("log", ({ message }) => {
          setLog(message);
        });

        const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";
        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
        });
        ffmpegRef.current = ffmpeg;
      }

      if (abortRef.current) return null;

      const ffmpeg = ffmpegRef.current;
      setState("compressing");
      setProgress(0);
      setLog("Compressing video…");

      // Write input file
      const inputName = "input" + getExtension(inputFile.name);
      const outputName = "output.mp4";
      await ffmpeg.writeFile(inputName, await fetchFile(inputFile));

      if (abortRef.current) {
        await cleanup(ffmpeg, inputName);
        return null;
      }

      // Compress: H.264, max 1080p, CRF 28 (good balance), fast preset
      await ffmpeg.exec([
        "-i", inputName,
        "-vf", "scale='min(1920,iw)':'min(1080,ih)':force_original_aspect_ratio=decrease:force_divisible_by=2",
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "28",
        "-c:a", "aac",
        "-b:a", "128k",
        "-movflags", "+faststart",
        "-y",
        outputName,
      ]);

      if (abortRef.current) {
        await cleanup(ffmpeg, inputName, outputName);
        return null;
      }

      // Read output
      const data = await ffmpeg.readFile(outputName);
      const uint8 = data instanceof Uint8Array ? data : new TextEncoder().encode(data as string);
      const blob = new Blob([new Uint8Array(uint8)], { type: "video/mp4" });
      const compressedFile = new File(
        [blob],
        inputFile.name.replace(/\.[^.]+$/, ".mp4"),
        { type: "video/mp4" }
      );

      // Cleanup
      await cleanup(ffmpeg, inputName, outputName);

      setState("done");
      setProgress(100);
      setLog("Compression complete");

      return {
        file: compressedFile,
        originalSize: inputFile.size,
        compressedSize: compressedFile.size,
      };
    } catch (err) {
      console.error("Compression error:", err);
      setState("error");
      setLog(err instanceof Error ? err.message : "Compression failed");
      return null;
    }
  }, []);

  const cancel = useCallback(() => {
    abortRef.current = true;
    if (ffmpegRef.current) {
      try {
        ffmpegRef.current.terminate();
        ffmpegRef.current = null;
      } catch { /* ignore */ }
    }
    setState("idle");
    setProgress(0);
    setLog("");
  }, []);

  const reset = useCallback(() => {
    setState("idle");
    setProgress(0);
    setLog("");
  }, []);

  return { state, progress, log, compress, cancel, reset };
}

function getExtension(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot >= 0 ? filename.slice(dot) : "";
}

async function cleanup(ffmpeg: FFmpeg, ...files: string[]) {
  for (const f of files) {
    try {
      await ffmpeg.deleteFile(f);
    } catch { /* ignore */ }
  }
}
