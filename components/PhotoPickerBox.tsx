import React, { useState } from "react";
import { Image, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { View, Text } from "dripsy";
import { Ionicons } from "@expo/vector-icons";

export default function PhotoPickerBox({
    uri,        // neues Prop
    onChange,
}: {
    uri?: string;
    onChange?: (uri: string) => void;
}) {
    const [imageUri, setImageUri] = useState<string | null>(uri || null);
    const [loading, setLoading] = useState(false);

    // Synchronisiere State, falls uri von außen geändert wird (EditScreen)
    React.useEffect(() => {
        if (uri) setImageUri(uri);
    }, [uri]);

    function confirmDelete() {
        Alert.alert(
            "Delete Image",
            "Are you sure you want to delete this image?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: deleteImage },
            ],
            { cancelable: true }
        );
    }

    async function deleteImage() {
        setLoading(true);

        try {
            // Hier kannst du auch Supabase Storage löschen, falls du die Bilder dort speicherst
            setImageUri(null);
            onChange?.("");
        } catch (e) {
            console.error("Error deleting image: ", e);
        } finally {
            setLoading(false);
        }
    }

    return (
        <TouchableOpacity onPress={confirmDelete} activeOpacity={0.85}>
            <View
                sx={{
                    width: "100%",
                    height: 200,
                    bg: "white",
                    borderRadius: "l",
                    borderWidth: 1,
                    borderColor: "$border",
                    justifyContent: "center",
                    alignItems: "center",
                    overflow: "hidden",
                    mb: 18,
                    shadowColor: "#000",
                    shadowOpacity: 0.12,
                    shadowRadius: 6,
                    elevation: 4,
                }}
            >
                {imageUri ? (
                    <Image
                        source={{ uri: imageUri }}
                        style={{ width: "100%", height: "100%", resizeMode: "cover" }}
                    />
                ) : loading ? (
                    <ActivityIndicator size="large" />
                ) : (
                    <Text sx={{ color: "$muted", fontSize: 16 }}>Tap to add photo</Text>
                )}

                {imageUri && !loading && (
                    <View
                        sx={{
                            position: "absolute",
                            bottom: 10,
                            right: 10,
                            bg: "rgba(0,0,0,0.55)",
                            px: 10,
                            py: 6,
                            borderRadius: "full",
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 6,
                        }}
                    >
                        <Ionicons name="trash" size={16} color="red" />
                        <Text sx={{ color: "white", fontSize: 14 }}>Delete</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
}
