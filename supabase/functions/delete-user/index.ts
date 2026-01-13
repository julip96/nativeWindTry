import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
    const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")! // required
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return new Response(JSON.stringify({ error: "Not authenticated" }), {
            status: 401,
        })
    }

    // delete avatar file(s)
    await supabase.storage.from("avatars").remove([`${user.id}/avatar.jpeg`])

    // delete profile
    await supabase.from("profiles").delete().eq("id", user.id)

    // delete user from auth
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id)

    if (deleteError) {
        return new Response(JSON.stringify({ error: deleteError.message }), {
            status: 400,
        })
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 })
})
