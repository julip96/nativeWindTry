import React, { useEffect, useState } from "react";
import { View, Text, TextInput, ScrollView, Image } from "dripsy";
import { Pressable, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "@/utils/supabase";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function EditRecipeScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const [recipe, setRecipe] = useState({
        title: "",
        ingredients: "",
        instructions: "",
        image: "",
    });

    useEffect(() => {
        const loadRecipe = async () => {
            if (!id) return;
            try {
                const { data, error } = await supabase
                    .from("recipes")
                    .select("*")
                    .eq("id", id)
                    .single();
                if (error) throw error;
                setRecipe({
                    title: data.title || "",
                    ingredients: data.ingredients || "",
                    instructions: data.instructions || "",
                    image: data.image_url || "",
                });
            } catch (e) {
                console.error("Error loading recipe:", e);
                Alert.alert("Error", "Could not load recipe.");
            }
        };
        loadRecipe();
    }, [id]);

    function handleChange(key: keyof typeof recipe, value: string) {
        setRecipe((prev) => ({ ...prev, [key]: value }));
    }

    async function handlePickImage() {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert("Permission required", "We need access to your photos!");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled && result.assets.length > 0) {
            handleChange("image", result.assets[0].uri);
        }
    }

    async function handleTakePhoto() {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
            Alert.alert("Permission required", "We need access to your camera!");
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled && result.assets.length > 0) {
            handleChange("image", result.assets[0].uri);
        }
    }

    // 💾 Update recipe
    async function handleUpdateRecipe() {
        if (!id) {
            Alert.alert("Error", "Missing recipe ID.");
            return;
        }

        try {
            const { error } = await supabase
                .from("recipes")
                .update({
                    title: recipe.title,
                    ingredients: recipe.ingredients,
                    instructions: recipe.instructions,
                    image_url: recipe.image,
                })
                .eq("id", id);

            if (error) throw error;

            Alert.alert("Success", "Recipe updated!");
            router.replace((`/recipesListScreen/${id}`))

        } catch (e) {
            console.error("Error updating recipe:", e);
            Alert.alert("Error", "Could not update recipe.");
        }
    }

    return (
        <ScrollView sx={{ p: "m", bg: "$background", flex: 1 }}>
            <View>
                <Text variant="heading" sx={{ mb: "m" }}>
                    Edit Recipe
                </Text>

                <TextInput
                    sx={{ bg: "$background", mb: "s" }}
                    placeholder="Recipe Title"
                    value={recipe.title}
                    onChangeText={(text) => handleChange("title", text)}
                />

                {/* 📸 Image Buttons */}
                <View sx={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Pressable
                        android_ripple={{ color: "#ccc" }}
                        onPress={handlePickImage}
                        style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                    >
                        <View
                            sx={{
                                bg: "$secondary",
                                p: "m",
                                borderRadius: "m",
                                alignItems: "center",
                                justifyContent: "center",
                                mt: "s",
                                width: 150,
                            }}
                        >
                            <Text sx={{ color: "white", fontWeight: "bold" }}>From Gallery</Text>
                        </View>
                    </Pressable>

                    <Pressable
                        android_ripple={{ color: "#ccc" }}
                        onPress={handleTakePhoto}
                        style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                    >
                        <View
                            sx={{
                                bg: "$primary",
                                p: "m",
                                borderRadius: "m",
                                alignItems: "center",
                                justifyContent: "center",
                                mt: "s",
                                width: 150,
                            }}
                        >
                            <Text sx={{ color: "white", fontWeight: "bold" }}>Take Photo</Text>
                        </View>
                    </Pressable>
                </View>

                {/* ✅ Preview selected image */}
                {recipe.image ? (
                    <View
                        sx={{
                            alignItems: "center",
                            justifyContent: "center",
                            mt: "m",
                            mb: "m",
                        }}
                    >
                        <Image
                            source={{ uri: recipe.image }}
                            style={{
                                width: 200,
                                height: 200,
                                borderRadius: 10,
                                resizeMode: "cover",
                            }}
                        />
                    </View>
                ) : null}

                <TextInput
                    sx={{ bg: "$background", mb: "s" }}
                    placeholder="Ingredients"
                    multiline
                    value={recipe.ingredients}
                    onChangeText={(text) => handleChange("ingredients", text)}
                />

                <TextInput
                    sx={{ bg: "$background", mb: "s" }}
                    placeholder="Instructions"
                    multiline
                    value={recipe.instructions}
                    onChangeText={(text) => handleChange("instructions", text)}
                />

                {/* 💾 Update Button */}
                <Pressable
                    android_ripple={{ color: "#ccc" }}
                    onPress={handleUpdateRecipe}
                    style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                >
                    <View
                        sx={{
                            bg: "$primary",
                            p: "m",
                            borderRadius: "m",
                            alignItems: "center",
                            justifyContent: "center",
                            mt: "s",
                        }}
                    >
                        <Text sx={{ color: "white", fontWeight: "bold" }}>Save Changes</Text>
                    </View>
                </Pressable>
            </View>
        </ScrollView>
    );
}
