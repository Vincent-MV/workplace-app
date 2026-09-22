import { supabase } from "@/lib/supabase";

export const MAX_PODCASTS = 3;
export const MAX_FILE_SIZE_MB = 50;

export async function uploadPodcastAction(userId: string, file: File, title: string) {
  // 1. Client-side file size validation
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    return { success: false, error: `File is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.` };
  }

  // 2. Check if user has reached the 3-file limit
  const { data: existingPodcasts, error: countError } = await supabase
    .from("podcasts")
    .select("id")
    .eq("user_id", userId);

  if (countError) {
    return { success: false, error: "Failed to verify podcast limit." };
  }

  if ((existingPodcasts?.length ?? 0) >= MAX_PODCASTS) {
    return { success: false, error: `You have reached the maximum limit of ${MAX_PODCASTS} audio files.` };
  }

  // 3. Upload to Supabase Storage
  const fileExt = file.name.split('.').pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("Audio")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    return { success: false, error: "Failed to upload file to storage. Check bucket permissions." };
  }

  // 4. Get Public URL
  const { data: { publicUrl } } = supabase.storage
    .from("Audio")
    .getPublicUrl(filePath);

  // 5. Insert into Database
  const { error: dbError } = await supabase.from("podcasts").insert({
    user_id: userId,
    title: title.trim(),
    audio_url: publicUrl,
    duration_secs: 0,
    play_position: 0,
  });

  if (dbError) {
    // Cleanup: Remove the file from storage if the database insert fails
    await supabase.storage.from("Audio").remove([filePath]);
    return { success: false, error: "Failed to save podcast to database." };
  }

  return { success: true, error: null };
}