

## Resumable Film Uploads (up to 50GB)

### Problem
The current upload uses the standard Supabase storage `upload()` method, which has a ~50MB limit. Large video files fail silently or timeout.

### Solution
Replace the standard upload with the **TUS resumable upload protocol**, which Supabase Storage natively supports. This allows files up to 50GB and automatically resumes interrupted uploads.

### Changes

**1. Install `tus-js-client` dependency**

Add the `tus-js-client` package for resumable upload support.

**2. Update `src/pages/Upload.tsx`**

- Add a **file size display** when a video is selected (e.g., "video.mp4 — 1.2 GB")
- Add a **client-side max file size check** (e.g., 5GB limit with clear error message)
- Replace `supabase.storage.from("films").upload(...)` with a TUS upload using `tus-js-client`:
  - Endpoint: `https://{projectId}.supabase.co/storage/v1/upload/resumable`
  - Authorization header from current user session
  - Chunk size of ~6MB for reliable uploads
  - `onProgress` callback to drive a **real-time progress bar** (currently the progress is faked with static percentages)
  - `onError` and `onSuccess` callbacks for proper error handling and completion
- Add a **Cancel Upload** button that aborts the TUS upload mid-stream
- Keep thumbnail upload as standard (small files don't need TUS)

### Technical Details

```text
Before:
  supabase.storage.from("films").upload(path, file)
  Progress: fake (10% -> 20% -> 60% -> 80% -> 100%)

After:
  new tus.Upload(file, {
    endpoint: `https://${projectId}.supabase.co/storage/v1/upload/resumable`,
    headers: { authorization: `Bearer ${token}`, ... },
    chunkSize: 6 * 1024 * 1024,
    metadata: { bucketName: "films", objectName: path, ... },
    onProgress: (bytesUploaded, bytesTotal) => {
      setProgress(Math.round((bytesUploaded / bytesTotal) * 100))
    },
    onSuccess: () => { /* insert film record, navigate */ },
    onError: (err) => { /* toast error, allow retry */ }
  })
  Progress: real percentage based on bytes uploaded
```

### User Experience Improvements
- Real progress percentage instead of fake jumps
- File size shown before upload begins
- Cancel button to abort long uploads
- Automatic retry on network interruptions
- Clear error if file exceeds size limit

