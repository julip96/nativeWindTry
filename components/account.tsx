import type { Session } from "@supabase/supabase-js";
import { H1, Pressable, Text, TextInput, View } from "dripsy";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { supabase } from "../utils/supabase";
import Avatar from "./Avatar";
import { ThemeButton } from "./ThemeButton";
import { ThemeCard } from "./ThemeCard";

type AccountProps = {
  session: Session | null;
};

export default function Account({ session }: AccountProps) {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [website, setWebsite] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (session) getProfile();
  }, [session]);

  async function deleteAccount() {
    try {
      Alert.alert(
        "Delete Account?",
        "This will permanently delete your profile and all stored data. This cannot be undone.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              const user = supabase.auth.getUser(); // hole aktuellen User
              const userId = (await user).data.user?.id;

              if (!userId) {
                Alert.alert("Error", "No user logged in.");
                return;
              }

              // CALL EDGE FUNCTION
              const { data, error } = await supabase.functions.invoke(
                "delete-user",
                { body: JSON.stringify({ userId }) },
              );

              if (error) {
                console.error(error);
                Alert.alert("Error", "Failed to delete account.");
                return;
              }

              // Log the user out locally
              await supabase.auth.signOut();
            },
          },
        ],
      );
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not delete account.");
    }
  }

  async function getProfile() {
    try {
      setLoading(true);

      if (!session?.user) throw new Error("No user on the session!");

      const { data, error } = await supabase
        .from("profiles")
        .select(`username, website, avatar_url`)
        .eq("id", session.user.id)
        .single();

      if (error) throw error;

      if (data) {
        setUsername(data.username);
        setWebsite(data.website);
        setAvatarUrl(data.avatar_url);
      }
    } catch (error) {
      if (error instanceof Error) Alert.alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile() {
    try {
      setLoading(true);

      if (!session?.user) throw new Error("No user on the session!");

      const updates = {
        id: session.user.id,
        username,
        website,
        avatar_url: avatarUrl,
        updated_at: new Date(),
      };

      const { error } = await supabase.from("profiles").upsert(updates);

      if (error) throw error;

      Alert.alert("Success", "Profile updated!");
      setIsEditing(false);
    } catch (error) {
      if (error instanceof Error) Alert.alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  // =========================
  //     HEADER VIEW (iOS)
  // =========================
  if (!isEditing) {
    return (
      <View sx={{ alignItems: "center" }}>
        <Avatar
          size={120}
          url={avatarUrl}
          onUpload={(path) => {
            setAvatarUrl(path);
            updateProfile();
          }}
        />

        <Text
          sx={{
            fontSize: 14,
            fontWeight: "$secondaryText",
            marginTop: 12,
            color: "$text",
          }}
        >
          Username: {username || "Username"}
        </Text>

        <Text sx={{ fontSize: 14, color: "$secondaryText", marginTop: 2 }}>
          Mail: {session?.user?.email}
        </Text>

        <Pressable
          onPress={() => setIsEditing(true)}
          sx={{
            marginTop: 16,
            paddingX: 16,
            paddingY: 8,
            backgroundColor: "$mutedBackground",
            borderRadius: 12,
            borderColor: "$border",
            borderWidth: 1,
          }}
        >
          <Text sx={{ color: "$text" }}>Edit</Text>
        </Pressable>
      </View>
    );
  }

  // =========================
  //     FULL EDITOR VIEW
  // =========================
  return (
    <View sx={{ padding: 16 }}>
      <Avatar
        size={160}
        url={avatarUrl}
        onUpload={(path) => setAvatarUrl(path)}
      />

      <Text sx={{ color: "$text", marginTop: 24 }}>Username</Text>
      <TextInput
        value={username}
        onChangeText={setUsername}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 8,
          marginTop: 4,
          borderRadius: 8,
          color: "black",
        }}
      />

      <Pressable
        onPress={updateProfile}
        disabled={loading}
        sx={{
          marginTop: 24,
          paddingY: 12,
          backgroundColor: "$primary",
          borderRadius: 12,
          alignItems: "center",
        }}
      >
        <Text sx={{ color: "white", fontWeight: "bold" }}>
          {loading ? "Saving..." : "Save"}
        </Text>
      </Pressable>

      <Pressable
        onPress={() => setIsEditing(false)}
        sx={{
          marginTop: 12,
          paddingY: 10,
          backgroundColor: "$mutedBackground",
          borderRadius: 12,
          alignItems: "center",
        }}
      >
        <Text sx={{ color: "$text" }}>Cancel</Text>
      </Pressable>

      <ThemeCard sx={{ margin: 16 }}>
        <H1 sx={{ fontSize: 22, marginBottom: 16, color: "$text" }}>
          Delete Account
        </H1>

        <ThemeButton
          title="Delete Account"
          onPress={() => deleteAccount()}
          sx={{
            flex: 1,
            paddingY: 10,
            borderRadius: 10,
            alignItems: "center",
            backgroundColor: "$primary",
          }}
        />
      </ThemeCard>
    </View>
  );
}
