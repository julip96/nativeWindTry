import { supabase } from "../../utils/supabase";
import { decode } from "base64-arraybuffer";

export async function uploadRecipeImagePrivateBucketSupabase(fileUri: string, userId: string): Promise<string | null> {

    if (!userId) {
        console.error("Cannot save image: No user ID");
        return null;
    }

    const imageId = `${Date.now()}.jpg`;

    try {

        console.log("base64 length:", fileUri.length);

        const imageBuffer = decode(fileUri);

        console.log("Saving image for user: ", userId);

        const { data, error } = await supabase.storage
            .from('recipe_images')
            .upload(`${userId}/${imageId}`, imageBuffer, {
                contentType: 'image/jpeg',
            });

        if (error) {
            console.error("Error uploading image: ", error);
            return null;
        } else {
            console.log("Image uploaded successfully: ", data);
            // Return the path to the uploaded image in Supabase Storage "folder/image.jpg"
            return data.path;
        }

    }
    catch (e) {
        console.error("Error uploading image: ", e);
        return null;
    }

}