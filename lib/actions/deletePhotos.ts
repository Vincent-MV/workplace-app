import { supabase } from "@/lib/supabase";

export async function deletePhotoAction(photoId: string, imageUrl: string, userId: string) {
  try {
    const urlParts = imageUrl.split("/");
    const filePath = urlParts.slice(-2).join("/");

    // Delete from Storage
    await supabase.storage.from("Photos").remove([filePath]);

    // Delete from Database
    const { error } = await supabase.from("photos").delete().eq("id", photoId).eq("user_id", userId);
    if (error) return { success: false, error: "Failed to delete photo." };

    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: "An unexpected error occurred." };
  }
}