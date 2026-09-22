import { supabase } from "@/lib/supabase";

export async function deletePodcastAction(podcastId: string, audioUrl: string, userId: string) {
  try {
    // 1. Extract file path from the public URL
    // URL format: https://[project].supabase.co/storage/v1/object/public/Audio/[userId]/[fileName]
    const urlParts = audioUrl.split("/");
    const filePath = urlParts.slice(-2).join("/"); // Gets "userId/fileName"

    // 2. Delete from Supabase Storage
    const { error: storageError } = await supabase.storage
      .from("Audio")
      .remove([filePath]);

    if (storageError) {
      console.error("Storage deletion error:", storageError);
      // Continue anyway - we still want to remove the database record
    }

    // 3. Delete from Database
    const { error: dbError } = await supabase
      .from("podcasts")
      .delete()
      .eq("id", podcastId)
      .eq("user_id", userId); // Security: ensure user owns this podcast

    if (dbError) {
      return { success: false, error: "Failed to delete podcast from database." };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error("Delete error:", error);
    return { success: false, error: "An unexpected error occurred." };
  }
}