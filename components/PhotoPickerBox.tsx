import React, { useState } from "react";
import { Image, TouchableOpacity, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { View, Text } from "dripsy";
import { Ionicons } from "@expo/vector-icons";

export default function PhotoPickerBox({ onChange }: { onChange?: (uri: string) => void }) {
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function pickImage() {
        try {
            setLoading(true);
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.7,
            });

            if (!result.canceled) {
                const uri = result.assets[0].uri;
                setImageUri(uri);
                onChange?.(uri);
            }
        } catch (err) {
            console.warn("Image pick error:", err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <TouchableOpacity onPress={pickImage} activeOpacity={0.85}>
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
                {/* Image */}
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

                {/* Floating "Change" button */}
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
                        <Ionicons name="swap-horizontal" size={16} color="white" />
                        <Text sx={{ color: "white", fontSize: 14 }}>Change</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
}
