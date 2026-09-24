import { supabase } from "@/lib/supabase";

export const MAX_PHOTOS = 5;
export const MAX_FILE_SIZE_MB = 10; // Images are smaller than audio

export async function uploadPhotoAction(userId: string, file: File, title: string) {
  // 1. File size validation
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    return { success: false, error: `File is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.` };
  }

  // 2. Check 5-photo limit
  const { data: existingPhotos, error: countError } = await supabase
    .from("photos")
    .select("id")
    .eq("user_id", userId);

  if (countError) return { success: false, error: "Failed to verify photo limit." };
  if ((existingPhotos?.length ?? 0) >= MAX_PHOTOS) {
    return { success: false, error: `You have reached the maximum limit of ${MAX_PHOTOS} photos.` };
  }

  // 3. Upload to Supabase Storage bucket named "Photos"
  const fileExt = file.name.split('.').pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("Photos")
    .upload(filePath, file, { cacheControl: "3600", upsert: false });

  if (uploadError) return { success: false, error: "Failed to upload image." };

  // 4. Get Public URL
  const { data: { publicUrl } } = supabase.storage.from("Photos").getPublicUrl(filePath);

  // 5. Insert into Database
  const { error: dbError } = await supabase.from("photos").insert({
    user_id: userId,
    title: title.trim(),
    image_url: publicUrl,
    uploaded_at: new Date().toISOString(),
  });

  if (dbError) {
    await supabase.storage.from("Photos").remove([filePath]); // Cleanup on DB fail
    return { success: false, error: "Failed to save photo to database." };
  }

  return { success: true, error: null };
}